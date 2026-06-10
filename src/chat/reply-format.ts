function basename(path9) {
  const parts = path9.replace(/\\/g, "/").split("/");
  return parts[parts.length - 1] || path9;
}
export function formatBossReport(content: string): string {
  const text = content.trim();
  if (!text)
    return text;
  if (/영상 제작 기획 산출물이 생성되었습니다/i.test(text)) {
    const outputs = [];
    if (/브리프:/i.test(text))
      outputs.push("\uAE30\uD68D \uBE0C\uB9AC\uD504");
    if (/대본:/i.test(text))
      outputs.push("\uB300\uBCF8");
    if (/씬:/i.test(text))
      outputs.push("\uC2A4\uD1A0\uB9AC\uBCF4\uB4DC");
    const lines = ["\uC0AC\uC7A5\uB2D8, \uC694\uCCAD\uD558\uC2E0 \uC601\uC0C1 \uAE30\uD68D \uC815\uB9AC\uD574 \uB450\uC5C8\uC5B4\uC694!"];
    if (outputs.length > 0) {
      lines.push(`${outputs.join("\xB7")}\uAE4C\uC9C0 \uC900\uBE44\uD588\uC2B5\uB2C8\uB2E4.`);
    }
    const delegateMatch = text.match(
      /@([^\s@]+)\s*(?:에게|한테|에)?\s*(.+?)(?:을|를)\s*요청하세요/i
    );
    if (delegateMatch) {
      const name = delegateMatch[1].trim();
      const task = delegateMatch[2].trim();
      lines.push("");
      lines.push(`\uB2E4\uC74C\uC740 ${task} \uB2E8\uACC4\uC778\uB370, ${name}\uC528\uC5D0\uAC8C \uBD80\uD0C1\uB4DC\uB824\uB3C4 \uB420\uAE4C\uC694?`);
    } else {
      const nextMatch = text.match(/다음 단계:\s*(.+?)(?:\.|$)/i);
      if (nextMatch) {
        const next = nextMatch[1].replace(/또는\s*@[^\n]+/i, "").replace(/\s*요청하세요\.?$/i, "").trim();
        if (next) {
          lines.push("");
          lines.push(`\uB2E4\uC74C \uB2E8\uACC4\uB294 ${next}\uC774\uC5D0\uC694.`);
        }
      }
    }
    return lines.join("\n");
  }
  if (/^✅/m.test(text) && /📋|📝|🎬/.test(text)) {
    const lines = ["\uC0AC\uC7A5\uB2D8, \uC694\uCCAD\uD558\uC2E0 \uC791\uC5C5 \uB9C8\uBB34\uB9AC\uD588\uC5B4\uC694!"];
    const items = [];
    for (const match of text.matchAll(/[📋📝🎬]\s*([^:]+):\s*(\S+)/g)) {
      items.push(`${match[1].trim()} (${basename(match[2])})`);
    }
    if (items.length)
      lines.push(items.join(" \xB7 "));
    return lines.join("\n");
  }
  return text;
}
export function isResearchReportReply(content: string): boolean {
  const text = content.trim();
  if (!text) return false;
  return (
    /📄\s*보고서:/i.test(text) ||
    (/핵심\s*발견|출처\s*신뢰도|교차검증/i.test(text) &&
      (/https?:\/\//i.test(text) || /\[출처/i.test(text))) ||
    (/평가원\s*공식|fileSeq|Known\s*Sources/i.test(text) && /https?:\/\//i.test(text))
  );
}

/** 리서치 파이프라인 결과를 CEO 채팅용으로 요약 */
export function formatResearchChatReply(
  summary: string,
  options?: {
    reportPath?: string;
    sources?: Array<{ title: string; url: string }>;
    downloadedFiles?: Array<{ path: string; filename?: string }>;
    knownSourceNote?: string;
  }
): string {
  const parts: string[] = [];
  const body = summary.trim();
  if (body) {
    parts.push(body.length > 2200 ? `${body.slice(0, 2200)}…` : body);
  }
  if (options?.knownSourceNote?.trim()) {
    parts.push(`\n📌 공식 출처 (Known Sources)\n${options.knownSourceNote.trim()}`);
  }
  if (options?.sources?.length) {
    parts.push('\n📌 주요 출처');
    for (const s of options.sources.slice(0, 5)) {
      parts.push(`· ${s.title} — ${s.url}`);
    }
  }
  if (options?.downloadedFiles?.length) {
    parts.push('\n📥 다운로드');
    for (const f of options.downloadedFiles.slice(0, 5)) {
      parts.push(`· ${f.path}`);
    }
  }
  if (options?.reportPath) {
    parts.push(`\n📄 보고서: ${options.reportPath}`);
  }
  return parts.join('\n').trim();
}

export function isImplementationPlanReply(content: string): boolean {
  const text = content.trim();
  if (!text)
    return false;
  if (isResearchReportReply(text)) {
    return false;
  }
  // Kilo/리서치 완료 보고 — 산출물 경로·FINISHED가 있으면 채팅에 표시
  if (
    /FINISHED/i.test(text) &&
    (/##\s*(학습|작성|산출물|실행)/i.test(text) || /agent\/[^\s]+\/(?:knowledge|outputs)\//i.test(text))
  ) {
    return false;
  }
  if (/```/i.test(text) && /python|py|PyPDF|javascript|typescript/i.test(text)) {
    return true;
  }
  if (
    /PyPDF2|start_page|end_page|저장\s*경로:/i.test(text) ||
    (/Files\s+modified:/i.test(text) && !/FINISHED/i.test(text)) ||
    /수행하기\s*위한\s*단계|다음은\s*이를\s*(?:수행|처리|위한)/i.test(text) ||
    /Python의|라이브러리를\s*사용하여|아래는.*(?:코드|Python|python)/i.test(text)
  ) {
    return true;
  }
  if (
    /^\s*\d+\.\s*\*\*/m.test(text) &&
    /(?:PyPDF|추출(?:할|하는)\s*코드|페이지\s*범위|서준.*(?:폴더|추출)|협력.*코드)/i.test(text)
  ) {
    return true;
  }
  if (/갖고\s*있는\s*수능|수능\s*문제\s*PDF.{0,40}(?:추출|저장|영역)/i.test(text) && /(?:단계|코드|페이지|PyPDF)/i.test(text)) {
    return true;
  }
  return false;
}
export function formatChatReply(content: string): string {
  const original = content.trim();
  if (!original)
    return original;
  if (isImplementationPlanReply(original)) {
    return "";
  }
  let text = original;
  const finalReportMatch = text.match(/##\s*최종\s*CEO\s*보고\s*\n([\s\S]*?)(?:\n---|\n##\s*상사\s*검토|$)/i);
  if (finalReportMatch) {
    text = finalReportMatch[1].trim();
  }
  text = text.replace(/^📋\s*\*\*조직\s*보고\s*완료\*\*[\s\S]*?---\s*/i, "").replace(/\n---\s*\n##\s*상사\s*검토\s*내역[\s\S]*$/i, "").replace(/\n\nFiles modified:.*$/s, "").trim();
  const bossFormatted = formatBossReport(text);
  return bossFormatted || original;
}

/** LLM/API 오류를 사장님께 보여줄 짧은 한국어로 변환 */
export function formatLlmError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  if (/rate_limit|Rate limit/i.test(raw)) {
    const wait = raw.match(/try again in ([\d.]+)s/i);
    if (wait) {
      return `API 사용량 한도에 걸렸어요. ${Math.ceil(parseFloat(wait[1]))}초 후 다시 말씀해 주세요.`;
    }
    return 'API 사용량 한도에 걸렸어요. 잠시 후 다시 말씀해 주세요.';
  }
  if (/unsupported parameter.*max_tokens|max_completion_tokens instead/i.test(raw)) {
    return '모델 API 설정 오류가 발생했어요. Reload Window 후 다시 시도해 주세요.';
  }
  if (raw.length > 180 || raw.includes('OpenAI API error')) {
    return 'AI 응답 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.';
  }
  return raw;
}
