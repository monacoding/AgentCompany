/** Knowledge 파일 — 선별 후 본문 로드 */
export interface KnowledgeFileMeta {
  filename: string;
  preview: string;
  content: string;
  fullSize: number;
  usedSummary: boolean;
}

/** 1단계: 파일 제목(이름)만으로 선별 */
export interface KnowledgeTitleMeta {
  filename: string;
}

/** memory.md 섹션 — 제목(첫 줄) 기준 선별 */
export interface MemorySectionMeta {
  title: string;
  content: string;
  fullSize: number;
}

export const SELECTIVE_KNOWLEDGE_MAX_CHARS = 5_000;
export const SELECTIVE_MEMORY_MAX_CHARS = 4_000;
export const KNOWLEDGE_FULL_FILE_GUARD = 3_500;
export const KNOWLEDGE_PREVIEW_CHARS = 320;
export const SELECTIVE_KNOWLEDGE_MAX_FILES = 8;

const SKIP_FILENAMES = new Set(['readme.md']);

/** 역할별 항상 포함할 knowledge 파일 */
const BASELINE_BY_ROLE: Record<string, string[]> = {
  pm: ['role-profile.md', 'project-playbook.md'],
  researcher: ['role-profile.md', 'research-pipeline.md'],
  backend: ['role-profile.md'],
  production: ['role-profile.md'],
  qa: ['role-profile.md'],
  content: ['role-profile.md'],
};

/** memory 섹션 제목 — 항상 포함 (업무 무관 공통 규칙) */
const MEMORY_BASELINE_TITLE_PATTERNS: RegExp[] = [
  /^\[CrossAgentFileTransfer/i,
  /^\[OwnerDataPath/i,
];

/** 업무 키워드 → knowledge 파일 가중치 */
const DOMAIN_FILE_RULES: { pattern: RegExp; files: string[]; score: number }[] = [
  {
    pattern: /수능|기출|pdf|suneung|평가원|다운(?:로드|받)/i,
    files: ['suneung-pdf-download.md'],
    score: 12,
  },
  {
    pattern: /수능|기출|pdf|suneung|평가원|다운(?:로드|받)/i,
    files: ['research-auto-download.md'],
    score: 10,
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
    pattern: /리서치|조사|research|crawl|크롤|osint|웹|url|출처|cpi|주식|뉴스|ipo|상장/i,
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

/** memory 섹션 제목 ↔ 업무 키워드 */
const MEMORY_DOMAIN_RULES: { pattern: RegExp; titlePatterns: RegExp[]; score: number }[] = [
  {
    pattern: /수능|pdf|다운|suneung|기출/i,
    titlePatterns: [/suneung|download|수능|pdf/i, /KnowledgeLearned: suneung/i],
    score: 12,
  },
  {
    pattern: /파일|전달|옮겨|복사|cross-agent/i,
    titlePatterns: [/CrossAgent|cross-agent|file.transfer/i, /KnowledgeLearned: cross-agent/i],
    score: 10,
  },
  {
    pattern: /사장|owner/i,
    titlePatterns: [/OwnerData|owner-data/i],
    score: 8,
  },
  {
    pattern: /리서치|조사|research|cpi|주식|뉴스|ipo|상장|스페이스/i,
    titlePatterns: [/^\[Research:/i, /KnowledgeLearned: research/i],
    score: 9,
  },
  {
    pattern: /project|프로젝트|pm|계획/i,
    titlePatterns: [/^\[PM /i, /KnowledgeLearned: project/i],
    score: 7,
  },
];

function normalizeFilename(name: string): string {
  return name.trim().toLowerCase();
}

export function tokenize(text: string): string[] {
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

function isMemoryBaseline(title: string): boolean {
  return MEMORY_BASELINE_TITLE_PATTERNS.some((p) => p.test(title.trim()));
}

/** 1단계: 파일 제목만으로 관련도 점수 */
export function scoreKnowledgeTitle(
  filename: string,
  taskHint: string,
  agentRole: string
): number {
  const name = normalizeFilename(filename);
  if (SKIP_FILENAMES.has(name)) return -1;

  let score = 0;
  const hint = taskHint.trim();
  const baselines = baselineFilesForRole(agentRole).map(normalizeFilename);
  const stem = name.replace(/\.(md|txt|json)$/, '');

  if (baselines.includes(name)) {
    score += 100;
  }

  if (hint) {
    score += keywordOverlap(hint, filename) * 4;
    score += keywordOverlap(hint, stem.replace(/-/g, ' ')) * 3;

    for (const rule of DOMAIN_FILE_RULES) {
      if (!rule.pattern.test(hint)) continue;
      if (rule.files.some((f) => normalizeFilename(f) === name)) {
        score += rule.score;
      }
    }
  }

  return score;
}

/** 1단계: 제목만 보고 로드할 파일명 선정 */
export function pickKnowledgeFilenames(
  titles: KnowledgeTitleMeta[],
  taskHint: string,
  agentRole: string,
  maxFiles = SELECTIVE_KNOWLEDGE_MAX_FILES
): { picked: string[]; skipped: string[] } {
  const ranked = titles
    .map((t) => ({ filename: t.filename, score: scoreKnowledgeTitle(t.filename, taskHint, agentRole) }))
    .filter((r) => r.score >= 0)
    .sort((a, b) => b.score - a.score || a.filename.localeCompare(b.filename));

  const picked: string[] = [];
  const skipped: string[] = [];
  const baselines = new Set(baselineFilesForRole(agentRole).map(normalizeFilename));

  for (const { filename, score } of ranked) {
    const isBaseline = baselines.has(normalizeFilename(filename));
    if (picked.length >= maxFiles && !isBaseline) {
      skipped.push(filename);
      continue;
    }
    if (!isBaseline && score < 3 && taskHint.trim()) {
      skipped.push(filename);
      continue;
    }
    if (!picked.includes(filename)) {
      picked.push(filename);
    }
  }

  for (const t of titles) {
    if (!picked.includes(t.filename) && !skipped.includes(t.filename)) {
      skipped.push(t.filename);
    }
  }

  return { picked, skipped };
}

export function scoreKnowledgeFile(
  meta: KnowledgeFileMeta,
  taskHint: string,
  agentRole: string
): number {
  let score = scoreKnowledgeTitle(meta.filename, taskHint, agentRole);
  if (score < 0) return -1;

  const hint = taskHint.trim();
  if (hint) {
    score += keywordOverlap(hint, meta.preview) * 2;
    score += Math.min(keywordOverlap(hint, meta.content), 6);
  }

  if (meta.usedSummary) score += 2;

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
    ? `_Knowledge 선별(제목→본문): "${taskHint.trim().slice(0, 80)}${taskHint.length > 80 ? '…' : ''}" — ${picked.length}개 로드_\n\n`
    : `_Knowledge 선별: 기본 ${picked.length}개 파일_\n\n`;

  return {
    body: chunks.length ? `${header}${chunks.join('\n\n')}` : '',
    picked,
    skipped,
  };
}

/** memory.md → 섹션 분리 (제목 = 각 블록 첫 줄) */
export function parseMemorySections(raw: string): MemorySectionMeta[] {
  const text = raw
    .replace(/^#\s.+?\n+/m, '')
    .replace(/^_마지막 동기화:.+_\s*\n+/m, '')
    .trim();
  if (!text) return [];

  const blocks = text.split(/\n(?=\[)/).map((b) => b.trim()).filter(Boolean);
  const sections: MemorySectionMeta[] = [];

  for (const block of blocks) {
    const nl = block.indexOf('\n');
    const title = nl >= 0 ? block.slice(0, nl).trim() : block.trim();
    const content = nl >= 0 ? block.slice(nl + 1).trim() : '';
    if (!title) continue;
    sections.push({
      title,
      content: content ? `${title}\n${content}` : title,
      fullSize: block.length,
    });
  }

  if (sections.length === 0 && text) {
    sections.push({ title: '(memory)', content: text, fullSize: text.length });
  }

  return sections;
}

export function scoreMemorySection(
  section: MemorySectionMeta,
  taskHint: string,
  agentRole: string
): number {
  const title = section.title.trim();
  let score = 0;
  const hint = taskHint.trim();

  if (isMemoryBaseline(title)) {
    score += 100;
  }

  if (agentRole === 'researcher' && /^\[DownloadKnowledge/i.test(title)) {
    score += 90;
  }

  if (hint) {
    score += keywordOverlap(hint, title) * 5;
    score += Math.min(keywordOverlap(hint, section.content.slice(0, 400)), 6);

    for (const rule of MEMORY_DOMAIN_RULES) {
      if (!rule.pattern.test(hint)) continue;
      if (rule.titlePatterns.some((p) => p.test(title))) {
        score += rule.score;
      }
    }

    for (const rule of DOMAIN_FILE_RULES) {
      if (!rule.pattern.test(hint)) continue;
      for (const file of rule.files) {
        const stem = file.replace(/\.md$/, '');
        if (title.toLowerCase().includes(stem.toLowerCase())) {
          score += rule.score;
        }
      }
    }
  }

  // 오래된 Research 로그 — hint 없으면 최근 것만 소량 포함
  if (/^\[Research:/i.test(title) && !hint) {
    score += 1;
  }

  if (section.fullSize > 8_000 && score < 50) {
    score -= 30;
  }

  return score;
}

export function selectMemoryForTask(
  sections: MemorySectionMeta[],
  taskHint: string,
  agentRole: string,
  maxChars = SELECTIVE_MEMORY_MAX_CHARS
): { body: string; picked: string[]; skipped: string[] } {
  if (sections.length === 0) {
    return { body: '', picked: [], skipped: [] };
  }

  const ranked = sections
    .map((section) => ({ section, score: scoreMemorySection(section, taskHint, agentRole) }))
    .sort((a, b) => b.score - a.score || b.section.fullSize - a.section.fullSize);

  const picked: string[] = [];
  const skipped: string[] = [];
  const chunks: string[] = [];
  let used = 0;

  for (const { section, score } of ranked) {
    const baseline = isMemoryBaseline(section.title);
    const hint = taskHint.trim();

    if (!baseline && score < 4 && hint) {
      skipped.push(section.title);
      continue;
    }

    if (!baseline && !hint && score < 2) {
      skipped.push(section.title);
      continue;
    }

    const block = section.content.trim();
    if (used + block.length > maxChars && !baseline) {
      skipped.push(section.title);
      continue;
    }

    if (used + block.length > maxChars && baseline) {
      const room = Math.max(200, maxChars - used);
      chunks.push(`${block.slice(0, room)}\n…(memory 선별 예산으로 일부 생략)`);
      picked.push(section.title);
      used = maxChars;
      break;
    }

    chunks.push(block);
    picked.push(section.title);
    used += block.length;
  }

  for (const s of sections) {
    if (!picked.includes(s.title) && !skipped.includes(s.title)) {
      skipped.push(s.title);
    }
  }

  const header = hint
    ? `_Memory 선별(제목→본문): "${hint.slice(0, 80)}${hint.length > 80 ? '…' : ''}" — ${picked.length}/${sections.length}개 섹션_\n\n`
    : `_Memory 선별: ${picked.length}/${sections.length}개 섹션_\n\n`;

  return {
    body: chunks.length ? `${header}${chunks.join('\n\n---\n\n')}` : '',
    picked,
    skipped,
  };
}
