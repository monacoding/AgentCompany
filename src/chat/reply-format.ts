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
export function isImplementationPlanReply(content: string): boolean {
  const text = content.trim();
  if (!text)
    return false;
  if (/```/i.test(text) && /python|py|PyPDF|javascript|typescript/i.test(text)) {
    return true;
  }
  if (/PyPDF2|start_page|end_page|저장\s*경로:|Files\s+modified:/i.test(text) || /수행하기\s*위한\s*단계|다음은\s*이를\s*(?:수행|처리|위한)/i.test(text) || /Python의|라이브러리를\s*사용하여|아래는.*(?:코드|Python|python)/i.test(text)) {
    return true;
  }
  if (/^\s*\d+\.\s*\*\*/m.test(text) && /(?:서준|협력|PDF|추출|폴더|저장|제공받)/i.test(text)) {
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
