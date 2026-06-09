import { useMemo, useState } from 'react';
import {
  AgentGramSnapshot,
  GramAccount,
  GramPost,
  useAgentGramSnapshot,
} from './agentgram-bridge';

const OWNER_ID = 'owner';

function accountById(id: string, accounts: GramAccount[]): GramAccount {
  return accounts.find((a) => a.id === id) ?? accounts[0];
}

function IconHome({ active }: { active?: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 2}>
      {active ? (
        <path d="M9.005 16.545a2.997 2.997 0 0 1 2.997-2.997h0A2.997 2.997 0 0 1 15 16.545V21h7V11.543L12 4 2 11.543V21h7.005Z" />
      ) : (
        <path d="M9.005 16.545a2.997 2.997 0 0 1 2.997-2.997h0A2.997 2.997 0 0 1 15 16.545V21h7V11.543L12 4 2 11.543V21h7.005Z" strokeLinejoin="round" />
      )}
    </svg>
  );
}

function IconSearch() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" strokeLinecap="round" />
    </svg>
  );
}

function IconCreate() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

function IconHeart({ filled }: { filled?: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill={filled ? '#ed4956' : 'none'} stroke={filled ? '#ed4956' : 'currentColor'} strokeWidth={2}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function IconComment() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function IconShare() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinejoin="round" />
    </svg>
  );
}

function IconBookmark() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconMore() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="6" cy="12" r="1.5" />
      <circle cx="18" cy="12" r="1.5" />
    </svg>
  );
}

function IconGrid() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}

function IconExplore() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconReels() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="2" y="2" width="20" height="20" rx="4" />
      <path d="M10 8l6 4-6 4V8z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconMessages() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function IconNotifications() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function IconInstagramLogo() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function MyStoryBubble({ account, onClick }: { account: GramAccount; onClick?: () => void }) {
  return (
    <button type="button" className="gram-story gram-story-mine" onClick={onClick}>
      <span className="gram-story-mine-ring">
        <span className="gram-avatar gram-avatar-story">
          <span className="gram-avatar-inner" style={{ '--avatar-hue': account.avatarHue } as React.CSSProperties}>
            {account.name.charAt(0)}
          </span>
        </span>
        <span className="gram-story-add" aria-hidden>
          +
        </span>
      </span>
      <span>내 스토리</span>
    </button>
  );
}

function Avatar({
  account,
  size = 'md',
  ring,
  onClick,
}: {
  account: GramAccount;
  size?: 'sm' | 'md' | 'lg' | 'story' | 'xs' | 'profile';
  ring?: boolean;
  onClick?: () => void;
}) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      className={`gram-avatar gram-avatar-${size} ${ring ? 'gram-avatar-ring' : ''}`}
      onClick={onClick}
      style={{ '--avatar-hue': account.avatarHue } as React.CSSProperties}
      title={`@${account.handle}`}
    >
      <span className="gram-avatar-inner">{account.name.charAt(0)}</span>
    </Tag>
  );
}

function PostCard({
  post,
  accounts,
  onLike,
  onOpenProfile,
}: {
  post: GramPost;
  accounts: GramAccount[];
  onLike: () => void;
  onOpenProfile: (id: string) => void;
}) {
  const author = accountById(post.authorId, accounts);
  const liked = post.likedByOwner;
  const [showComments, setShowComments] = useState(false);

  return (
    <article className="gram-post">
      <header className="gram-post-header">
        <Avatar account={author} size="sm" onClick={() => onOpenProfile(author.id)} />
        <div className="gram-post-header-text">
          <button type="button" className="gram-handle" onClick={() => onOpenProfile(author.id)}>
            {author.handle}
          </button>
          {post.location && <span className="gram-location">{post.location}</span>}
        </div>
        <button type="button" className="gram-more-btn" aria-label="더보기">
          <IconMore />
        </button>
      </header>

      <div
        className="gram-post-media"
        style={{ '--media-hue': post.imageHue } as React.CSSProperties}
      >
        <span className="gram-post-media-emoji">{post.imageEmoji}</span>
        <span className="gram-post-media-label">{post.imageLabel}</span>
      </div>

      <div className="gram-post-actions">
        <div className="gram-post-actions-left">
          <button
            type="button"
            className={`gram-action-btn ${liked ? 'liked' : ''}`}
            onClick={onLike}
            aria-label="좋아요"
          >
            <IconHeart filled={liked} />
          </button>
          <button
            type="button"
            className="gram-action-btn"
            onClick={() => setShowComments((v) => !v)}
            aria-label="댓글"
          >
            <IconComment />
          </button>
          <button type="button" className="gram-action-btn" aria-label="공유">
            <IconShare />
          </button>
        </div>
        <button type="button" className="gram-action-btn" aria-label="저장">
          <IconBookmark />
        </button>
      </div>

      <p className="gram-likes">
        좋아요 <strong>{post.likes}</strong>개
      </p>

      <p className="gram-caption">
        <button type="button" className="gram-handle inline" onClick={() => onOpenProfile(author.id)}>
          {post.authorHandle}
        </button>{' '}
        {post.caption}
      </p>

      {post.likedBy.length > 0 && (
        <p className="gram-liked-by">
          <span className="gram-liked-by-label">좋아요:</span> {post.likedBy.join(', ')}
        </p>
      )}

      {(showComments || post.comments.length <= 2) && post.comments.length > 0 && (
        <ul className="gram-comments">
          {post.comments.map((c) => (
            <li key={c.id} className="gram-comment">
              <button
                type="button"
                className="gram-handle inline"
                onClick={() => onOpenProfile(c.authorId)}
              >
                {c.authorHandle}
              </button>{' '}
              {c.text}
              <span className="gram-comment-time">{c.timeAgo}</span>
            </li>
          ))}
        </ul>
      )}

      {post.comments.length > 2 && !showComments && (
        <button type="button" className="gram-view-comments" onClick={() => setShowComments(true)}>
          댓글 {post.comments.length}개 모두 보기
        </button>
      )}

      <time className="gram-time">{post.timeAgo}</time>

      <div className="gram-add-comment">
        <IconComment />
        <span>댓글 달기...</span>
      </div>
    </article>
  );
}

const POST_EMOJIS = ['📝', '💼', '🎯', '✨', '📊', '🏢', '💡', '🚀'];

type BottomTab = 'home' | 'reels' | 'dm' | 'search' | 'profile';

function IconMenu() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
    </svg>
  );
}

function IconChevronDown() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" width={12} height={12}>
      <path d="M17 8h-1V6a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2zm-3-2a2 2 0 1 1 4 0v2h-4V6z" />
    </svg>
  );
}

function IconTagged() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M7 7h10v10H7z" />
      <path d="M7 7l5 5 5-5" />
    </svg>
  );
}

function IconPersonAdd() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="10" cy="8" r="4" />
      <path d="M2 20c0-4 3.6-7 8-7s8 3 8 7M19 8v6M22 11h-6" strokeLinecap="round" />
    </svg>
  );
}

function IconCamera() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M3 9a2 2 0 0 1 2-2h1l1.5-2h9L18 7h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}

function IconBack() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BottomNav({ active, onChange, owner }: { active: BottomTab; onChange: (tab: BottomTab) => void; owner: GramAccount }) {
  return (
    <nav className="gram-bottom-nav">
      <button type="button" className={active === 'home' ? 'active' : ''} onClick={() => onChange('home')} aria-label="홈">
        <IconHome active={active === 'home'} />
      </button>
      <button type="button" className={active === 'reels' ? 'active' : ''} onClick={() => onChange('reels')} aria-label="릴스" disabled>
        <IconReels />
      </button>
      <button type="button" className={active === 'dm' ? 'active' : ''} onClick={() => onChange('dm')} aria-label="메시지" disabled>
        <IconShare />
      </button>
      <button type="button" className={active === 'search' ? 'active' : ''} onClick={() => onChange('search')} aria-label="검색" disabled>
        <IconSearch />
      </button>
      <button type="button" className={`gram-bottom-profile ${active === 'profile' ? 'active' : ''}`} onClick={() => onChange('profile')} aria-label="프로필">
        <Avatar account={owner} size="xs" />
      </button>
    </nav>
  );
}

function ComposePostModal({
  open,
  onClose,
  onSubmit,
  ownerHue,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (caption: string, emoji: string) => void;
  ownerHue: number;
}) {
  const [caption, setCaption] = useState('');
  const [emoji, setEmoji] = useState('📝');

  if (!open) return null;

  const handleSubmit = () => {
    if (!caption.trim()) return;
    onSubmit(caption, emoji);
    setCaption('');
    setEmoji('📝');
    onClose();
  };

  return (
    <div className="gram-compose-overlay" onClick={onClose}>
      <div className="gram-compose-sheet" onClick={(e) => e.stopPropagation()}>
        <header className="gram-compose-header">
          <button type="button" onClick={onClose}>
            취소
          </button>
          <span>새 게시물</span>
          <button type="button" className="gram-compose-share" onClick={handleSubmit} disabled={!caption.trim()}>
            공유
          </button>
        </header>
        <div className="gram-compose-preview" style={{ '--media-hue': ownerHue } as React.CSSProperties}>
          <span className="gram-compose-emoji">{emoji}</span>
          <p>{caption.trim() || '내용을 입력하세요'}</p>
        </div>
        <div className="gram-compose-emoji-row">
          {POST_EMOJIS.map((e) => (
            <button key={e} type="button" className={emoji === e ? 'active' : ''} onClick={() => setEmoji(e)}>
              {e}
            </button>
          ))}
        </div>
        <textarea
          className="gram-compose-input"
          placeholder="문구 입력..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={5}
          autoFocus
        />
      </div>
    </div>
  );
}

function DiscoverCarousel({
  agents,
  onOpenProfile,
}: {
  agents: GramAccount[];
  onOpenProfile: (id: string) => void;
}) {
  return (
    <section className="gram-discover">
      <div className="gram-discover-head">
        <span>사람 찾아보기</span>
        <button type="button" className="gram-see-all-btn">
          모두 보기
        </button>
      </div>
      <div className="gram-discover-scroll">
        {agents.map((account) => (
          <div key={account.id} className="gram-discover-card">
            <button type="button" className="gram-discover-dismiss" aria-label="닫기">
              ×
            </button>
            <Avatar account={account} size="md" onClick={() => onOpenProfile(account.id)} />
            <button type="button" className="gram-discover-name" onClick={() => onOpenProfile(account.id)}>
              {account.handle}
            </button>
            <span className="gram-discover-sub">{account.title} · 회사 에이전트</span>
            <button type="button" className="gram-discover-follow">
              팔로우
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function FollowRequestsBanner({
  requests,
  onRespond,
}: {
  requests: AgentGramSnapshot['pendingFollowRequests'];
  onRespond: (requestId: string, accept: boolean) => void;
}) {
  if (requests.length === 0) return null;
  return (
    <section className="gram-follow-requests">
      <h4>팔로우 요청</h4>
      {requests.map((req) => (
        <div key={req.id} className="gram-follow-request-row">
          <span>
            <strong>{req.fromName}</strong> (@{req.fromHandle})
          </span>
          <div>
            <button type="button" className="gram-follow-accept" onClick={() => onRespond(req.id, true)}>
              수락
            </button>
            <button type="button" className="gram-follow-reject" onClick={() => onRespond(req.id, false)}>
              거절
            </button>
          </div>
        </div>
      ))}
    </section>
  );
}

function OwnerProfileScreen({
  owner,
  ownerPosts,
  agentAccounts,
  followRequests,
  showDiscover,
  onToggleDiscover,
  onCompose,
  onOpenAgent,
  onRespondFollow,
}: {
  owner: GramAccount;
  ownerPosts: GramPost[];
  agentAccounts: GramAccount[];
  followRequests: AgentGramSnapshot['pendingFollowRequests'];
  showDiscover: boolean;
  onToggleDiscover: () => void;
  onCompose: () => void;
  onOpenAgent: (id: string) => void;
  onRespondFollow: (requestId: string, accept: boolean) => void;
}) {
  const postCount = owner.posts;
  const profileTasks = [
    { id: 'name', label: '이름 추가', done: !!owner.name, emoji: '🌈', action: '이름 추가' },
    { id: 'photo', label: '프로필 사진 추가', done: false, emoji: '☀️', action: '사진 추가' },
    { id: 'post', label: '첫 게시물 작성', done: postCount > 0, emoji: '📷', action: '게시물 작성' },
    { id: 'bio', label: '소개 추가', done: !!owner.bio, emoji: '✍️', action: '소개 추가' },
  ];
  const completedCount = profileTasks.filter((t) => t.done).length;

  return (
    <div className="gram-owner-profile">
      <header className="gram-profile-bar">
        <button type="button" className="gram-profile-bar-btn" onClick={onCompose} aria-label="새 게시물">
          <IconCreate />
        </button>
        <button type="button" className="gram-profile-bar-user">
          <IconLock />
          <span>{owner.handle}</span>
          <IconChevronDown />
        </button>
        <button type="button" className="gram-profile-bar-btn" aria-label="메뉴">
          <IconMenu />
        </button>
      </header>

      <div className="gram-profile-summary">
        <div className="gram-profile-avatar-col">
          <span className="gram-profile-note">첫 메모를 작성해보세요...</span>
          <button type="button" className="gram-profile-avatar-btn" onClick={onCompose}>
            <span className="gram-profile-avatar-empty">
              <IconCamera />
            </span>
            <span className="gram-profile-avatar-add">+</span>
          </button>
        </div>
        <div className="gram-profile-stats-row">
          <div>
            <strong>{postCount}</strong>
            <span>게시물</span>
          </div>
          <div>
            <strong>{owner.followers}</strong>
            <span>팔로워</span>
          </div>
          <div>
            <strong>{owner.following}</strong>
            <span>팔로잉</span>
          </div>
        </div>
      </div>

      <div className="gram-profile-name-block">
        <strong>{owner.name}</strong>
        <span>{owner.title}</span>
        <p>{owner.bio}</p>
      </div>

      <div className="gram-profile-action-row">
        <button type="button" className="gram-profile-action-btn">
          프로필 편집
        </button>
        <button type="button" className="gram-profile-action-btn">
          프로필 공유
        </button>
        <button type="button" className="gram-profile-action-icon" onClick={onToggleDiscover} aria-label="사람 찾아보기">
          <IconPersonAdd />
        </button>
      </div>

      <FollowRequestsBanner requests={followRequests} onRespond={onRespondFollow} />

      {showDiscover && <DiscoverCarousel agents={agentAccounts.slice(0, 6)} onOpenProfile={onOpenAgent} />}

      <div className="gram-profile-tab-icons">
        <button type="button" className="active" aria-label="게시물">
          <IconGrid />
        </button>
        <button type="button" aria-label="릴스" disabled>
          <IconReels />
        </button>
        <button type="button" aria-label="태그됨" disabled>
          <IconTagged />
        </button>
      </div>

      {postCount === 0 ? (
        <section className="gram-profile-complete">
          <h3>프로필 완성하기</h3>
          <p>
            <strong>{completedCount}/4개</strong> 완료
          </p>
          <div className="gram-profile-complete-scroll">
            {profileTasks.map((task) => (
              <div key={task.id} className={`gram-complete-card ${task.done ? 'done' : ''}`}>
                <span className="gram-complete-emoji">{task.emoji}</span>
                <strong>{task.label}</strong>
                <p>{task.done ? '완료됨' : '프로필을 더 풍성하게 만들어 보세요.'}</p>
                {!task.done && (
                  <button
                    type="button"
                    className="gram-complete-action"
                    onClick={task.id === 'post' ? onCompose : undefined}
                    disabled={task.id !== 'post'}
                  >
                    {task.action}
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : (
        <div className="gram-profile-grid-mobile">
          {ownerPosts.map((post) => (
            <div
              key={post.id}
              className="gram-grid-cell"
              style={{ '--media-hue': post.imageHue } as React.CSSProperties}
              title={post.caption}
            >
              <span>{post.imageEmoji}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AgentProfileScreen({
  account,
  posts,
  onBack,
}: {
  account: GramAccount;
  posts: GramPost[];
  onBack: () => void;
}) {
  const userPosts = posts.filter((p) => p.authorId === account.id);

  return (
    <div className="gram-owner-profile">
      <header className="gram-profile-bar">
        <button type="button" className="gram-profile-bar-btn" onClick={onBack} aria-label="뒤로">
          <IconBack />
        </button>
        <button type="button" className="gram-profile-bar-user">
          <span>{account.handle}</span>
          <IconChevronDown />
        </button>
        <button type="button" className="gram-profile-bar-btn" aria-label="메뉴">
          <IconMenu />
        </button>
      </header>

      <div className="gram-profile-summary">
        <div className="gram-profile-avatar-col">
          <Avatar account={account} size="profile" />
        </div>
        <div className="gram-profile-stats-row">
          <div>
            <strong>{userPosts.length || account.posts}</strong>
            <span>게시물</span>
          </div>
          <div>
            <strong>{account.followers}</strong>
            <span>팔로워</span>
          </div>
          <div>
            <strong>{account.following}</strong>
            <span>팔로잉</span>
          </div>
        </div>
      </div>

      <div className="gram-profile-name-block">
        <strong>{account.name}</strong>
        <span>{account.title}</span>
        <p>{account.bio}</p>
      </div>

      <div className="gram-profile-action-row">
        <button type="button" className="gram-profile-action-btn">
          팔로우
        </button>
        <button type="button" className="gram-profile-action-btn">
          메시지
        </button>
      </div>

      <div className="gram-profile-tab-icons">
        <button type="button" className="active" aria-label="게시물">
          <IconGrid />
        </button>
        <button type="button" aria-label="릴스" disabled>
          <IconReels />
        </button>
        <button type="button" aria-label="태그됨" disabled>
          <IconTagged />
        </button>
      </div>

      <div className="gram-profile-grid-mobile">
        {userPosts.map((post) => (
          <div
            key={post.id}
            className="gram-grid-cell"
            style={{ '--media-hue': post.imageHue } as React.CSSProperties}
            title={post.imageLabel}
          >
            <span>{post.imageEmoji}</span>
          </div>
        ))}
        {userPosts.length === 0 && <p className="gram-profile-empty-mobile">게시물이 없습니다.</p>}
      </div>
    </div>
  );
}

function FeedScreen({
  owner,
  accounts,
  posts,
  onLike,
  onOpenAgent,
  onOpenOwner,
}: {
  owner: GramAccount;
  accounts: GramAccount[];
  posts: GramPost[];
  onLike: (postId: string) => void;
  onOpenAgent: (id: string) => void;
  onOpenOwner: () => void;
}) {
  const allAccounts = useMemo(() => [owner, ...accounts], [owner, accounts]);
  const storyAccounts = accounts.filter((a) => a.hasStory);

  return (
    <div className="gram-feed-screen">
      <header className="gram-feed-bar">
        <span className="gram-feed-logo">Instagram</span>
        <button type="button" aria-label="알림" disabled>
          <IconNotifications />
        </button>
      </header>
      <div className="gram-stories">
        <MyStoryBubble account={owner} onClick={onOpenOwner} />
        {storyAccounts.map((account) => (
          <button key={account.id} type="button" className="gram-story" onClick={() => onOpenAgent(account.id)}>
            <Avatar account={account} size="story" ring />
            <span>{account.name}</span>
          </button>
        ))}
      </div>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          accounts={allAccounts}
          onLike={() => onLike(post.id)}
          onOpenProfile={(id) => (id === OWNER_ID ? onOpenOwner() : onOpenAgent(id))}
        />
      ))}
      {posts.length === 0 && (
        <p className="gram-feed-empty">에이전트들이 오늘 첫 글을 준비 중입니다.</p>
      )}
    </div>
  );
}

export function AgentGramApp() {
  const { snapshot, loadError, refresh, createOwnerPost, toggleOwnerLike, respondFollowRequest } =
    useAgentGramSnapshot();
  const [bottomTab, setBottomTab] = useState<BottomTab>('profile');
  const [agentProfileId, setAgentProfileId] = useState<string | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [showDiscover, setShowDiscover] = useState(true);

  const owner = snapshot?.owner;
  const accounts = snapshot?.accounts ?? [];
  const posts = snapshot?.posts ?? [];
  const pendingFollowRequests = snapshot?.pendingFollowRequests ?? [];
  const allAccounts = useMemo(
    () => (owner ? [owner, ...accounts] : accounts),
    [owner, accounts]
  );
  const ownerPosts = useMemo(
    () => posts.filter((p) => p.authorId === OWNER_ID),
    [posts]
  );

  if (!snapshot || !owner) {
    return (
      <div className="gram-app">
        <div className="gram-mobile-frame">
          <div className="gram-placeholder-screen">
            {loadError ? (
              <>
                <p>AgentGram을 불러오지 못했습니다.</p>
                <p style={{ fontSize: 12, color: '#8e8e8e', marginTop: 8 }}>{loadError}</p>
                <button type="button" className="gram-complete-action" style={{ marginTop: 16 }} onClick={refresh}>
                  다시 시도
                </button>
              </>
            ) : (
              <p>AgentGram 불러오는 중...</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const openAgent = (id: string) => {
    setAgentProfileId(id);
    setBottomTab('profile');
  };

  const openOwnerProfile = () => {
    setAgentProfileId(null);
    setBottomTab('profile');
  };

  const agentAccount = agentProfileId
    ? accountById(agentProfileId, allAccounts)
    : null;

  let content: React.ReactNode;
  if (agentAccount && agentAccount.id !== OWNER_ID) {
    content = <AgentProfileScreen account={agentAccount} posts={posts} onBack={openOwnerProfile} />;
  } else if (bottomTab === 'home') {
    content = (
      <FeedScreen
        owner={owner}
        accounts={accounts}
        posts={posts}
        onLike={toggleOwnerLike}
        onOpenAgent={openAgent}
        onOpenOwner={openOwnerProfile}
      />
    );
  } else if (bottomTab === 'profile') {
    content = (
      <OwnerProfileScreen
        owner={owner}
        ownerPosts={ownerPosts}
        agentAccounts={accounts}
        followRequests={pendingFollowRequests}
        showDiscover={showDiscover}
        onToggleDiscover={() => setShowDiscover((v) => !v)}
        onCompose={() => setShowCompose(true)}
        onOpenAgent={openAgent}
        onRespondFollow={respondFollowRequest}
      />
    );
  } else {
    content = (
      <div className="gram-placeholder-screen">
        <p>준비 중입니다.</p>
      </div>
    );
  }

  return (
    <div className="gram-app">
      <div className="gram-mobile-frame">
        <main className="gram-mobile-main">{content}</main>
        <BottomNav
          active={agentProfileId && agentAccount?.id !== OWNER_ID ? 'profile' : bottomTab}
          onChange={(tab) => {
            if (tab === 'profile') setAgentProfileId(null);
            setBottomTab(tab);
          }}
          owner={owner}
        />
      </div>
      <ComposePostModal
        open={showCompose}
        onClose={() => setShowCompose(false)}
        onSubmit={createOwnerPost}
        ownerHue={owner.avatarHue}
      />
    </div>
  );
}
