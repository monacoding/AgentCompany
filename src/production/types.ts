import { Agent } from '../types';

export function isProductionAgent(agent: Agent): boolean {
  return agent.capabilities?.includes("video-production") === true || agent.name.includes("\uC11C\uC724") || (agent.title?.includes("\uC601\uC0C1") ?? false) || (agent.title?.includes("\uC81C\uC791") ?? false) || (agent.title?.includes("\uD06C\uB9AC\uC5D0\uC774\uD2F0\uBE0C") ?? false);
}
export function isProductionTaskQuery(query: string): boolean {
  const text = query.trim();
  if (!text)
    return false;
  if (/스택|도구|뭐가 필요|알려줘|설명|추천해|어떤.*있어/i.test(text) && !/제작|만들|작성|기획해/i.test(text)) {
    return false;
  }
  const hasAction = /제작|만들|만들어|제작해|찍|촬영|편집해|업로드해|작성해|기획해|시작해|진행해/i.test(text);
  const hasDeliverable = /대본|스토리보드|브리프|썸네일|씬\s*json|나레이션/i.test(text);
  const hasFormat = /쇼츠|숏폼|롱폼|릴스/i.test(text);
  const videoMake = /영상.*(제작|만들|찍|편집)|(제작|만들).*(영상|콘텐츠)|(유튜브|틱톡).*(제작|만들|업로드)/i.test(text);
  return hasAction || hasDeliverable || hasFormat || videoMake;
}
