import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Agent } from '../types';
import { AgentFolderEngine } from './engine';
import { AGENT_FOLDER_LAYOUT } from './slug';

export interface FoundFile {
  fileName: string;
  fromRelative: string;
  fromAbsolute: string;
}

export interface TransferredFile {
  fileName: string;
  fromRelative: string;
  toRelative: string;
  toAbsolute: string;
}

export interface DuplicateSkippedFile {
  fileName: string;
  existingAbsolute: string;
  existingRelative: string;
}

export type FileSearchMode = 'strict' | 'relaxed' | 'broad' | 'all';

export interface FileSearchOptions {
  mode?: FileSearchMode;
  excludeRelativePaths?: string[];
}

export interface CrossAgentFileTransferResult {
  copied: TransferredFile[];
  skippedDuplicates?: DuplicateSkippedFile[];
  searchedDirs: string[];
  message: string;
}

function firstName(agent) {
  const name = agent.name.trim();
  return name.split(/\s+/)[0] || name;
}
var SEARCH_SUBDIRS = [
  AGENT_FOLDER_LAYOUT.outputReports,
  AGENT_FOLDER_LAYOUT.outputDownloads,
  AGENT_FOLDER_LAYOUT.outputExports,
  AGENT_FOLDER_LAYOUT.knowledge
];
var SUBJECT_KEYWORDS = ["\uAD6D\uC5B4", "\uC601\uC5B4", "\uC218\uD559", "\uC218\uB9AC", "\uD55C\uAD6D\uC0AC", "\uACFC\uD559", "\uC0AC\uD68C", "\uD0D0\uAD6C"];
var SUBJECT_FILE_ALIASES = {
  \uC218\uB9AC: ["\uC218\uD559"],
  \uC218\uD559: ["\uC218\uD559"]
};
var HINT_STOP_WORDS = /* @__PURE__ */ new Set([
  "\uC601\uC5ED",
  "\uB9CC",
  "\uC5D0\uC11C",
  "\uB3C4\uB85D",
  "\uD558\uACE0",
  "\uACA0\uC2B5\uB2C8\uB2E4",
  "\uC694\uCCAD",
  "\uC81C\uACF5",
  "\uBB38\uC81C",
  "\uD30C\uC77C",
  "\uC800\uC7A5",
  "\uC804\uB2EC",
  "\uBC1B\uAE30",
  "\uAC00\uC838",
  "\uC774\uC804",
  "\uC0AC\uC7A5",
  "\uC9C0\uC2DC",
  "\uD6C4\uC18D",
  "\uC791\uC5C5"
]);
function tokenizeHint(hint) {
  return hint.toLowerCase().split(/[\s,·/]+/).map((t) => t.trim()).filter((t) => t.length >= 2 && !HINT_STOP_WORDS.has(t));
}
function extractSubjectFilter(hint) {
  const normalized = hint.replace(/수리/g, "\uC218\uD559");
  const found = SUBJECT_KEYWORDS.filter((subject) => normalized.includes(subject));
  const aliases = /* @__PURE__ */ new Set();
  for (const subject of found) {
    aliases.add(subject);
    for (const alias of SUBJECT_FILE_ALIASES[subject] ?? [subject]) {
      aliases.add(alias);
    }
  }
  return [...aliases];
}
function fileMatchesMode(fileName, hint, mode) {
  const lower = fileName.toLowerCase();
  const hintTokens = tokenizeHint(hint);
  const subjectFilter = extractSubjectFilter(hint);
  switch (mode) {
    case "strict":
      if (subjectFilter.length > 0) {
        return subjectFilter.some((s) => lower.includes(s.toLowerCase()));
      }
      if (hintTokens.length === 0)
        return true;
      return hintTokens.some((t) => lower.includes(t));
    case "relaxed":
      if (hintTokens.length === 0)
        return /\.(pdf|md|json|csv|xlsx?)$/i.test(fileName);
      return hintTokens.some((t) => lower.includes(t));
    case "broad":
      if (/수능|pdf|기출|문제/.test(hint)) {
        return /수능|pdf|기출|문제|학년도/i.test(lower);
      }
      return /\.(pdf|md)$/i.test(fileName);
    case "all":
      return true;
    default:
      return true;
  }
}
async function walkFiles(dir, baseRelative, hint, mode, exclude, files) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.name.startsWith("."))
      continue;
    const abs = path.join(dir, entry.name);
    const relative2 = path.posix.join(baseRelative, entry.name);
    if (entry.isDirectory()) {
      await walkFiles(abs, relative2, hint, mode, exclude, files);
      continue;
    }
    if (!entry.isFile())
      continue;
    if (exclude.has(relative2))
      continue;
    if (!fileMatchesMode(entry.name, hint, mode))
      continue;
    files.push({ abs, relative: relative2 });
  }
}
export async function searchFilesInAgentDb(
  engine: AgentFolderEngine,
  fileOwner: Agent,
  fileHint: string,
  workspaceRoot: string | undefined,
  options?: FileSearchOptions
) {
  const mode = options?.mode ?? "strict";
  const exclude = new Set(options?.excludeRelativePaths ?? []);
  const sourceSlug = engine.resolveSlug(fileOwner);
  const raw = [];
  const searchedDirs = [];
  for (const sub of SEARCH_SUBDIRS) {
    const dir = engine.getDisplayPath(sourceSlug, sub);
    searchedDirs.push(engine.getRelativePath(sourceSlug, sub));
    await walkFiles(dir, engine.getRelativePath(sourceSlug, sub), fileHint, mode, exclude, raw);
  }
  const files = raw.map((f) => ({
    fileName: path.basename(f.abs),
    fromRelative: f.relative,
    fromAbsolute: workspaceRoot ? path.join(workspaceRoot, f.relative) : f.relative
  }));
  return { files, searchedDirs, mode };
}
async function ensureRecipientOutputTree(engine, recipientSlug) {
  for (const sub of SEARCH_SUBDIRS) {
    await fs.mkdir(engine.getDisplayPath(recipientSlug, sub), { recursive: true });
  }
}
export function formatTransferredPaths(files) {
  if (files.length === 0)
    return "";
  return files.map((f) => `\xB7 ${f.fileName}
  ${f.toAbsolute}`).join("\n");
}
export function formatFoundFilePaths(files) {
  if (files.length === 0)
    return "";
  return files.map((f) => `\xB7 ${f.fileName}
  ${f.fromAbsolute}`).join("\n");
}
export function formatDuplicatePaths(files) {
  if (files.length === 0)
    return "";
  return files.map((f) => `\xB7 ${f.fileName}
  ${f.existingAbsolute}`).join("\n");
}
async function fileContentHash(filePath) {
  const data = await fs.readFile(filePath);
  return crypto.createHash("sha256").update(data).digest("hex");
}
async function walkOwnerFiles(dir, out) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.name.startsWith("."))
      continue;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkOwnerFiles(abs, out);
      continue;
    }
    if (!entry.isFile())
      continue;
    try {
      const hash = await fileContentHash(abs);
      out.push({ abs, name: entry.name, hash });
    } catch {
      continue;
    }
  }
}
function ownerFileKey(fileName, hash) {
  return `${fileName}\0${hash}`;
}
async function buildOwnerFolderFileIndex(ownerDir) {
  const files = [];
  await walkOwnerFiles(ownerDir, files);
  const index = /* @__PURE__ */ new Map();
  for (const file of files) {
    index.set(ownerFileKey(file.name, file.hash), file);
  }
  return index;
}
async function findDuplicateInOwnerFolder(ownerDir, fileName, sourcePath, workspaceRoot, index) {
  let sourceHash;
  try {
    sourceHash = await fileContentHash(sourcePath);
  } catch {
    return null;
  }
  const lookup = index ?? await buildOwnerFolderFileIndex(ownerDir);
  const match = lookup.get(ownerFileKey(fileName, sourceHash));
  if (!match)
    return null;
  const existingRelative = workspaceRoot ? path.relative(workspaceRoot, match.abs).split(path.sep).join("/") : match.abs;
  return {
    fileName,
    existingAbsolute: match.abs,
    existingRelative
  };
}
export function buildOwnerFolderDeliveryMessage(result: CrossAgentFileTransferResult): string {
  const copied = result.copied;
  const duplicates = result.skippedDuplicates ?? [];
  if (copied.length === 0 && duplicates.length > 0) {
    return `\uC0AC\uC7A5\uB2D8, \uC694\uCCAD\uD558\uC2E0 \uD30C\uC77C\uC740 \uC774\uBBF8 \uC0AC\uC7A5\uB2D8 \uD3F4\uB354\uC5D0 \uB3D9\uC77C\uD55C \uD30C\uC77C\uC774 \uC788\uC5B4\uC694. \uC911\uBCF5\uC774\uB77C \uC804\uB2EC\uD558\uC9C0 \uC54A\uC558\uC5B4\uC694.

\u{1F4C1} \uAE30\uC874 \uACBD\uB85C:
${formatDuplicatePaths(duplicates)}`;
  }
  if (copied.length > 0 && duplicates.length > 0) {
    const copiedReport = formatTransferredPaths(copied);
    const dupReport = formatDuplicatePaths(duplicates);
    return `\uC0AC\uC7A5\uB2D8, ${duplicates.length}\uAC1C\uB294 \uC774\uBBF8 \uC0AC\uC7A5\uB2D8 \uD3F4\uB354\uC5D0 \uC788\uC5B4\uC11C \uAC74\uB108\uB6F0\uACE0, ${copied.length}\uAC1C\uB9CC \uC0C8\uB85C \uC804\uB2EC\uD588\uC5B4\uC694.

\u{1F4C1} \uC0C8\uB85C \uC800\uC7A5:
${copiedReport}

\u23ED\uFE0F \uC774\uBBF8 \uC788\uC74C:
${dupReport}`;
  }
  if (copied.length > 0) {
    return `\uC0AC\uC7A5\uB2D8, \uD30C\uC77C \uC804\uB2EC \uC644\uB8CC\uD588\uC5B4\uC694! ${copied.length}\uAC1C \uD30C\uC77C\uC744 \uC0AC\uC7A5\uB2D8 \uD3F4\uB354\uC5D0 \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.

\u{1F4C1} \uC800\uC7A5 \uACBD\uB85C:
${formatTransferredPaths(copied)}`;
  }
  return result.message || "\uD30C\uC77C \uBCF5\uC0AC\uC5D0 \uC2E4\uD328\uD588\uC5B4\uC694.";
}
export async function copySelectedFiles(
  engine: AgentFolderEngine,
  fileOwner: Agent,
  recipient: Agent,
  selected: FoundFile[],
  workspaceRoot?: string
): Promise<CrossAgentFileTransferResult> {
  const sourceSlug = engine.resolveSlug(fileOwner);
  const recipientSlug = engine.resolveSlug(recipient);
  const ownerName = firstName(fileOwner);
  await ensureRecipientOutputTree(engine, recipientSlug);
  if (selected.length === 0) {
    return {
      copied: [],
      searchedDirs: [],
      message: "\uC804\uB2EC\uD560 \uD30C\uC77C\uC774 \uC120\uD0DD\uB418\uC9C0 \uC54A\uC558\uC5B4\uC694."
    };
  }
  const destSubdir = path.join(AGENT_FOLDER_LAYOUT.outputDownloads, `from-${ownerName}`);
  const destDir = engine.getDisplayPath(recipientSlug, destSubdir);
  await fs.mkdir(destDir, { recursive: true });
  const copied = [];
  for (const file of selected) {
    const absSource = workspaceRoot ? path.join(workspaceRoot, file.fromRelative) : file.fromAbsolute;
    const fileName = file.fileName;
    const destPath = path.join(destDir, fileName);
    await fs.copyFile(absSource, destPath);
    try {
      const stat4 = await fs.stat(destPath);
      if (!stat4.isFile() || stat4.size === 0)
        continue;
    } catch {
      continue;
    }
    const toRelative = engine.getRelativePath(recipientSlug, destSubdir, fileName);
    const toAbsolute = workspaceRoot ? path.join(workspaceRoot, toRelative) : toRelative;
    copied.push({
      fileName,
      fromRelative: file.fromRelative,
      toRelative,
      toAbsolute
    });
  }
  if (copied.length === 0) {
    return {
      copied: [],
      searchedDirs: [],
      message: `${ownerName}\uC528 \uD30C\uC77C \uBCF5\uC0AC\uC5D0 \uC2E4\uD328\uD588\uC5B4\uC694.`
    };
  }
  const pathReport = formatTransferredPaths(copied);
  return {
    copied,
    searchedDirs: [],
    message: `${copied.length}\uAC1C \uD30C\uC77C \uBCF5\uC0AC \uC644\uB8CC

\u{1F4C1} \uC800\uC7A5 \uACBD\uB85C:
${pathReport}`
  };
}
export async function copySelectedFilesToOwner(
  engine: AgentFolderEngine,
  agent: Agent,
  selected: FoundFile[],
  workspaceRoot?: string
): Promise<CrossAgentFileTransferResult> {
  const ownerDir = engine.getOwnerDir();
  const agentName = firstName(agent);
  const destSubdir = path.join("outputs", "downloads", `from-${agentName}`);
  const destDir = path.join(ownerDir, destSubdir);
  await fs.mkdir(destDir, { recursive: true });
  if (selected.length === 0) {
    return {
      copied: [],
      searchedDirs: [],
      message: "\uC804\uB2EC\uD560 \uD30C\uC77C\uC774 \uC120\uD0DD\uB418\uC9C0 \uC54A\uC558\uC5B4\uC694."
    };
  }
  const copied = [];
  const skippedDuplicates = [];
  const ownerIndex = await buildOwnerFolderFileIndex(ownerDir);
  for (const file of selected) {
    const absSource = workspaceRoot ? path.join(workspaceRoot, file.fromRelative) : file.fromAbsolute;
    const fileName = file.fileName;
    const duplicate = await findDuplicateInOwnerFolder(
      ownerDir,
      fileName,
      absSource,
      workspaceRoot,
      ownerIndex
    );
    if (duplicate) {
      skippedDuplicates.push(duplicate);
      continue;
    }
    const destPath = path.join(destDir, fileName);
    try {
      await fs.copyFile(absSource, destPath);
      const stat4 = await fs.stat(destPath);
      if (!stat4.isFile() || stat4.size === 0)
        continue;
    } catch {
      continue;
    }
    const toRelative = path.posix.join("company", "owner", destSubdir.replace(/\\/g, "/"), fileName);
    const toAbsolute = workspaceRoot ? path.join(workspaceRoot, toRelative) : destPath;
    copied.push({
      fileName,
      fromRelative: file.fromRelative,
      toRelative,
      toAbsolute
    });
  }
  const result = {
    copied,
    skippedDuplicates,
    searchedDirs: [],
    message: ""
  };
  result.message = buildOwnerFolderDeliveryMessage(result);
  return result;
}
export function searchModeForAttempt(attempt) {
  if (attempt <= 0)
    return "strict";
  if (attempt === 1)
    return "relaxed";
  if (attempt === 2)
    return "broad";
  return "all";
}


export async function transferFilesBetweenAgents(
  engine: AgentFolderEngine,
  fileOwner: Agent,
  recipient: Agent,
  selected: FoundFile[],
  workspaceRoot?: string
): Promise<CrossAgentFileTransferResult> {
  return copySelectedFiles(engine, fileOwner, recipient, selected, workspaceRoot);
}
