import type {
  CreateWishInput,
  MeResponse,
  MicroPermissionTemplate,
  OgPreview,
  Step,
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
  createStep(wishId: string, title: string, points: number): Promise<{ step: Step }> {
    return request<{ step: Step }>(`/api/wishes/${wishId}/steps`, {
      method: 'POST',
      body: JSON.stringify({ title, points })
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
  doMicroPermission(wishId: string, templateId: string): Promise<{ step: Step; wish: Wish | null }> {
    return request<{ step: Step; wish: Wish | null }>(
      `/api/wishes/${wishId}/micro-permissions/${templateId}/done`,
      { method: 'POST' }
    );
  },
  markBought(wishId: string): Promise<{ wish: Wish; belowThreshold: boolean; justPurchased: boolean }> {
    return request<{ wish: Wish; belowThreshold: boolean; justPurchased: boolean }>(
      `/api/wishes/${wishId}/mark-bought`,
      { method: 'POST' }
    );
  }
};
