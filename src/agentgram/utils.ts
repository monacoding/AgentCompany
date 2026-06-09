import { Agent } from '../types';

const EMOJI_POOL = ['📝', '💼', '🎯', '✨', '📊', '🏢', '💡', '🚀', '☕', '🌿', '📌', '🎬'];

export function buildAgentGramHandle(agent: Pick<Agent, 'name' | 'title' | 'role'>): string {
  const title = agent.title?.trim() || agent.role;
  const slug = title
    .replace(/\s+/g, '')
    .replace(/[^a-zA-Z0-9가-힣]/g, '')
    .toLowerCase();
  const namePart = agent.name.trim().replace(/\s+/g, '');
  if (!slug) return namePart;
  return `${namePart}.${slug}`;
}

export function avatarHueFromId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) % 360;
  }
  return hash;
}

export function todayDateKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return '방금';
  if (minutes < 60) return `${minutes}분`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간`;
  const days = Math.floor(hours / 24);
  if (days < 7) return days === 1 ? '어제' : `${days}일`;
  return new Date(iso).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

export function pickEmoji(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash + seed.charCodeAt(i)) % EMOJI_POOL.length;
  }
  return EMOJI_POOL[hash] ?? '📝';
}

export function parseJsonBlock<T>(text: string, fallback: T): T {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return fallback;
  try {
    return JSON.parse(match[0]) as T;
  } catch {
    return fallback;
  }
}
