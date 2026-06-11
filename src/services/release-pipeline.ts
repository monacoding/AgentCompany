import * as fs from 'fs/promises';
import * as path from 'path';

export interface ReleasePrepareResult {
  previousVersion: string;
  newVersion: string;
  changedFiles: string[];
}

export interface ReleaseProgress {
  step: 'bump' | 'changelog' | 'release' | 'reload';
  message: string;
  version?: string;
}

const PKG_NAME = 'agent-company';

function todayKst(): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date());
}

export function bumpPatchVersion(version: string): string {
  const m = /^(\d+)\.(\d+)\.(\d+)(?:-.+)?$/.exec(version.trim());
  if (!m) {
    throw new Error(`버전 형식이 올바르지 않습니다: ${version}`);
  }
  const patch = Number(m[3]) + 1;
  return `${m[1]}.${m[2]}.${patch}`;
}

export async function readWorkspacePackageVersion(root: string): Promise<string | null> {
  try {
    const raw = await fs.readFile(path.join(root, 'package.json'), 'utf-8');
    const pkg = JSON.parse(raw) as { name?: string; version?: string };
    if (pkg.name === PKG_NAME && pkg.version?.trim()) {
      return pkg.version.trim();
    }
  } catch {
    // ignore
  }
  return null;
}

function buildChangelogBlock(version: string, date: string): string {
  return [
    `## [${version}] - ${date}`,
    '',
    '### Changed',
    '',
    '- 대시보드 ↻ 릴리스 — 패치 버전 자동 증가·VSIX 빌드·GitHub 푸시·Reload',
    '',
  ].join('\n');
}

function buildReleasesChangelogBlock(version: string, date: string): string {
  return [
    `## [${version}] - ${date}`,
    '',
    `**파일:** \`agent-company-${version}.vsix\``,
    '',
    '### Changed',
    '',
    '- 대시보드 ↻ 자동 릴리스',
    '',
  ].join('\n');
}

async function prependChangelog(filePath: string, block: string): Promise<boolean> {
  let raw = '';
  try {
    raw = await fs.readFile(filePath, 'utf-8');
  } catch {
    raw = '# Changelog\n\n';
  }

  const versionMatch = /^## \[([^\]]+)\]/.exec(block);
  if (versionMatch && raw.includes(`## [${versionMatch[1]}]`)) {
    return false;
  }

  const lines = raw.split('\n');
  const insertAt = lines.findIndex((line) => /^## \[\d/.test(line));
  if (insertAt >= 0) {
    lines.splice(insertAt, 0, block);
  } else {
    lines.push('', block);
  }
  await fs.writeFile(filePath, lines.join('\n'), 'utf-8');
  return true;
}

/** package.json 패치 + CHANGELOG 갱신 */
export async function prepareRelease(root: string): Promise<ReleasePrepareResult> {
  const pkgPath = path.join(root, 'package.json');
  const raw = await fs.readFile(pkgPath, 'utf-8');
  const pkg = JSON.parse(raw) as { name?: string; version?: string };

  if (pkg.name !== PKG_NAME) {
    throw new Error('AgentCompany 워크스페이스(package.json name=agent-company)가 아닙니다.');
  }

  const previousVersion = pkg.version?.trim() || '0.0.0';
  const newVersion = bumpPatchVersion(previousVersion);
  const date = todayKst();
  const changedFiles: string[] = [];

  pkg.version = newVersion;
  await fs.writeFile(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf-8');
  changedFiles.push('package.json');

  const rootCl = path.join(root, 'CHANGELOG.md');
  if (await prependChangelog(rootCl, buildChangelogBlock(newVersion, date))) {
    changedFiles.push('CHANGELOG.md');
  }

  const releasesCl = path.join(root, 'releases', 'CHANGELOG.md');
  if (await prependChangelog(releasesCl, buildReleasesChangelogBlock(newVersion, date))) {
    changedFiles.push('releases/CHANGELOG.md');
  }

  return { previousVersion, newVersion, changedFiles };
}
