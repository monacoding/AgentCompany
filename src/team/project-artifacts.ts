import fs from 'fs';
import path from 'path';
import type { ProjectTask, TeamSession } from '../types';
import { buildFinalReportFilename, formatProjectDisplayTitle } from './project-title';

export interface ProjectArtifact {
  name: string;
  relativePath: string;
  absolutePath: string;
  sizeBytes: number;
  kind: 'task' | 'summary' | 'file';
}

export function resolveSessionWarehouseFolder(
  session: Pick<TeamSession, 'id' | 'warehouseFolder'>
): string {
  return session.warehouseFolder?.trim() || session.id;
}

export function getProjectWarehouseDir(companyDir: string, warehouseFolder: string): string {
  return path.join(companyDir, 'projects', warehouseFolder);
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

/** PM 통합 태스크(또는 마지막 태스크) 산출물을 최종 보고서 본문으로 사용 */
export function resolvePrimaryReportBody(tasks: ProjectTask[], pmAgentId: string): string | null {
  const withOutput = tasks.filter((t) => t.output?.trim());
  if (withOutput.length === 0) return null;

  const pmTasks = withOutput.filter((t) => t.agentId === pmAgentId);
  const primary = pmTasks.length > 0 ? pmTasks[pmTasks.length - 1] : withOutput[withOutput.length - 1];
  return primary.output!.trim();
}

function isResearcherTask(t: ProjectTask): boolean {
  return (
    (t.agentName?.includes('한서준') ?? false) ||
    /리서치|조사|research/i.test(t.description)
  );
}

/** PM 산출물이 리서치보다 현저히 짧으면 리서치 원문을 부록으로 병합 */
function mergeResearchIfPmOverSummarized(
  pmBody: string,
  tasks: ProjectTask[]
): string {
  const researchBlocks = tasks
    .filter((t) => t.output?.trim() && isResearcherTask(t))
    .map((t) => `## @${t.agentName} — ${t.description}\n\n${t.output!.trim()}`);
  if (researchBlocks.length === 0) return pmBody;

  const researchCombined = researchBlocks.join('\n\n');
  if (pmBody.length >= researchCombined.length * 0.65) return pmBody;

  return [
    pmBody,
    '',
    '---',
    '',
    '## 부록: @한서준 리서치 원문 (PM 통합본 보존)',
    '',
    researchCombined,
  ].join('\n');
}

/** PM 통합 태스크 산출물 우선, 없으면 전체 태스크 산출물을 최종 보고서 본문으로 사용 */
export function buildFullReportBody(tasks: ProjectTask[], pmAgentId: string): string {
  const primary = resolvePrimaryReportBody(tasks, pmAgentId);
  if (primary) {
    return mergeResearchIfPmOverSummarized(primary, tasks);
  }

  const blocks = tasks
    .filter((t) => t.output?.trim())
    .map((t) => `## @${t.agentName} — ${t.description}\n\n${t.output!.trim()}`);
  return blocks.join('\n\n---\n\n') || 'Project가 완료되었습니다.';
}

export function saveProjectSummaryArtifact(
  companyDir: string,
  warehouseFolder: string,
  content: string,
  options?: { projectTitle?: string; authorName?: string }
): string {
  const dir = getProjectWarehouseDir(companyDir, warehouseFolder);
  ensureDir(dir);
  const authorName = options?.authorName?.trim() || 'PM';
  const projectTitle = options?.projectTitle?.trim() || warehouseFolder;
  const filename = buildFinalReportFilename(warehouseFolder, authorName);
  const filePath = path.join(dir, filename);
  const body = [
    `# ${formatProjectDisplayTitle(projectTitle)} — 최종 보고`,
    '',
    `- 작성자: ${authorName}`,
    `- 저장: ${new Date().toISOString()}`,
    '',
    content,
  ].join('\n');
  fs.writeFileSync(filePath, body, 'utf8');
  return path.relative(companyDir, filePath).replace(/\\/g, '/');
}

const FINAL_REPORT_PATTERN = /^.+_\d{8}_[\w가-힣.-]+\.md$/;

function isFinalReportFile(name: string): boolean {
  return name === 'PM_REPORT.md' || FINAL_REPORT_PATTERN.test(name);
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

  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (!entry.isFile() || !isFinalReportFile(entry.name)) continue;
    const abs = path.join(root, entry.name);
    const stat = fs.statSync(abs);
    artifacts.push({
      name: entry.name,
      relativePath: path.relative(companyDir, abs).replace(/\\/g, '/'),
      absolutePath: abs,
      sizeBytes: stat.size,
      kind: 'summary',
    });
  }

  return artifacts.sort((a, b) => a.name.localeCompare(b.name));
}
