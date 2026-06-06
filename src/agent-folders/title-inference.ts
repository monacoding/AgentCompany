import { AgentRole } from '../types';

interface TitleProfile {
  role: AgentRole;
  capabilities: string[];
  tone: string;
  roleSummary: string;
}

const TITLE_PROFILES: { pattern: RegExp; profile: TitleProfile }[] = [
  {
    pattern: /비서|secretary|assistant|executive\s*assistant/i,
    profile: {
      role: 'pm',
      capabilities: ['secretary', 'routing', 'delegation', 'triage', 'communication'],
      tone: '애교 있고 상냥한 여성 비서 말투 (~요, 대표님). CEO 명령을 정확히 이해하고 따뜻하게 보고합니다.',
      roleSummary: 'CEO 전담 비서 — 명령 분석, 업무 위임, 일정·조회 지원',
    },
  },
  {
    pattern: /연구|리서치|research|조사|analyst/i,
    profile: {
      role: 'researcher',
      capabilities: ['web-crawl', 'search', 'summarize', 'report', 'research'],
      tone: '정확하고 분석적인 리서처 말투. 출처와 근거를 명확히 제시합니다.',
      roleSummary: '리서치·웹 조사·자료 수집 및 보고',
    },
  },
  {
    pattern: /개발|engineer|엔지니|coder|코드|backend|백엔드|풀스택/i,
    profile: {
      role: 'backend',
      capabilities: ['code-gen', 'terminal'],
      tone: '간결하고 기술적으로 정확한 개발자 말투. 코드·구현 중심으로 보고합니다.',
      roleSummary: '소프트웨어 개발·코드 작성·기술 구현',
    },
  },
  {
    pattern: /프론트|frontend|ui|ux/i,
    profile: {
      role: 'frontend',
      capabilities: ['code-gen', 'ui'],
      tone: '사용자 경험을 고려한 프론트엔드 전문가 말투.',
      roleSummary: 'UI/UX·프론트엔드 개발',
    },
  },
  {
    pattern: /qa|테스트|품질|quality/i,
    profile: {
      role: 'qa',
      capabilities: ['test', 'qa'],
      tone: '꼼꼼하고 객관적인 QA 말투. 재현 절차와 결과를 명확히 전달합니다.',
      roleSummary: '품질 검증·테스트·버그 분석',
    },
  },
  {
    pattern: /pm|매니저|manager|기획|프로젝트/i,
    profile: {
      role: 'pm',
      capabilities: ['planning', 'delegation'],
      tone: '체계적이고 조율 중심의 PM 말투.',
      roleSummary: '프로젝트 기획·일정·업무 조율',
    },
  },
  {
    pattern: /영상|video|제작자|크리에이티브|creator|pd/i,
    profile: {
      role: 'writer',
      capabilities: ['video-production', 'writing', 'planning', 'storyboard'],
      tone: '데이터와 감성을 겸비한 영상 PD 말투. 기획·대본·스토리보드 산출물 중심으로 보고합니다.',
      roleSummary: 'AI 영상 기획·대본·스토리보드 제작',
    },
  },
  {
    pattern: /작가|writer|문서|카피|콘텐츠/i,
    profile: {
      role: 'writer',
      capabilities: ['writing', 'report'],
      tone: '명료하고 읽기 쉬운 문체. 독자(CEO) 관점으로 작성합니다.',
      roleSummary: '문서·카피·콘텐츠 작성',
    },
  },
  {
    pattern: /디자in|design|브랜드/i,
    profile: {
      role: 'designer',
      capabilities: ['design'],
      tone: '시각적·사용성 관점을 강조하는 디자이너 말투.',
      roleSummary: '디자인·브랜드·UI 시각 설계',
    },
  },
  {
    pattern: /devops|인프라|배포|infra/i,
    profile: {
      role: 'devops',
      capabilities: ['devops', 'deploy'],
      tone: '안정성과 자동화를 중시하는 DevOps 말투.',
      roleSummary: '배포·인프라·CI/CD',
    },
  },
];

const DEFAULT_PROFILE: TitleProfile = {
  role: 'pm',
  capabilities: ['general'],
  tone: '전문적이고 명확한 말투. CEO(대표님)에게 존중과 결과 중심으로 보고합니다.',
  roleSummary: 'CEO 지시 업무 수행',
};

export function resolveTitleProfile(title: string): TitleProfile {
  const trimmed = title.trim();
  for (const { pattern, profile } of TITLE_PROFILES) {
    if (pattern.test(trimmed)) return profile;
  }
  return DEFAULT_PROFILE;
}

export function inferRoleFromTitle(title: string): AgentRole {
  return resolveTitleProfile(title).role;
}

export function inferCapabilitiesFromTitle(title: string, role: AgentRole): string[] {
  const caps = new Set(resolveTitleProfile(title).capabilities);
  caps.add(`role:${role}`);
  return [...caps];
}

export function getTitlePersonaTone(title: string): string {
  return resolveTitleProfile(title).tone;
}

export function getTitleRoleSummary(title: string): string {
  return resolveTitleProfile(title).roleSummary;
}
