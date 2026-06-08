import fs from 'fs';
import path from 'path';

/** Project 채팅·탭에 표시할 짧은 제목 */
export function formatProjectDisplayTitle(raw: string): string {
  const text = raw.trim();
  if (!text) return 'Project';

  const goalMatch = text.match(/##?\s*목표\s*\n+([^\n#@]+)/i);
  if (goalMatch?.[1]?.trim()) {
    return goalMatch[1].trim().slice(0, 80);
  }

  const ceoMatch = text.match(/##?\s*사장님\s*지시\s*\n+([^\n#@]+)/i);
  if (ceoMatch?.[1]?.trim()) {
    const line = ceoMatch[1].trim().replace(/^@\S+\s*/, '');
    if (line.length >= 8) return line.slice(0, 80);
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
    const cleaned = line.replace(/^@\S+\s*/, '').trim();
    if (cleaned.length >= 6) return cleaned.slice(0, 80);
  }

  return text
    .replace(/^#+\s*/gm, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80) || 'Project';
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
