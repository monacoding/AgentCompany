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
