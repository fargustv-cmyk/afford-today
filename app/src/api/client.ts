import type {
  CheckIn,
  CreateWishInput,
  Feeling,
  MeResponse,
  MicroPermissionTemplate,
  OgPreview,
  Step,
  StepCategory,
  UserFreedom,
  UserSettings,
  Wish
} from '@afford/shared';
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
  },
  listSteps(wishId: string): Promise<{ steps: Step[] }> {
    return request<{ steps: Step[] }>(`/api/wishes/${wishId}/steps`);
  },
  createStep(
    wishId: string,
    title: string,
    points: number,
    category: StepCategory = 'permission'
  ): Promise<{ step: Step }> {
    return request<{ step: Step }>(`/api/wishes/${wishId}/steps`, {
      method: 'POST',
      body: JSON.stringify({ title, points, category })
    });
  },
  markStepDone(stepId: string): Promise<{ step: Step; wish: Wish | null }> {
    return request<{ step: Step; wish: Wish | null }>(`/api/steps/${stepId}/done`, {
      method: 'POST'
    });
  },
  microTemplates(): Promise<{ templates: MicroPermissionTemplate[] }> {
    return request<{ templates: MicroPermissionTemplate[] }>('/api/micro-permissions');
  },
  markBought(wishId: string): Promise<{ wish: Wish; belowThreshold: boolean; justPurchased: boolean }> {
    return request<{ wish: Wish; belowThreshold: boolean; justPurchased: boolean }>(
      `/api/wishes/${wishId}/mark-bought`,
      { method: 'POST' }
    );
  },
  share(wishId: string): Promise<{ imageUrl: string; shareUrl: string }> {
    return request<{ imageUrl: string; shareUrl: string }>(
      `/api/wishes/${wishId}/share`,
      { method: 'POST' }
    );
  },
  checkIn(wishId: string, feeling: Feeling, note: string): Promise<{ checkIn: CheckIn }> {
    return request<{ checkIn: CheckIn }>(`/api/wishes/${wishId}/check-in`, {
      method: 'POST',
      body: JSON.stringify({ feeling, note: note || undefined })
    });
  },
  freedom(): Promise<UserFreedom> {
    return request<UserFreedom>('/api/freedom');
  },
  updateSettings(patch: Partial<UserSettings>): Promise<MeResponse> {
    return request<MeResponse>('/api/me/settings', {
      method: 'PATCH',
      body: JSON.stringify(patch)
    });
  }
};
