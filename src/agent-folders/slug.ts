import { Agent } from '../types';
import { isMonaAgent } from '../kilo';
import { isWonyoungAgent } from '../research';
import { isSecretaryAgent } from '../secretary';

/** 번들 템플릿 폴더명 (agent/secretary 등 — 런타임 slug 와 별도) */
const BUNDLED_TEMPLATE_BY_NAME: Record<string, string> = {
  'alex pm': 'alex-pm',
  'sam backend': 'sam-backend',
  'jordan frontend': 'jordan-frontend',
  'casey qa': 'casey-qa',
};

/** 폴더명에 쓸 수 없는 문자 제거 */
function sanitizeFolderPart(part: string): string {
  return part
    .trim()
    .replace(/[/\\:*?"<>|]/g, '')
    .replace(/\s+/g, '')
    .slice(0, 48);
}

/** 런타임 폴더 slug: `이름_직책` (한글) — 예: 강하늘_비서, 하정우_개발자 */
export function buildAgentFolderSlug(name: string, title?: string): string {
  const n = sanitizeFolderPart(name);
  const t = sanitizeFolderPart(title ?? '');
  if (!n) return 'agent';
  if (!t) return n;
  return `${n}_${t}`;
}

/** @deprecated buildAgentFolderSlug 사용 */
export function slugifyAgentName(name: string): string {
  return buildAgentFolderSlug(name);
}

/** 에이전트 런타임 데이터 폴더명 */
export function resolveAgentSlug(agent: Agent): string {
  return buildAgentFolderSlug(agent.name, agent.title);
}

/** 번들 agent/{slug}/ 템플릿 소스 (런타임 폴더명과 분리) */
export function resolveBundledTemplateSlug(agent: Agent): string | null {
  if (isSecretaryAgent(agent)) return 'secretary';
  if (isWonyoungAgent(agent)) return 'wonyoung';
  if (isMonaAgent(agent)) return 'mona';

  const known = BUNDLED_TEMPLATE_BY_NAME[agent.name.trim().toLowerCase()];
  if (known) return known;

  return null;
}

/** 에이전트 폴더 내 표준 하위 경로 */
export const AGENT_FOLDER_LAYOUT = {
  persona: 'persona.md',
  description: 'description.md',
  memory: 'memory.md',
  knowledge: 'knowledge',
  references: 'references',
  photo: 'photo',
  outputs: 'outputs',
  outputReports: 'outputs/reports',
  outputDownloads: 'outputs/downloads',
  outputPlans: 'outputs/plans',
  outputExports: 'outputs/exports',
} as const;
