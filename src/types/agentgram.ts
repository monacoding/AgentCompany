export type AgentGramFollowStatus = 'pending' | 'accepted' | 'rejected';

export interface AgentGramPost {
  id: string;
  authorId: string;
  caption: string;
  imageEmoji: string;
  location: string;
  createdAt: string;
}

export interface AgentGramComment {
  id: string;
  postId: string;
  authorId: string;
  text: string;
  createdAt: string;
}

export interface AgentGramFollowRequest {
  id: string;
  fromId: string;
  toId: string;
  status: AgentGramFollowStatus;
  createdAt: string;
  resolvedAt?: string;
}

export interface AgentGramAccount {
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

export interface AgentGramCommentView {
  id: string;
  authorId: string;
  authorHandle: string;
  text: string;
  timeAgo: string;
}

export interface AgentGramPostView {
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
  comments: AgentGramCommentView[];
}

export interface AgentGramFollowRequestView {
  id: string;
  fromId: string;
  fromHandle: string;
  fromName: string;
  createdAt: string;
  timeAgo: string;
}

export interface AgentGramSnapshot {
  owner: AgentGramAccount;
  accounts: AgentGramAccount[];
  posts: AgentGramPostView[];
  pendingFollowRequests: AgentGramFollowRequestView[];
  ownerPostCount: number;
}
