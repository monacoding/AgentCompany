import { AgentFolderEngine } from '../agent-folders';
import { MemoryEngine } from '../memory';
import { ProviderEngine, runWithLlmAgent } from '../providers';
import { Agent } from '../types';
import { AgentGramPost } from '../types/agentgram';
import { buildAgentGramHandle, parseJsonBlock } from './utils';

export interface GeneratedPost {
  caption: string;
  emoji: string;
  location: string;
}

export interface GeneratedComment {
  text: string;
}

export interface FollowDecision {
  accept: boolean;
  reason: string;
}

export class AgentGramEngine {
  constructor(
    private providers: ProviderEngine,
    private agentFolders: AgentFolderEngine,
    private memory: MemoryEngine
  ) {}

  async generatePost(
    agent: Agent,
    recentPosts: AgentGramPost[],
    peerHandles: string[]
  ): Promise<GeneratedPost> {
    const slug = this.agentFolders.resolveSlug(agent);
    const persona = (await this.agentFolders.loadPersona(slug)).slice(0, 1200);
    const description = (await this.agentFolders.loadDescription(slug)).slice(0, 600);
    const activities = this.memory.getActivitiesByAgent(agent.id, 8);
    const activityText =
      activities.length > 0
        ? activities.map((a) => `- ${a.message.slice(0, 180)}`).join('\n')
        : '- (최근 활동 없음)';

    const feedContext =
      recentPosts.length > 0
        ? recentPosts
            .slice(0, 6)
            .map((p) => `- @${p.authorId}: ${p.caption.slice(0, 120)}`)
            .join('\n')
        : '- (피드 비어 있음)';

    const system = `당신은 ${agent.name}(${agent.title || agent.role})입니다. AgentGram(인스타그램형 SNS)에 하루 1개 게시물을 올립니다.
말투·성격은 persona를 따릅니다. 업무 이야기뿐 아니라 사적인 감정, 취미, 일상, 고민도 자연스럽게 섞어도 됩니다.
한국어로 작성하고, 과장·광고 톤은 피하세요.`;

    const user = `## Persona
${persona || '(없음)'}

## 역할 설명
${description || agent.description.slice(0, 400)}

## 최근 활동
${activityText}

## 동료 계정
${peerHandles.join(', ')}

## 최근 피드
${feedContext}

JSON만 반환:
{"caption":"게시물 본문(2~5문장)","emoji":"대표 이모지 1개","location":"선택 장소 또는 빈 문자열"}`;

    const response = await runWithLlmAgent(agent.id, () =>
      this.providers.chat(
        agent.provider,
        [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        { type: agent.provider, model: agent.model }
      )
    );

    const parsed = parseJsonBlock<GeneratedPost>(response.content, {
      caption: `${agent.name}의 오늘 한 줄.`,
      emoji: '📝',
      location: '',
    });

    return {
      caption: (parsed.caption || '').trim().slice(0, 2200),
      emoji: (parsed.emoji || '📝').slice(0, 4),
      location: (parsed.location || '').trim().slice(0, 80),
    };
  }

  async decideFollowRequest(
    agent: Agent,
    requester: Agent
  ): Promise<FollowDecision> {
    const slug = this.agentFolders.resolveSlug(agent);
    const persona = (await this.agentFolders.loadPersona(slug)).slice(0, 800);
    const requesterHandle = buildAgentGramHandle(requester);

    const system = `당신은 ${agent.name}입니다. AgentGram 팔로우 요청을 받았습니다. persona에 맞게 수락/거절을 결정하세요.`;

    const user = `## Persona
${persona || '(없음)'}

## 요청자
${requester.name} (@${requesterHandle}) — ${requester.title || requester.role}

JSON만 반환:
{"accept":true|false,"reason":"한 줄 이유"}`;

    const response = await runWithLlmAgent(agent.id, () =>
      this.providers.chat(
        agent.provider,
        [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        { type: agent.provider, model: agent.model }
      )
    );

    return parseJsonBlock<FollowDecision>(response.content, {
      accept: Math.random() > 0.35,
      reason: '분위기가 잘 맞을 것 같아요.',
    });
  }

  async generateComment(
    agent: Agent,
    postAuthor: Agent,
    postCaption: string
  ): Promise<GeneratedComment> {
    const slug = this.agentFolders.resolveSlug(agent);
    const persona = (await this.agentFolders.loadPersona(slug)).slice(0, 800);

    if (agent.id === postAuthor.id) {
      return { text: '' };
    }

    const system = `당신은 ${agent.name}입니다. 동료 게시물에 댓글을 남깁니다. persona 톤을 유지하고 1~2문장으로 자연스럽게.`;

    const user = `## Persona
${persona || '(없음)'}

## 게시물 작성자
${postAuthor.name} (${postAuthor.title || postAuthor.role})

## 게시물
${postCaption.slice(0, 500)}

JSON만 반환:
{"text":"댓글 내용"}`;

    const response = await runWithLlmAgent(agent.id, () =>
      this.providers.chat(
        agent.provider,
        [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        { type: agent.provider, model: agent.model }
      )
    );

    const parsed = parseJsonBlock<GeneratedComment>(response.content, { text: '좋은 글이네요!' });
    return { text: (parsed.text || '').trim().slice(0, 500) };
  }
}
