/** knowledge 폴더 LLM 재학습이 필요한 업무성 명령인지 판별 */
export function commandNeedsKnowledgeLearning(command: string): boolean {
  const text = command.trim();
  if (!text) return false;

  if (
    /^(?:안녕|하이|헬로|hello|hi|반가|고마워|감사|수고|잘\s*자|ㅎㅇ)(?:요|하세요|\?|!|~)*$/i.test(
      text
    )
  ) {
    return false;
  }

  // outputs/ 산출물 조회·전달은 파일 검색으로 처리 — knowledge 폴더 재학습 불필요
  return /knowledge|지식|학습|조사|리서치|크롤|구현|작성|만들|분석|코드|수능|기출|에이전트|웹|검색|수집|제작|기획|대본|쇼츠|영상|api|날씨/i.test(
    text
  );
}
