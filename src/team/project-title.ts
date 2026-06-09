import fs from 'fs';
import path from 'path';

const MAX_TITLE_LEN = 48;

function sanitizeProjectTitle(text: string): string {
  return text
    .replace(/^사장님[,，]?\s*/i, '')
    .replace(/\*\*/g, '')
    .replace(/[「」"']/g, '')
    .replace(/\s*프로젝트로\s*(?:잡|진행)(?:하겠|할게|할게요)[습니다]*\.?$/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_TITLE_LEN);
}

/** PM 계획·사장님 지시에서 Project 채팅·탭용 짧은 제목 추출 */
export function deriveProjectTitle(
  plan: string,
  ceoCommand: string,
  pm?: { name: string }
): string {
  const titleBlock = plan.match(/---TITLE---\s*([\s\S]*?)\s*---(?:PLAN|AGENTS|END)/i);
  if (titleBlock?.[1]?.trim()) {
    const cleaned = sanitizeProjectTitle(titleBlock[1]);
    if (cleaned.length >= 4) return cleaned;
  }

  const goalMatch = plan.match(/##?\s*목표\s*\n+([^\n#@]+)/i);
  if (goalMatch?.[1]?.trim()) {
    const cleaned = sanitizeProjectTitle(goalMatch[1]);
    if (cleaned.length >= 4) return cleaned;
  }

  const fromCommand = formatProjectDisplayTitle(ceoCommand);
  if (fromCommand && fromCommand !== 'Project') return fromCommand;

  return pm ? `${pm.name} Project` : 'Project';
}

/** Project 채팅·탭에 표시할 짧은 제목 (레거시·폴백) */
export function formatProjectDisplayTitle(raw: string): string {
  const text = raw.trim();
  if (!text) return 'Project';

  const titleBlock = text.match(/---TITLE---\s*([\s\S]*?)\s*---/i);
  if (titleBlock?.[1]?.trim()) {
    return sanitizeProjectTitle(titleBlock[1]);
  }

  const goalMatch = text.match(/##?\s*목표\s*\n+([^\n#@]+)/i);
  if (goalMatch?.[1]?.trim()) {
    return sanitizeProjectTitle(goalMatch[1]);
  }

  const ceoMatch = text.match(/##?\s*사장님\s*지시\s*\n+([^\n#@]+)/i);
  if (ceoMatch?.[1]?.trim()) {
    const line = sanitizeProjectTitle(ceoMatch[1].replace(/^@\S+\s*/, ''));
    if (line.length >= 8) return line;
  }

  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(
      (l) =>
        l.length >= 6 &&
        !l.startsWith('#') &&
        !/^@\S+\s*$/.test(l) &&
        !/^---/.test(l)
    );

  for (const line of lines) {
    const cleaned = sanitizeProjectTitle(line.replace(/^@\S+\s*/, ''));
    if (cleaned.length >= 6) return cleaned;
  }

  return (
    sanitizeProjectTitle(
      text
        .replace(/^#+\s*/gm, '')
        .replace(/\s+/g, ' ')
        .trim()
    ) || 'Project'
  );
}

/** company/projects/{폴더명} — 프로젝트명_YYYYMMDD */
export function buildProjectWarehouseFolder(
  title: string,
  companyDir: string,
  date = new Date()
): string {
  const display = formatProjectDisplayTitle(title);
  const slug =
    display
      .replace(/[^\w가-힣]+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 40) || 'project';

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const dateStr = `${y}${m}${d}`;
  const base = `${slug}_${dateStr}`;

  const projectsRoot = path.join(companyDir, 'projects');
  let folder = base;
  let suffix = 2;
  while (fs.existsSync(path.join(projectsRoot, folder))) {
    folder = `${base}_${suffix}`;
    suffix++;
  }
  return folder;
}

/** 최종 보고서 파일명 — {프로젝트폴더명}_{작성자}.md (폴더명 = 프로젝트명_YYYYMMDD) */
export function buildFinalReportFilename(warehouseFolder: string, authorName: string): string {
  const safeAuthor = authorName.replace(/[^\w가-힣.-]/g, '_');
  return `${warehouseFolder}_${safeAuthor}.md`;
}
