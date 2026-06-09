import { useCallback, useEffect, useState } from 'react';

export interface GramAccount {
  id: string;
  handle: string;
  name: string;
  title: string;
  bio: string;
  avatarHue: number;
  posts: number;
  followers: number;
  following: number;
  hasStory?: boolean;
}

export interface GramComment {
  id: string;
  authorId: string;
  authorHandle: string;
  text: string;
  timeAgo: string;
}

export interface GramPost {
  id: string;
  authorId: string;
  authorHandle: string;
  timeAgo: string;
  location?: string;
  imageHue: number;
  imageEmoji: string;
  imageLabel: string;
  caption: string;
  likes: number;
  likedBy: string[];
  likedByOwner: boolean;
  comments: GramComment[];
}

export interface GramFollowRequest {
  id: string;
  fromId: string;
  fromHandle: string;
  fromName: string;
  timeAgo: string;
}

export interface AgentGramSnapshot {
  owner: GramAccount;
  accounts: GramAccount[];
  posts: GramPost[];
  pendingFollowRequests: GramFollowRequest[];
  ownerPostCount: number;
}

const vscodeApi = window.acquireVsCodeApi?.() ?? null;

export function postGramMessage(type: string, payload?: unknown): void {
  if (vscodeApi) {
    vscodeApi.postMessage({ type, payload });
  }
}

export function useAgentGramSnapshot(): {
  snapshot: AgentGramSnapshot | null;
  loadError: string | null;
  refresh: () => void;
  createOwnerPost: (caption: string, emoji: string) => void;
  toggleOwnerLike: (postId: string) => void;
  respondFollowRequest: (requestId: string, accept: boolean) => void;
} {
  const [snapshot, setSnapshot] = useState<AgentGramSnapshot | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const msg = event.data;
      if (msg?.type === 'agentGramData') {
        setLoadError(null);
        setSnapshot(msg.payload as AgentGramSnapshot);
      }
      if (msg?.type === 'agentGramError') {
        setLoadError(String(msg.payload ?? '데이터를 불러오지 못했습니다.'));
      }
    };
    window.addEventListener('message', handler);

    if (!vscodeApi) {
      setLoadError('VS Code API에 연결되지 않았습니다.');
      return () => window.removeEventListener('message', handler);
    }

    postGramMessage('ready');
    return () => window.removeEventListener('message', handler);
  }, []);

  const refresh = useCallback(() => postGramMessage('refreshAgentGram'), []);
  const createOwnerPost = useCallback((caption: string, emoji: string) => {
    postGramMessage('createOwnerPost', { caption, emoji });
  }, []);
  const toggleOwnerLike = useCallback((postId: string) => {
    postGramMessage('toggleOwnerLike', { postId });
  }, []);
  const respondFollowRequest = useCallback((requestId: string, accept: boolean) => {
    postGramMessage('respondFollowRequest', { requestId, accept });
  }, []);

  return { snapshot, loadError, refresh, createOwnerPost, toggleOwnerLike, respondFollowRequest };
}
