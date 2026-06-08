import fs from 'fs';
import path from 'path';

export interface ProjectArtifact {
  name: string;
  relativePath: string;
  absolutePath: string;
  sizeBytes: number;
  kind: 'task' | 'summary' | 'file';
}

export function getProjectWarehouseDir(companyDir: string, sessionId: string): string {
  return path.join(companyDir, 'projects', sessionId);
}

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

export function saveProjectTaskArtifact(
  companyDir: string,
  sessionId: string,
  index: number,
  agentName: string,
  description: string,
  output: string,
  approved: boolean
): string {
  const dir = path.join(getProjectWarehouseDir(companyDir, sessionId), 'tasks');
  ensureDir(dir);
  const safeAgent = agentName.replace(/[^\w가-힣.-]/g, '_');
  const fileName = `${String(index + 1).padStart(2, '0')}_${safeAgent}.md`;
  const filePath = path.join(dir, fileName);
  const body = [
    `# @${agentName} — ${description}`,
    '',
    `- status: ${approved ? 'approved' : 'loop_exhausted'}`,
    `- saved: ${new Date().toISOString()}`,
    '',
    output,
  ].join('\n');
  fs.writeFileSync(filePath, body, 'utf8');
  return path.relative(companyDir, filePath).replace(/\\/g, '/');
}

export function saveProjectSummaryArtifact(
  companyDir: string,
  sessionId: string,
  summary: string
): string {
  const dir = getProjectWarehouseDir(companyDir, sessionId);
  ensureDir(dir);
  const filePath = path.join(dir, 'PM_REPORT.md');
  fs.writeFileSync(
    filePath,
    `# PM Project Report\n\n- saved: ${new Date().toISOString()}\n\n${summary}`,
    'utf8'
  );
  return path.relative(companyDir, filePath).replace(/\\/g, '/');
}

export function saveProjectExtractedFile(
  companyDir: string,
  sessionId: string,
  relativeFilePath: string,
  content: string
): string {
  const dir = path.join(getProjectWarehouseDir(companyDir, sessionId), 'files');
  ensureDir(dir);
  const safe = relativeFilePath.replace(/\.\./g, '').replace(/^\/+/, '');
  const filePath = path.join(dir, safe);
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
  return path.relative(companyDir, filePath).replace(/\\/g, '/');
}

export function listProjectArtifacts(companyDir: string, sessionId: string): ProjectArtifact[] {
  const root = getProjectWarehouseDir(companyDir, sessionId);
  if (!fs.existsSync(root)) return [];

  const artifacts: ProjectArtifact[] = [];

  const walk = (subdir: string, kind: ProjectArtifact['kind']) => {
    const full = path.join(root, subdir);
    if (!fs.existsSync(full)) return;
    for (const entry of fs.readdirSync(full, { withFileTypes: true })) {
      if (!entry.isFile()) continue;
      const abs = path.join(full, entry.name);
      const stat = fs.statSync(abs);
      artifacts.push({
        name: entry.name,
        relativePath: path.relative(companyDir, abs).replace(/\\/g, '/'),
        absolutePath: abs,
        sizeBytes: stat.size,
        kind,
      });
    }
  };

  walk('tasks', 'task');
  walk('files', 'file');
  if (fs.existsSync(path.join(root, 'PM_REPORT.md'))) {
    const abs = path.join(root, 'PM_REPORT.md');
    const stat = fs.statSync(abs);
    artifacts.push({
      name: 'PM_REPORT.md',
      relativePath: path.relative(companyDir, abs).replace(/\\/g, '/'),
      absolutePath: abs,
      sizeBytes: stat.size,
      kind: 'summary',
    });
  }

  return artifacts.sort((a, b) => a.name.localeCompare(b.name));
}
