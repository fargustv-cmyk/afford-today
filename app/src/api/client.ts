import type {
  CheckIn,
  CreateWishInput,
  Feeling,
  FreedomPro,
  LifeDomain,
  MeResponse,
  MicroPermissionPack,
  MicroPermissionTemplate,
  OgPreview,
  Step,
  StepCategory,
  UserFreedom,
  UserSettings,
  UserStepTemplate,
  Wish,
  Wishlist
} from '@afford/shared';
import { tg } from '../telegram';

const initData = (): string => tg?.initData ?? '';

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  // Only declare a JSON body when there actually is one. Sending
  // Content-Type: application/json with an empty body makes Fastify reject
  // with 400 «Body cannot be empty…», which silently broke markStepDone /
  // markBought / share / etc.
  const headers: Record<string, string> = {
    'x-init-data': initData(),
    ...(init.headers as Record<string, string> | undefined)
  };
  if (init.body != null) headers['Content-Type'] = 'application/json';
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
  listWishes(wishlistId?: string): Promise<{ wishes: Wish[] }> {
    const q = wishlistId ? `?wishlist=${encodeURIComponent(wishlistId)}` : '';
    return request<{ wishes: Wish[] }>(`/api/wishes${q}`);
  },
  listWishlists(): Promise<{ wishlists: Wishlist[] }> {
    return request<{ wishlists: Wishlist[] }>('/api/wishlists');
  },
  createWishlist(title: string): Promise<{ wishlist: Wishlist }> {
    return request<{ wishlist: Wishlist }>('/api/wishlists', {
      method: 'POST',
      body: JSON.stringify({ title })
    });
  },
  renameWishlist(id: string, title: string): Promise<{ wishlist: Wishlist }> {
    return request<{ wishlist: Wishlist }>(`/api/wishlists/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ title })
    });
  },
  deleteWishlist(id: string): Promise<{ ok: true }> {
    return request<{ ok: true }>(`/api/wishlists/${id}`, { method: 'DELETE' });
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
  listUserTemplates(): Promise<{ templates: UserStepTemplate[] }> {
    return request<{ templates: UserStepTemplate[] }>('/api/user-templates');
  },
  createUserTemplate(input: {
    title: string;
    points: number;
    domain: LifeDomain;
    category: StepCategory;
  }): Promise<{ template: UserStepTemplate }> {
    return request<{ template: UserStepTemplate }>('/api/user-templates', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  },
  deleteUserTemplate(id: string): Promise<{ ok: true }> {
    return request<{ ok: true }>(`/api/user-templates/${id}`, { method: 'DELETE' });
  },
  microTemplates(pack?: string): Promise<{ templates: MicroPermissionTemplate[] }> {
    const q = pack ? `?pack=${encodeURIComponent(pack)}` : '';
    return request<{ templates: MicroPermissionTemplate[] }>(`/api/micro-permissions${q}`);
  },
  listPacks(): Promise<{ packs: MicroPermissionPack[] }> {
    return request<{ packs: MicroPermissionPack[] }>('/api/micro-permissions/packs');
  },
  markBought(wishId: string): Promise<{ wish: Wish; belowThreshold: boolean; justPurchased: boolean }> {
    return request<{ wish: Wish; belowThreshold: boolean; justPurchased: boolean }>(
      `/api/wishes/${wishId}/mark-bought`,
      { method: 'POST' }
    );
  },
  completeWish(wishId: string): Promise<{ wish: Wish; belowThreshold: boolean; justCompleted: boolean }> {
    return request<{ wish: Wish; belowThreshold: boolean; justCompleted: boolean }>(
      `/api/wishes/${wishId}/complete`,
      { method: 'POST' }
    );
  },
  allowWish(wishId: string): Promise<{ wish: Wish; justAllowed: boolean }> {
    return request<{ wish: Wish; justAllowed: boolean }>(`/api/wishes/${wishId}/allow`, {
      method: 'POST'
    });
  },
  postponeWish(wishId: string): Promise<{ wish: Wish; justPostponed: boolean }> {
    return request<{ wish: Wish; justPostponed: boolean }>(`/api/wishes/${wishId}/postpone`, {
      method: 'POST'
    });
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
  freedomPro(): Promise<FreedomPro> {
    return request<FreedomPro>('/api/freedom/pro');
  },
  updateSettings(patch: Partial<UserSettings>): Promise<MeResponse> {
    return request<MeResponse>('/api/me/settings', {
      method: 'PATCH',
      body: JSON.stringify(patch)
    });
  },
  proInvoice(): Promise<{ url: string; alreadyPro?: boolean }> {
    return request<{ url: string; alreadyPro?: boolean }>('/api/pro/invoice', {
      method: 'POST'
    });
  }
};
