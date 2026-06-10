/** Knowledge 파일 메타 — 폴더 목록·미리보기 기반 선별용 */
export interface KnowledgeFileMeta {
  filename: string;
  preview: string;
  content: string;
  fullSize: number;
  usedSummary: boolean;
}

export const SELECTIVE_KNOWLEDGE_MAX_CHARS = 5_000;
export const KNOWLEDGE_FULL_FILE_GUARD = 3_500;
export const KNOWLEDGE_PREVIEW_CHARS = 320;

const SKIP_FILENAMES = new Set(['readme.md']);

/** 역할별 항상 포함할 knowledge 파일 (요약 우선) */
const BASELINE_BY_ROLE: Record<string, string[]> = {
  pm: ['role-profile.md', 'project-playbook.md'],
  researcher: ['role-profile.md', 'research-pipeline.md'],
  backend: ['role-profile.md'],
  production: ['role-profile.md'],
};

/** 업무 키워드 → knowledge 파일 가중치 */
const DOMAIN_FILE_RULES: { pattern: RegExp; files: string[]; score: number }[] = [
  {
    pattern: /수능|기출|pdf|suneung|평가원|다운(?:로드|받)/i,
    files: ['suneung-pdf-download.md'],
    score: 12,
  },
  {
    pattern: /파일|전달|옮겨|복사|이동|from-|downloads?|cross-agent/i,
    files: ['cross-agent-file-transfer.md'],
    score: 10,
  },
  {
    pattern: /사장|owner|profile|persona|company\/owner/i,
    files: ['owner-data-path.md'],
    score: 8,
  },
  {
    pattern: /project|프로젝트|진행하세요|계획|분배|pm|협업|팀/i,
    files: ['project-playbook.md'],
    score: 7,
  },
  {
    pattern: /리서치|조사|research|crawl|크롤|osint|웹|url|출처/i,
    files: ['research-pipeline.md'],
    score: 9,
  },
  {
    pattern: /cline|스크립트|코드|개발|python|구현/i,
    files: ['cline-collaboration.md', 'platform-structure.md'],
    score: 8,
  },
  {
    pattern: /영상|쇼츠|유튜브|video|production/i,
    files: ['ai-video-production-stack.md'],
    score: 8,
  },
];

function normalizeFilename(name: string): string {
  return name.trim().toLowerCase();
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s,.:;!?/@#()[\]{}·\-_]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);
}

function keywordOverlap(a: string, b: string): number {
  const ta = new Set(tokenize(a));
  const tb = tokenize(b);
  let hits = 0;
  for (const t of tb) {
    if (ta.has(t)) hits++;
  }
  return hits;
}

function baselineFilesForRole(role: string): string[] {
  return BASELINE_BY_ROLE[role] ?? ['role-profile.md'];
}

export function scoreKnowledgeFile(
  meta: KnowledgeFileMeta,
  taskHint: string,
  agentRole: string
): number {
  const name = normalizeFilename(meta.filename);
  if (SKIP_FILENAMES.has(name)) return -1;

  let score = 0;
  const hint = taskHint.trim();
  const baselines = baselineFilesForRole(agentRole).map(normalizeFilename);

  if (baselines.includes(name)) {
    score += 100;
  }

  if (hint) {
    score += keywordOverlap(hint, meta.filename) * 3;
    score += keywordOverlap(hint, meta.preview) * 2;
    score += Math.min(keywordOverlap(hint, meta.content), 8);

    for (const rule of DOMAIN_FILE_RULES) {
      if (!rule.pattern.test(hint)) continue;
      if (rule.files.some((f) => normalizeFilename(f) === name)) {
        score += rule.score;
      }
    }
  }

  // 요약본이 있으면 동일 주제의 대용량 원문보다 우선
  if (meta.usedSummary) score += 2;

  // 요약 없이 파일만 매우 큰 경우 — 관련도 낮으면 제외
  if (!meta.usedSummary && meta.fullSize > KNOWLEDGE_FULL_FILE_GUARD && score < 105) {
    score -= 50;
  }

  return score;
}

export function selectKnowledgeForTask(
  metas: KnowledgeFileMeta[],
  taskHint: string,
  agentRole: string,
  maxChars = SELECTIVE_KNOWLEDGE_MAX_CHARS
): { body: string; picked: string[]; skipped: string[] } {
  const ranked = metas
    .map((meta) => ({ meta, score: scoreKnowledgeFile(meta, taskHint, agentRole) }))
    .filter((r) => r.score >= 0)
    .sort((a, b) => b.score - a.score || a.meta.filename.localeCompare(b.meta.filename));

  const picked: string[] = [];
  const skipped: string[] = [];
  const chunks: string[] = [];
  let used = 0;

  for (const { meta, score } of ranked) {
    const baseline = baselineFilesForRole(agentRole)
      .map(normalizeFilename)
      .includes(normalizeFilename(meta.filename));

    if (!baseline && score < 4 && taskHint.trim()) {
      skipped.push(meta.filename);
      continue;
    }

    const block = `## ${meta.filename}\n${meta.content.trim()}`;
    if (used + block.length > maxChars && !baseline) {
      skipped.push(meta.filename);
      continue;
    }

    if (used + block.length > maxChars && baseline) {
      const room = Math.max(200, maxChars - used - meta.filename.length - 6);
      chunks.push(`## ${meta.filename}\n${meta.content.trim().slice(0, room)}\n…(선별 컨텍스트 예산으로 일부 생략)`);
      picked.push(meta.filename);
      used = maxChars;
      break;
    }

    chunks.push(block);
    picked.push(meta.filename);
    used += block.length;
  }

  for (const meta of metas) {
    if (!picked.includes(meta.filename) && !skipped.includes(meta.filename)) {
      skipped.push(meta.filename);
    }
  }

  const header = taskHint.trim()
    ? `_Knowledge 선별: "${taskHint.trim().slice(0, 80)}${taskHint.length > 80 ? '…' : ''}" 관련 ${picked.length}개 파일_\n\n`
    : `_Knowledge 선별: 기본 ${picked.length}개 파일_\n\n`;

  return {
    body: chunks.length ? `${header}${chunks.join('\n\n')}` : '',
    picked,
    skipped,
  };
}
