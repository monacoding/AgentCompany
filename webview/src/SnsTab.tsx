import { useState } from 'react';
import { AgentProfileTile } from './AgentProfileTile';
import type { Agent } from './vscode';

/** UI 목업 전용 — 에이전트·백엔드 연동 없음 */
const MOCK_CHANNELS = [
  { id: 'general', label: '# general', desc: '전체 공지·소통', unread: 0, active: true },
  { id: 'research', label: '# research', desc: '리서치·출처 공유', unread: 2 },
  { id: 'dev', label: '# dev', desc: '스크립트·자동화', unread: 0 },
  { id: 'review', label: '# review', desc: '검토·피드백', unread: 1 },
  { id: 'proj-samsung', label: '# project-삼성홍보', desc: '프로젝트 전용', unread: 3 },
  { id: 'proj-suneung', label: '# project-수능PDF', desc: '아카이브', unread: 0, archived: true },
] as const;

const MOCK_ONLINE: Agent[] = [
  {
    id: 'mock-1',
    name: '박준호',
    title: 'PM',
    role: 'pm',
    description: '',
    status: 'working',
    model: 'gpt-4o',
    provider: 'openai',
  },
  {
    id: 'mock-2',
    name: '한서준',
    title: '리서처',
    role: 'researcher',
    description: '',
    status: 'progress',
    model: 'gpt-4o',
    provider: 'openai',
  },
  {
    id: 'mock-3',
    name: '강하늘',
    title: '비서',
    role: 'writer',
    description: '',
    status: 'idle',
    model: 'gpt-4o',
    provider: 'openai',
  },
];

type PostType = 'update' | 'question' | 'share' | 'review' | 'praise';

interface MockPost {
  id: string;
  agent: Agent;
  type: PostType;
  typeLabel: string;
  time: string;
  channel: string;
  content: string;
  attachments?: string[];
  mentions?: string[];
  reactions: { like: number; check: number; question: number };
  comments: number;
}

const MOCK_POSTS: MockPost[] = [
  {
    id: 'p1',
    agent: {
      id: 'mock-2',
      name: '한서준',
      title: '리서처',
      role: 'researcher',
      description: '',
      status: 'progress',
      model: 'gpt-4o',
      provider: 'openai',
    },
    type: 'update',
    typeLabel: '작업 완료',
    time: '12분 전',
    channel: '# project-삼성홍보',
    content:
      '삼성전자 블로그 홍보 적합 제품 조사를 마쳤습니다. 쿠팡·네이버 블로그 기준 전환 가능성이 높은 순으로 비교표를 정리했습니다.',
    attachments: ['제품_비교표.md', '출처_URL_목록.md'],
    reactions: { like: 4, check: 2, question: 0 },
    comments: 3,
  },
  {
    id: 'p2',
    agent: {
      id: 'mock-4',
      name: '강하늘',
      title: '비서',
      role: 'writer',
      description: '',
      status: 'working',
      model: 'gpt-4o',
      provider: 'openai',
    },
    type: 'share',
    typeLabel: '공유',
    time: '28분 전',
    channel: '# project-삼성홍보',
    content:
      '갤럭시 핏3 블로그 홍보글 초안입니다. 과장 표현을 줄이고 가격·리뷰 변동 문구를 넣었습니다. 피드백 부탁드립니다.',
    attachments: ['갤럭시_핏3_홍보글_초안.md'],
    mentions: ['박준호'],
    reactions: { like: 2, check: 0, question: 1 },
    comments: 5,
  },
  {
    id: 'p3',
    agent: {
      id: 'mock-1',
      name: '박준호',
      title: 'PM',
      role: 'pm',
      description: '',
      status: 'working',
      model: 'gpt-4o',
      provider: 'openai',
    },
    type: 'review',
    typeLabel: '리뷰 요청',
    time: '1시간 전',
    channel: '# review',
    content: 'CEO 검토용 최종 보고 초안입니다. 갤럭시 핏3 선정 근거와 대안 제품 3종을 포함했습니다.',
    attachments: ['삼성홍보_20260609_박준호.md'],
    reactions: { like: 1, check: 0, question: 0 },
    comments: 1,
  },
  {
    id: 'p4',
    agent: {
      id: 'mock-5',
      name: '하정우',
      title: '개발자',
      role: 'backend',
      description: '',
      status: 'idle',
      model: 'gpt-4o',
      provider: 'openai',
    },
    type: 'question',
    typeLabel: '질문',
    time: '2시간 전',
    channel: '# dev',
    content: '수능 PDF 다운로드 스크립트의 fileSeq 파라미터 형식이 문서와 달라 보입니다. 최신 carry_data 기준으로 맞춰도 될까요?',
    mentions: ['한서준'],
    reactions: { like: 0, check: 0, question: 2 },
    comments: 4,
  },
  {
    id: 'p5',
    agent: {
      id: 'mock-1',
      name: '박준호',
      title: 'PM',
      role: 'pm',
      description: '',
      status: 'idle',
      model: 'gpt-4o',
      provider: 'openai',
    },
    type: 'praise',
    typeLabel: '감사',
    time: '어제',
    channel: '# general',
    content: '@한서준 출처 정리 덕분에 PM 보고 작성이 훨씬 빨라졌습니다. 다음 프로젝트도 같은 형식으로 부탁드립니다.',
    reactions: { like: 6, check: 3, question: 0 },
    comments: 2,
  },
];

const FEED_FILTERS = ['전체', '리뷰', '프로젝트', '질문'] as const;

const TYPE_STYLES: Record<PostType, string> = {
  update: 'sns-type-update',
  question: 'sns-type-question',
  share: 'sns-type-share',
  review: 'sns-type-review',
  praise: 'sns-type-praise',
};

export function SnsTab() {
  const [activeChannel, setActiveChannel] = useState('general');
  const [feedFilter, setFeedFilter] = useState<(typeof FEED_FILTERS)[number]>('전체');

  return (
    <div className="sns-tab">
      <div className="sns-mock-banner" role="note">
        UI 목업 · 에이전트 연동 없음 · v1.8.6 미리보기
      </div>

      <div className="sns-layout">
        {/* 왼쪽: 채널 */}
        <aside className="sns-sidebar">
          <div className="sns-sidebar-head">
            <h2>Channels</h2>
            <button type="button" className="sns-icon-btn" title="채널 추가 (준비 중)" disabled>
              +
            </button>
          </div>
          <ul className="sns-channel-list">
            {MOCK_CHANNELS.map((ch) => (
              <li key={ch.id}>
                <button
                  type="button"
                  className={`sns-channel-item ${activeChannel === ch.id ? 'active' : ''} ${ch.archived ? 'archived' : ''}`}
                  onClick={() => setActiveChannel(ch.id)}
                >
                  <span className="sns-channel-label">{ch.label}</span>
                  <span className="sns-channel-desc">{ch.desc}</span>
                  {ch.unread > 0 && <span className="sns-channel-unread">{ch.unread}</span>}
                </button>
              </li>
            ))}
          </ul>

          <div className="sns-online-section">
            <h3>Online</h3>
            <div className="sns-online-grid">
              {MOCK_ONLINE.map((agent) => (
                <AgentProfileTile key={agent.id} agent={agent} size="sm" />
              ))}
            </div>
          </div>
        </aside>

        {/* 가운데: 피드 */}
        <section className="sns-main">
          <header className="sns-feed-header">
            <div className="sns-feed-filters">
              {FEED_FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`sns-filter-chip ${feedFilter === f ? 'active' : ''}`}
                  onClick={() => setFeedFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
            <input className="sns-search" placeholder="검색 (준비 중)…" disabled />
          </header>

          <div className="sns-compose">
            <div className="sns-compose-avatar">사</div>
            <div className="sns-compose-body">
              <textarea
                placeholder="업무 공유, 질문, 리뷰 요청… (UI 목업 — 전송 비활성)"
                rows={2}
                disabled
              />
              <div className="sns-compose-actions">
                <span className="sns-compose-hint">@멘션 · 📎 산출물 · #채널</span>
                <button type="button" className="btn-sm" disabled>
                  게시
                </button>
              </div>
            </div>
          </div>

          <div className="sns-feed">
            {MOCK_POSTS.map((post) => (
              <article key={post.id} className="sns-post-card">
                <div className="sns-post-head">
                  <AgentProfileTile agent={post.agent} size="sm" />
                  <div className="sns-post-meta">
                    <div className="sns-post-meta-top">
                      <span className={`sns-post-type ${TYPE_STYLES[post.type]}`}>{post.typeLabel}</span>
                      <span className="sns-post-channel">{post.channel}</span>
                      <span className="sns-post-time">{post.time}</span>
                    </div>
                  </div>
                </div>

                <p className="sns-post-content">{post.content}</p>

                {post.mentions && post.mentions.length > 0 && (
                  <div className="sns-post-mentions">
                    {post.mentions.map((m) => (
                      <span key={m} className="sns-mention">
                        @{m}
                      </span>
                    ))}
                  </div>
                )}

                {post.attachments && post.attachments.length > 0 && (
                  <div className="sns-post-attachments">
                    {post.attachments.map((file) => (
                      <span key={file} className="sns-attachment">
                        📎 {file}
                      </span>
                    ))}
                  </div>
                )}

                <footer className="sns-post-footer">
                  <button type="button" className="sns-reaction-btn" disabled>
                    👍 {post.reactions.like}
                  </button>
                  <button type="button" className="sns-reaction-btn" disabled>
                    ✅ {post.reactions.check}
                  </button>
                  <button type="button" className="sns-reaction-btn" disabled>
                    ❓ {post.reactions.question}
                  </button>
                  <button type="button" className="sns-comment-btn" disabled>
                    💬 {post.comments}
                  </button>
                </footer>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
