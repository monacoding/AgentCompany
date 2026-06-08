/**
 * 평가원 공식 기출 게시판 (boardID=1500234) 파서
 * https://www.suneung.re.kr/boardCnts/list.do?boardID=1500234&m=0403&s=suneung
 * - 전체 약 180건, 10건/페이지 → page 18에 2005~2006 (언어/수리 구 영역명)
 */

export const SUNEUNG_OFFICIAL_LIST_BASE =
  'https://www.suneung.re.kr/boardCnts/list.do?boardID=1500234&m=0403&s=suneung';

export const SUNEUNG_OFFICIAL_DOWNLOAD_BASE =
  'https://www.suneung.re.kr/boardCnts/fileDown.do?fileSeq=';

export const SUNEUNG_MAX_LIST_PAGES = 20;

const LEGACY_SUBJECT_MAP: Record<string, string> = {
  언어: '국어',
  수리: '수학',
  외국어: '영어',
  국어: '국어',
  수학: '수학',
  영어: '영어',
  한국사: '한국사',
};

const REQUESTED_TO_BOARD: Record<string, Set<string>> = {
  국어: new Set(['국어', '언어']),
  수학: new Set(['수학', '수리']),
  영어: new Set(['영어', '외국어']),
  한국사: new Set(['한국사']),
};

export interface SuneungBoardEntry {
  examYear: string;
  subject: string;
  boardSubject: string;
  fileSeq: string;
  downloadUrl: string;
}

export function parseYearRangeFromQuery(query: string): Set<string> {
  const years = new Set<string>();

  const range = query.match(/(20\d{2})\s*(?:~|부터|-|–)\s*(20\d{2})/);
  if (range) {
    const start = Number(range[1]);
    const end = Number(range[2]);
    for (let y = Math.min(start, end); y <= Math.max(start, end); y++) {
      years.add(String(y));
    }
    return years;
  }

  for (const m of query.matchAll(/(20\d{2})\s*(?:학년도|년)?/g)) {
    years.add(m[1]);
  }
  return years;
}

export function parseRequestedSubjects(query: string): Set<string> {
  const subjects = new Set<string>();
  if (/국어|언어/.test(query)) subjects.add('국어');
  if (/수학|수리/.test(query)) subjects.add('수학');
  if (/영어|외국어/.test(query)) subjects.add('영어');
  if (/한국사/.test(query)) subjects.add('한국사');
  if (subjects.size === 0) {
    subjects.add('국어');
    subjects.add('수학');
  }
  return subjects;
}

function boardSubjectMatches(requested: Set<string>, boardSubject: string): boolean {
  for (const req of requested) {
    const aliases = REQUESTED_TO_BOARD[req];
    if (aliases?.has(boardSubject)) return true;
  }
  return false;
}

export function parseSuneungBoardHtml(html: string, requestedSubjects: Set<string>): SuneungBoardEntry[] {
  const entries: SuneungBoardEntry[] = [];
  const rowRe = /<tr[^>]*>[\s\S]*?<\/tr>/gi;
  let rowMatch: RegExpExecArray | null;

  while ((rowMatch = rowRe.exec(html)) !== null) {
    const row = rowMatch[0];
    if (!row.includes('fileDown')) continue;

    const fileSeq = row.match(/fileDown\('([a-f0-9]+)'\)/)?.[1];
    if (!fileSeq) continue;

    const examYear = row.match(/<td[^>]*>\s*(\d{4})\s*<\/td>/)?.[1] ?? '';
    const subjCell = row.match(
      /<td[^>]*>\s*(국어|수학|영어|한국사|언어|수리|외국어)\s*<\/td>/
    )?.[1];
    const linkName = row.match(
      /([12]\d{3}(?:언어|수리|외국어|국어|수학)영역?\.pdf)/i
    )?.[1];

    let boardSubject = subjCell ?? '';
    if (!boardSubject && linkName) {
      if (/언어/.test(linkName)) boardSubject = '언어';
      else if (/수리/.test(linkName)) boardSubject = '수리';
      else if (/외국어/.test(linkName)) boardSubject = '외국어';
      else if (/국어/.test(linkName)) boardSubject = '국어';
      else if (/수학/.test(linkName)) boardSubject = '수학';
    }

    if (!boardSubject || !boardSubjectMatches(requestedSubjects, boardSubject)) continue;
    if (!/\.pdf/i.test(row) && !/문제|기출/.test(row)) {
      // 정답·듣기·zip 링크는 스킵 (문제지 PDF만)
      if (/정답|듣기|\.zip/i.test(row) && !/영역\.pdf/i.test(row)) continue;
    }
    if (/정답\.pdf|듣기\.zip|\.zip/i.test(row) && !/영역\.pdf/i.test(row)) continue;

    const subject = LEGACY_SUBJECT_MAP[boardSubject] ?? boardSubject;
    entries.push({
      examYear,
      subject,
      boardSubject,
      fileSeq,
      downloadUrl: `${SUNEUNG_OFFICIAL_DOWNLOAD_BASE}${fileSeq}`,
    });
  }

  return entries;
}

export function filterEntriesByYears(
  entries: SuneungBoardEntry[],
  years: Set<string>
): SuneungBoardEntry[] {
  if (years.size === 0) return entries;
  return entries.filter((e) => years.has(e.examYear));
}

/** Jina/Crawl4AI 마크다운 테이블에서 기출 항목 파싱 (HTML fileDown 폴백) */
export function parseSuneungMarkdownTable(
  text: string,
  requestedSubjects: Set<string>
): SuneungBoardEntry[] {
  const entries: SuneungBoardEntry[] = [];
  const rowRe = /\|\s*(\d+)\s*\|\s*(\d{4})\s*\|\s*(국어|수학|영어|한국사|언어|수리|외국어)\s*\|/gi;
  let match: RegExpExecArray | null;
  const seen = new Set<string>();

  while ((match = rowRe.exec(text)) !== null) {
    const boardSubject = match[3];
    if (!boardSubjectMatches(requestedSubjects, boardSubject)) continue;
    const fileSeq = match[1];
    if (seen.has(fileSeq)) continue;
    seen.add(fileSeq);
    entries.push({
      examYear: match[2],
      subject: LEGACY_SUBJECT_MAP[boardSubject] ?? boardSubject,
      boardSubject,
      fileSeq,
      downloadUrl: `${SUNEUNG_OFFICIAL_DOWNLOAD_BASE}${fileSeq}`,
    });
  }

  return entries;
}

export function formatSuneungEntriesBrief(entries: SuneungBoardEntry[], limit = 12): string {
  if (entries.length === 0) return '';
  const lines = entries.slice(0, limit).map(
    (e) => `· ${e.examYear} ${e.subject} — fileSeq=${e.fileSeq} — ${e.downloadUrl}`
  );
  if (entries.length > limit) {
    lines.push(`… 외 ${entries.length - limit}건`);
  }
  return lines.join('\n');
}
