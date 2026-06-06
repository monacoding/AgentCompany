export const COMPANY_FOLDER_SLUG = 'company';
export const COMPANY_PROFILE_FILE = 'profile.json';
export const COMPANY_PERSONA_FILE = 'persona.md';
export const COMPANY_LOGO_BASENAME = 'logo';

export const COMPANY_LOGO_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif'] as const;

export interface CompanyInfo {
  companyName: string;
  businessItem: string;
  policy: string;
  mindset: string;
  tendency: string;
  mission: string;
  foundedAt: string;
  updatedAt: string;
}

export type CompanyInfoInput = Omit<CompanyInfo, 'updatedAt'>;

export const EMPTY_COMPANY_INFO = (): CompanyInfo => ({
  companyName: '',
  businessItem: '',
  policy: '',
  mindset: '',
  tendency: '',
  mission: '',
  foundedAt: '',
  updatedAt: '',
});

export function buildCompanyPersonaMarkdown(info: CompanyInfoInput): string {
  const name = info.companyName.trim() || '회사';
  const sections: string[] = [
    `# ${name} — CEO 페르소나`,
    '',
    '> AgentCompany 전체 에이전트가 따르는 회사 기준입니다. CEO의 경영 철학·업무 스타일과 동일합니다.',
    '',
    '## 회사 개요',
    `- **회사명:** ${info.companyName.trim() || '(미설정)'}`,
    `- **창립일:** ${info.foundedAt.trim() || '(미설정)'}`,
    `- **사업 아이템:** ${info.businessItem.trim() || '(미설정)'}`,
  ];

  if (info.mission.trim()) {
    sections.push('', '## 미션·비전', info.mission.trim());
  }
  if (info.policy.trim()) {
    sections.push('', '## 경영 정책', info.policy.trim());
  }
  if (info.mindset.trim()) {
    sections.push('', '## 마인드셋', info.mindset.trim());
  }
  if (info.tendency.trim()) {
    sections.push('', '## 성향·업무 스타일', info.tendency.trim());
  }

  sections.push(
    '',
    '---',
    '_모든 에이전트는 업무 수행·보고·의사결정 시 위 CEO 페르소나에 맞춰 행동합니다._'
  );

  return `${sections.join('\n')}\n`;
}

export function buildCompanyPromptBlock(personaMarkdown: string): string {
  const trimmed = personaMarkdown.trim();
  if (!trimmed) return '';
  return `Company Context (CEO Persona — all agents must align with this culture and standards):\n${trimmed}`;
}

export function parseCompanyProfile(raw: string): CompanyInfo | null {
  try {
    const data = JSON.parse(raw) as Partial<CompanyInfo>;
    return {
      companyName: String(data.companyName ?? '').trim(),
      businessItem: String(data.businessItem ?? '').trim(),
      policy: String(data.policy ?? '').trim(),
      mindset: String(data.mindset ?? '').trim(),
      tendency: String(data.tendency ?? '').trim(),
      mission: String(data.mission ?? '').trim(),
      foundedAt: String(data.foundedAt ?? '').trim(),
      updatedAt: String(data.updatedAt ?? ''),
    };
  } catch {
    return null;
  }
}
