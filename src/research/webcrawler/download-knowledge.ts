/**
 * 원영 에이전트 다운로드 지식 베이스
 * 실제 성공 사례(2024학년도 수능 PDF)에서 학습한 소스·URL 패턴
 */

export interface DownloadIntent {
  kind: 'suneung' | 'generic';
  academicYear?: number;
  subjects: string[];
  includeQuestions: boolean;
  includeAnswers: boolean;
  downloadAll: boolean;
}

export interface KnownSource {
  id: string;
  name: string;
  listPages: Record<number, string>;
  directBaseUrl: string;
  notes: string;
}

/** 검증된 PDF 직링크 소스 (공식 사이트 fileDown.do 보다 curl 친화적) */
export const KNOWN_DOWNLOAD_SOURCES: KnownSource[] = [
  {
    id: 'horaeng',
    name: '호랭이닷컴',
    directBaseUrl: 'https://horaeng.com/wp-content/uploads',
    listPages: {
      2024: 'https://horaeng.com/350',
    },
    notes:
      'wp-content/uploads/{학년도}학년도-대학수학능력시험-{과목}-{문제|정답}.pdf 형식의 직링크 제공. ' +
      '한국교육과정평가원 공식 PDF 미러.',
  },
];

const MAIN_SUNEUNG_SUBJECTS = ['국어', '수학', '영어', '한국사'];

const SUBJECT_ALIASES: Record<string, string> = {
  국어: '국어',
  수학: '수학',
  영어: '영어',
  한국사: '한국사',
  사탐: '사회탐구',
  과탐: '과학탐구',
  생활과윤리: '생활과윤리',
  생윤: '생활과윤리',
  윤리: '윤리와사상',
  윤사: '윤리와사상',
  윤리와사상: '윤리와사상',
  경제: '경제',
  정치: '정치와법',
  정법: '정치와법',
  사문: '사회문화',
  사회문화: '사회문화',
  세계사: '세계사',
  동아시아사: '동아시아사',
  물1: '물리학Ⅰ',
  물2: '물리학Ⅱ',
  화1: '화학Ⅰ',
  화2: '화학Ⅱ',
  생1: '생명과학Ⅰ',
  생2: '생명과학Ⅱ',
  지1: '지구과학Ⅰ',
  지2: '지구과학Ⅱ',
};

export function parseDownloadIntent(query: string): DownloadIntent {
  const lower = query.toLowerCase();
  const isSuneung = /수능|대학수학능력|suneung|csat/.test(lower);

  if (!isSuneung) {
    return {
      kind: 'generic',
      subjects: [],
      includeQuestions: true,
      includeAnswers: /정답|답안/.test(query),
      downloadAll: false,
    };
  }

  const yearMatch = query.match(/(20\d{2})\s*(?:학년도|년)?/);
  const academicYear = yearMatch ? Number(yearMatch[1]) : 2024;

  const subjects: string[] = [];
  for (const [alias, canonical] of Object.entries(SUBJECT_ALIASES)) {
    if (query.includes(alias) && !subjects.includes(canonical)) {
      subjects.push(canonical);
    }
  }

  const includeAnswers = /정답|답안/.test(query);
  const includeQuestions = /문제/.test(query) || !includeAnswers;
  const downloadAll =
    subjects.length === 0 ||
    /전체|모든|전 과목|주요|4과목|기본/.test(query);

  return {
    kind: 'suneung',
    academicYear,
    subjects: downloadAll && subjects.length === 0 ? [...MAIN_SUNEUNG_SUBJECTS] : subjects,
    includeQuestions,
    includeAnswers,
    downloadAll,
  };
}

export function buildHoraengDirectUrls(intent: DownloadIntent): string[] {
  if (intent.kind !== 'suneung' || !intent.academicYear) return [];

  const source = KNOWN_DOWNLOAD_SOURCES.find((s) => s.id === 'horaeng');
  if (!source) return [];

  const yearLabel = `${intent.academicYear}학년도`;
  const types: string[] = [];
  if (intent.includeQuestions) types.push('문제');
  if (intent.includeAnswers) types.push('정답');

  const urls: string[] = [];
  for (const subject of intent.subjects) {
    for (const type of types) {
      const filename = `${yearLabel}-대학수학능력시험-${subject}-${type}.pdf`;
      urls.push(`${source.directBaseUrl}/${encodeURI(filename)}`);
    }
  }

  return urls;
}

export function getKnownListPageUrls(intent: DownloadIntent): string[] {
  if (intent.kind !== 'suneung' || !intent.academicYear) return [];

  const urls: string[] = [];
  for (const source of KNOWN_DOWNLOAD_SOURCES) {
    const page = source.listPages[intent.academicYear!];
    if (page) urls.push(page);
  }
  return urls;
}

export function buildKnownSearchQueries(query: string, intent: DownloadIntent): string[] {
  if (intent.kind !== 'suneung') return [];

  const year = intent.academicYear ?? 2024;
  return [
    `site:horaeng.com ${year}학년도 수능 PDF`,
    `site:horaeng.com ${year} 수능 문제 pdf`,
    `호랭이닷컴 ${year}학년도 수능 PDF`,
  ];
}

export function getDownloadKnowledgeSummary(): string {
  const horaeng = KNOWN_DOWNLOAD_SOURCES[0];
  return `[DownloadKnowledge v1]
수능 PDF 다운로드 — 검증된 방법:
1. ${horaeng.name} (${horaeng.listPages[2024]}) 에서 PDF 직링크 수집
2. URL 패턴: ${horaeng.directBaseUrl}/{학년도}학년도-대학수학능력시험-{과목}-{문제|정답}.pdf
3. fetch/curl로 직접 다운로드 후 %PDF 헤더 검증
4. research/downloads/ 에 저장
5. 공식 suneung.re.kr 은 fileDown.do 동적 링크라 2차 fallback
주요 과목(기본): ${MAIN_SUNEUNG_SUBJECTS.join(', ')}`;
}

export const WONYOUNG_DOWNLOAD_KNOWLEDGE_MARKER = '[DownloadKnowledge v1]';
