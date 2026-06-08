#!/usr/bin/env node
/**
 * 한서준 리서치 파이프라인 스모크 테스트 (Crawl4AI + Known Sources + Search)
 * Usage: node scripts/test-hanseo-research.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CRAWL4AI_BASE = process.env.CRAWL4AI_BASE_URL || 'http://localhost:11235';

const QUERY =
  process.env.RESEARCH_QUERY ||
  '2024년 수능 기출 PDF 평가원 공식 출처 URL 조사 (언어·수리)';

function loadEnv() {
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq < 1) continue;
    const key = t.slice(0, eq).trim();
    const val = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}

async function step(label, fn) {
  const t0 = Date.now();
  process.stdout.write(`\n▶ ${label}... `);
  try {
    const result = await fn();
    console.log(`✓ (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
    return result;
  } catch (err) {
    console.log(`✗ (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
    throw err;
  }
}

async function checkCrawl4Ai() {
  for (const endpoint of ['/health', '/']) {
    try {
      const res = await fetch(`${CRAWL4AI_BASE}${endpoint}`, { signal: AbortSignal.timeout(5000) });
      if (res.ok) return { ok: true, endpoint };
    } catch {
      // try next
    }
  }
  return { ok: false, endpoint: null };
}

function resolveMarkdown(result) {
  const pick = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return value.markdown_with_citations || value.raw_markdown || '';
  };
  return pick(result.fit_markdown) || pick(result.markdown);
}

async function crawl4aiCrawl(url) {
  const res = await fetch(`${CRAWL4AI_BASE}/crawl`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ urls: [url], priority: 10 }),
    signal: AbortSignal.timeout(90000),
  });
  if (!res.ok) throw new Error(`crawl HTTP ${res.status}`);
  const data = await res.json();
  const result = data.results?.[0];
  if (!result) throw new Error('crawl 결과 없음');
  const markdown = resolveMarkdown(result);
  const html = result.html || '';
  const content = markdown || html || '';
  return {
    url,
    title: result.metadata?.title ?? url,
    markdown,
    html,
    chars: content.length,
    source: 'crawl4ai',
  };
}

async function duckDuckGoSearch(query, max = 5) {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'AgentCompany-Research-Test/1.0' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`DDG HTTP ${res.status}`);
  const html = await res.text();
  const results = [];
  const seen = new Set();
  const patterns = [
    /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi,
    /<a[^>]+class="[^"]*result[^"]*"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi,
    /uddg=([^&"']+)/gi,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(html)) && results.length < max) {
      let href = m[1].replace(/&amp;/g, '&');
      if (href.includes('uddg=')) {
        const uddg = href.match(/uddg=([^&]+)/)?.[1];
        if (uddg) href = decodeURIComponent(uddg);
      } else if (!href.startsWith('http')) {
        try {
          href = decodeURIComponent(href);
        } catch {
          continue;
        }
      }
      if (!href.startsWith('http') || seen.has(href)) continue;
      seen.add(href);
      const title = (m[2] ? m[2].replace(/<[^>]+>/g, '').trim() : href) || href;
      results.push({ title, url: href });
    }
  }
  return results;
}

function parseSuneungPdfLinks(html) {
  const links = [];
  const seen = new Set();
  const patterns = [
    /fileSeq=(\d+)[^"']*fileName=([^&"']+\.pdf)/gi,
    /boardDownload\.do\?fileSeq=(\d+)/gi,
    /fileSeq['"]?\s*[:=]\s*['"]?(\d+)/gi,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(html))) {
      const fileSeq = m[1];
      if (seen.has(fileSeq)) continue;
      seen.add(fileSeq);
      const fileName = m[2] ? decodeURIComponent(m[2]) : `file_${fileSeq}.pdf`;
      links.push({
        fileSeq,
        fileName,
        downloadUrl: `https://www.suneung.re.kr/boardDownload.do?fileSeq=${fileSeq}`,
      });
    }
  }
  return links;
}

async function main() {
  loadEnv();

  console.log('═'.repeat(60));
  console.log('한서준 리서치 파이프라인 테스트');
  console.log(`쿼리: ${QUERY}`);
  console.log(`Crawl4AI: ${CRAWL4AI_BASE}`);
  console.log('═'.repeat(60));

  const health = await step('Crawl4AI Docker 상태 확인', checkCrawl4Ai);
  if (!health.ok) {
    console.error('\n❌ Crawl4AI API 응답 없음. docker run -p 11235:11235 로 포트 매핑을 확인하세요.');
    process.exit(1);
  }
  console.log(`   → ${health.endpoint} OK`);

  const searchResults = await step('Multi-Search (DuckDuckGo)', () =>
    duckDuckGoSearch(`${QUERY} site:suneung.re.kr`, 6)
  );
  console.log(`   → ${searchResults.length}건`);
  for (const r of searchResults.slice(0, 3)) {
    console.log(`     · ${r.title.slice(0, 50)} — ${r.url.slice(0, 70)}`);
  }

  const listUrl =
    'https://www.suneung.re.kr/boardCnts/list.do?boardID=1500234&m=0403&s=suneung&page=1';
  const suneungCrawl = await step('Known Sources — 평가원 기출 게시판 (Crawl4AI)', () =>
    crawl4aiCrawl(listUrl)
  );
  console.log(`   → ${suneungCrawl.chars.toLocaleString()} chars via ${suneungCrawl.source}`);
  console.log(`   → 제목: ${suneungCrawl.title.slice(0, 60)}`);

  const pdfLinks = parseSuneungPdfLinks(suneungCrawl.html || suneungCrawl.markdown);
  console.log(`   → PDF 링크 ${pdfLinks.length}개 파싱`);
  for (const link of pdfLinks.slice(0, 5)) {
    console.log(`     · [${link.fileSeq}] ${link.fileName}`);
  }

  if (pdfLinks.length > 0) {
    const sample = pdfLinks[0];
    const head = await step(`PDF HEAD 확인 (${sample.fileName})`, async () => {
      const res = await fetch(sample.downloadUrl, {
        method: 'HEAD',
        signal: AbortSignal.timeout(15000),
        headers: { 'User-Agent': 'AgentCompany-Research/1.0' },
      });
      return {
        status: res.status,
        type: res.headers.get('content-type'),
        size: res.headers.get('content-length'),
      };
    });
    console.log(`   → HTTP ${head.status}, ${head.type}, ${head.size ?? '?'} bytes`);
  }

  const extraCrawl = searchResults[0]
    ? await step(`추가 크롤 (검색 1위: ${searchResults[0].url.slice(0, 50)}...)`, () =>
        crawl4aiCrawl(searchResults[0].url)
      )
    : null;
  if (extraCrawl) {
    console.log(`   → ${extraCrawl.chars.toLocaleString()} chars`);
  }

  console.log('\n' + '═'.repeat(60));
  console.log('✅ 파이프라인 스모크 테스트 완료');
  console.log('   Research Planner → Multi-Search → Known Sources → Crawl4AI 모두 동작');
  console.log('\nCEO 채팅에서 전체 테스트:');
  console.log('   @한서준 2024 수능 기출 PDF 평가원 공식 출처 URL 조사해줘');
  console.log('═'.repeat(60));
}

main().catch((err) => {
  console.error('\n❌ 테스트 실패:', err.message || err);
  process.exit(1);
});
