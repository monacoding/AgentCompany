export interface WorkspaceFileAction {
  action: 'create' | 'update' | 'delete';
  path: string;
  content?: string;
}

export interface ParsedAgentOutput {
  summary: string;
  files: WorkspaceFileAction[];
}

const FILE_BLOCK_REGEX = /```(?:file:?|filepath:?)?\s*([^\n`]+)\n([\s\S]*?)```/g;
const JSON_BLOCK_REGEX = /```json\s*\n([\s\S]*?)```/;

export function parseAgentOutput(content: string): ParsedAgentOutput {
  const files: WorkspaceFileAction[] = [];
  let summary = content;

  const jsonMatch = content.match(JSON_BLOCK_REGEX);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]) as {
        summary?: string;
        files?: WorkspaceFileAction[];
      };
      if (parsed.summary) summary = parsed.summary;
      if (Array.isArray(parsed.files)) {
        for (const f of parsed.files) {
          if (f.path && f.action) {
            files.push({ action: f.action, path: normalizePath(f.path), content: f.content });
          }
        }
      }
      if (files.length > 0) return { summary, files };
    } catch {
      // fall through to regex parsing
    }
  }

  let match: RegExpExecArray | null;
  while ((match = FILE_BLOCK_REGEX.exec(content)) !== null) {
    const rawPath = match[1].trim();
    if (rawPath.startsWith('{') || rawPath.startsWith('[')) continue;

    const filePath = normalizePath(rawPath);
    const fileContent = match[2].trimEnd();
    if (filePath) {
      files.push({ action: 'create', path: filePath, content: fileContent });
    }
  }

  if (files.length > 0) {
    summary = content.replace(FILE_BLOCK_REGEX, '').trim() || 'Files generated';
  }

  return { summary, files };
}

function normalizePath(raw: string): string {
  return raw.replace(/^\/+/, '').replace(/^\.\//, '').trim();
}

export function buildWorkspacePrompt(role: string): string {
  return `
When creating or modifying files, include them using this format:

\`\`\`filepath:path/to/file.ext
file content here
\`\`\`

Or respond with a JSON block:
\`\`\`json
{
  "summary": "Brief description of work done",
  "files": [
    { "action": "create", "path": "relative/path.ts", "content": "..." }
  ]
}
\`\`\`

Only include files you actually need to create or modify. Use paths relative to the workspace root.
Role context: ${role}`;
}
