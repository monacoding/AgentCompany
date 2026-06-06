import { inferCapabilitiesFromTitle, inferRoleFromTitle, getTitlePersonaTone, getTitleRoleSummary } from './title-inference';
import { ProviderEngine } from '../providers';
import { AgentRole } from '../types';
import { CredentialsService } from '../services/credentials';

export interface GeneratedAgentProfile {
  role: AgentRole;
  description: string;
  persona: string;
  knowledge: string;
  capabilities: string[];
}

const ROLE_KEYWORDS: { role: AgentRole; pattern: RegExp }[] = [
  { role: 'researcher', pattern: /리서치|조사|크롤|crawl|research|검색|수집|pdf|다운로드/i },
  { role: 'frontend', pattern: /프론트|frontend|ui|ux|react|vue|화면|디자인/i },
  { role: 'backend', pattern: /백엔드|backend|api|서버|database|db|코드|개발/i },
  { role: 'qa', pattern: /qa|테스트|test|품질|검증|bug/i },
  { role: 'writer', pattern: /작가|writer|문서|글쓰|카피|콘텐츠/i },
  { role: 'designer', pattern: /디자이너|design|figma|브랜드/i },
  { role: 'devops', pattern: /devops|배포|deploy|docker|ci\/cd|인프라/i },
  { role: 'pm', pattern: /pm|매니저|manager|기획|조율|위임|프로젝트/i },
];

export function inferRoleFromBrief(brief: string): AgentRole {
  for (const { role, pattern } of ROLE_KEYWORDS) {
    if (pattern.test(brief)) return role;
  }
  return 'pm';
}

function extractCapabilities(brief: string, role: AgentRole): string[] {
  const caps = new Set<string>([`role:${role}`]);
  if (/코드|code|개발/.test(brief)) caps.add('code-gen');
  if (/리서치|조사|검색/.test(brief)) caps.add('research');
  if (/문서|보고|report/.test(brief)) caps.add('report');
  if (/api|연동/.test(brief)) caps.add('api');
  if (/친절|상냥|애교/.test(brief)) caps.add('persona-friendly');
  return [...caps];
}

export function generateProfileFromBrief(
  name: string,
  title: string,
  brief: string,
  slug: string,
  roleOverride?: AgentRole
): GeneratedAgentProfile {
  const jobTitle = title.trim() || name.trim();
  const role = roleOverride ?? inferRoleFromTitle(jobTitle);
  const roleDesc = getTitleRoleSummary(jobTitle);
  const tone = getTitlePersonaTone(jobTitle);

  const description = `${name} (${jobTitle}) — ${roleDesc}\n\n${brief.trim()}`;

  const persona = `# ${name} (${jobTitle}) — 페르소나

## 직책
${jobTitle} — ${roleDesc}

## 사용자 정의 (능력·성향)
${brief.trim()}

## 말투
- ${tone}

## 행동 원칙
- 직책(${jobTitle})에 맞는 전문성으로 업무 수행
- CEO(대표님)에게 존중과 결과 중심으로 보고
- 산출물은 \`agent/${slug}/outputs/\` 에 저장
- 모호한 지시는 확인 후 진행
`;

  const knowledge = `[AgentProfile v1]

## 직책
${jobTitle} — ${roleDesc}

## CEO가 정의한 능력·성향
${brief.trim()}

## 핵심 역량
${inferCapabilitiesFromTitle(jobTitle, role).map((c) => `- ${c}`).join('\n')}
`;

  return {
    role,
    description,
    persona,
    knowledge,
    capabilities: inferCapabilitiesFromTitle(jobTitle, role),
  };
}

export class AgentProfileGenerator {
  constructor(
    private providers: ProviderEngine,
    private credentials: CredentialsService
  ) {}

  async generate(
    name: string,
    title: string,
    brief: string,
    slug: string,
    roleOverride?: AgentRole
  ): Promise<GeneratedAgentProfile> {
    const jobTitle = title.trim() || name.trim();
    const fallback = generateProfileFromBrief(name, jobTitle, brief, slug, roleOverride);

    if (!this.credentials.isOpenAiConfigured()) {
      return fallback;
    }

    try {
      const response = await this.providers.chat(
        'openai',
        [
          {
            role: 'system',
            content: `You help define AI agent profiles for AgentCompany. Reply ONLY with valid JSON:
{"role":"pm|backend|frontend|qa|researcher|writer|designer|devops","personaMarkdown":"...","knowledgeMarkdown":"...","summaryDescription":"one paragraph Korean"}

The agent has a job title (직책). Persona must match that title's professional tone.`,
          },
          {
            role: 'user',
            content: `Name: ${name}
Job title (직책): ${jobTitle}
User brief (abilities, personality): ${brief}

Generate persona.md (Korean, markdown) reflecting the job title "${jobTitle}".`,
          },
        ],
        { type: 'openai', model: this.credentials.getDefaultModel() }
      );

      const parsed = parseLlmProfileJson(response.content);
      if (!parsed) return fallback;

      const role = roleOverride ?? inferRoleFromTitle(jobTitle) ?? (isValidRole(parsed.role) ? parsed.role : fallback.role);

      return {
        role,
        description: parsed.summaryDescription || fallback.description,
        persona: parsed.personaMarkdown?.trim() || fallback.persona,
        knowledge: `[AgentProfile v1]\n\n${parsed.knowledgeMarkdown?.trim() || fallback.knowledge}`,
        capabilities: inferCapabilitiesFromTitle(jobTitle, role),
      };
    } catch {
      return fallback;
    }
  }
}

function isValidRole(value: string): value is AgentRole {
  return ['ceo', 'pm', 'backend', 'frontend', 'qa', 'researcher', 'writer', 'designer', 'devops'].includes(
    value
  );
}

function parseLlmProfileJson(content: string): {
  role: string;
  personaMarkdown?: string;
  knowledgeMarkdown?: string;
  summaryDescription?: string;
} | null {
  const match = content.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]) as {
      role: string;
      personaMarkdown?: string;
      knowledgeMarkdown?: string;
      summaryDescription?: string;
    };
  } catch {
    return null;
  }
}
