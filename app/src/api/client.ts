import type { CreateWishInput, MeResponse, OgPreview, Wish } from '@afford/shared';
import { tg } from '../telegram';

const initData = (): string => tg?.initData ?? '';

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-init-data': initData(),
    ...(init.headers as Record<string, string> | undefined)
  };
  const r = await fetch(path, { ...init, headers });
  if (!r.ok) {
    const text = await r.text().catch(() => '');
    throw new ApiError(r.status, text || r.statusText);
  }
  return r.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export const api = {
  me(): Promise<MeResponse> {
    return request<MeResponse>('/api/me', {
      method: 'POST',
      body: JSON.stringify({ initData: initData() })
    });
  },
  listWishes(): Promise<{ wishes: Wish[] }> {
    return request<{ wishes: Wish[] }>('/api/wishes');
  },
  createWish(input: CreateWishInput): Promise<{ wish: Wish }> {
    return request<{ wish: Wish }>('/api/wishes', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  },
  ogPreview(url: string): Promise<OgPreview> {
    return request<OgPreview>(`/api/og?url=${encodeURIComponent(url)}`);
  }
};
