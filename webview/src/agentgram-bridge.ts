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

const vscode = typeof acquireVsCodeApi !== 'undefined' ? acquireVsCodeApi() : null;

export function postGramMessage(type: string, payload?: unknown): void {
  vscode?.postMessage({ type, payload });
}

export function useAgentGramSnapshot(): {
  snapshot: AgentGramSnapshot | null;
  refresh: () => void;
  createOwnerPost: (caption: string, emoji: string) => void;
  toggleOwnerLike: (postId: string) => void;
  respondFollowRequest: (requestId: string, accept: boolean) => void;
} {
  const [snapshot, setSnapshot] = useState<AgentGramSnapshot | null>(null);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const msg = event.data;
      if (msg?.type === 'agentGramData') {
        setSnapshot(msg.payload as AgentGramSnapshot);
      }
    };
    window.addEventListener('message', handler);
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

  return { snapshot, refresh, createOwnerPost, toggleOwnerLike, respondFollowRequest };
}
