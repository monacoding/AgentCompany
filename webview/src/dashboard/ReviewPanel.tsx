import { useState } from 'react';
import { formatAgentLabel } from '../agent-display';
import { Agent, Task, postMessage } from '../vscode';

function agentStatusDot(status: string): string {
  if (status === 'working' || status === 'progress') return 'thinking';
  if (status === 'idle') return 'idle';
  return 'online';
}

function AgentAvatar({
  agent,
  photoUrl,
  onClick,
}: {
  agent: Agent;
  photoUrl?: string;
  onClick?: () => void;
}) {
  const initial = agent.name.charAt(0);
  const dotClass = agentStatusDot(agent.status);

  return (
    <button
      type="button"
      className="review-agent-avatar"
      onClick={onClick}
      title={`${formatAgentLabel(agent)} — 작업 기록 보기`}
    >
      {photoUrl ? (
        <img src={photoUrl} alt="" className="review-agent-photo" />
      ) : (
        <span className="review-agent-initial">{initial}</span>
      )}
      <span className={`review-agent-dot ${dotClass}`} />
    </button>
  );
}

export function ReviewPanel({
  reviewTasks,
  agents,
  agentPhotos,
  onApprove,
  onReject,
  onAgentClick,
}: {
  reviewTasks: Task[];
  agents: Agent[];
  agentPhotos?: Record<string, string>;
  onApprove: (taskId: string) => void;
  onReject: (taskId: string) => void;
  onAgentClick: (agentId: string) => void;
}) {
  const [commentTaskId, setCommentTaskId] = useState<string | null>(null);
  const [comment, setComment] = useState('');

  if (reviewTasks.length === 0) return null;

  const handleComment = (taskId: string) => {
    if (!comment.trim()) {
      setCommentTaskId(taskId);
      return;
    }
    postMessage('rejectTask', { taskId, reason: comment.trim() });
    setComment('');
    setCommentTaskId(null);
  };

  return (
    <section className="review-panel-v2 glass-panel" aria-label="CEO Review">
      <header className="review-panel-v2-header">
        <div>
          <h2>CEO Review</h2>
          <p className="review-panel-v2-sub">승인 대기 {reviewTasks.length}건 — 빠른 처리</p>
        </div>
        <span className="review-panel-v2-count">{reviewTasks.length}</span>
      </header>

      <div className="review-panel-v2-list">
        {reviewTasks.map((task) => {
          const agent = agents.find((a) => a.id === task.agentId);
          const showComment = commentTaskId === task.id;

          return (
            <article key={task.id} className="review-card-v2">
              <div className="review-card-v2-main">
                {agent && (
                  <AgentAvatar
                    agent={agent}
                    photoUrl={agentPhotos?.[agent.id]}
                    onClick={() => onAgentClick(agent.id)}
                  />
                )}
                <div className="review-card-v2-body">
                  <h3 className="review-card-v2-title">{task.title}</h3>
                  {agent && (
                    <button
                      type="button"
                      className="review-card-v2-agent-link"
                      onClick={() => onAgentClick(agent.id)}
                    >
                      {formatAgentLabel(agent)}
                    </button>
                  )}
                  {task.result && (
                    <p className="review-card-v2-preview">{task.result.slice(0, 180)}…</p>
                  )}
                </div>
              </div>

              {showComment && (
                <div className="review-comment-box">
                  <input
                    placeholder="수정 요청 코멘트…"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleComment(task.id)}
                    autoFocus
                  />
                </div>
              )}

              <div className="review-card-v2-actions">
                <button
                  type="button"
                  className="review-btn approve"
                  onClick={() => onApprove(task.id)}
                >
                  ✓ Approve
                </button>
                <button
                  type="button"
                  className="review-btn reject"
                  onClick={() => onReject(task.id)}
                >
                  ✕ Reject
                </button>
                <button
                  type="button"
                  className="review-btn comment"
                  onClick={() => {
                    if (showComment && comment.trim()) {
                      handleComment(task.id);
                    } else {
                      setCommentTaskId(showComment ? null : task.id);
                      setComment('');
                    }
                  }}
                >
                  💬 Comment
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
