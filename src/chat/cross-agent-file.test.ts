import {
  detectCrossAgentFileRequest,
  isImplementationTask,
} from './cross-agent-file';
import type { Agent } from '../types';

function makeAgent(partial: Partial<Agent> & Pick<Agent, 'id' | 'name'>): Agent {
  return {
    role: 'developer',
    status: 'idle',
    folderPath: `/agent/${partial.id}`,
    ...partial,
  } as Agent;
}

const hanSeojun = makeAgent({ id: 'researcher', name: '한서준', title: '리서처' });
const haJeongwoo = makeAgent({ id: 'developer', name: '하정우', title: '개발자' });
const allAgents = [hanSeojun, haJeongwoo];

const findAgent = (mention: string) =>
  allAgents.find((a) => a.name.includes(mention.replace('@', ''))) ?? null;

// Manual sanity checks
console.assert(
  isImplementationTask('@하정우 한서준이 찾은 PDF 기반 다운로드 스크립트 구현해줘'),
  'collab script impl'
);
console.assert(
  !isImplementationTask('@하정우 @한서준 PDF 파일만 전달해줘'),
  'pure transfer is not impl'
);
console.assert(
  detectCrossAgentFileRequest(
    '@하정우 한서준이 찾은 PDF 기반 스크립트 구현',
    haJeongwoo,
    findAgent,
    allAgents
  ) === null,
  'impl command must not match cross-agent file'
);
console.assert(
  detectCrossAgentFileRequest(
    '@하정우 @한서준 폴더에 있는 PDF 가져와',
    haJeongwoo,
    findAgent,
    allAgents
  ) !== null,
  'pure fetch should still match'
);
