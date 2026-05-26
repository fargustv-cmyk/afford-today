import type { MeResponse, User, Wish } from '@afford/shared';

export const isPreview = (): boolean =>
  new URLSearchParams(window.location.search).get('preview') === '1';

export const mockUser: User = {
  id: 0,
  createdAt: new Date().toISOString(),
  currency: 'RUB',
  locale: 'ru',
  subscriptionStatus: 'free',
  subscriptionUntil: null,
  giftedTokens: 0,
  selfPermissionFactor: 1,
  settings: {},
  firstName: 'preview'
};

export const mockMe: MeResponse = { user: mockUser, unlocked: false };

let mockId = 1;
const mockWishes: Wish[] = [
  {
    id: 'mock-1',
    userId: 0,
    title: 'Беспроводные наушники',
    imageUrl: null,
    sourceUrl: null,
    price: 14990,
    currency: 'RUB',
    type: 'want',
    domain: 'comfort',
    pointsRequired: 300,
    pointsEarned: 75,
    status: 'active',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    unlockedAt: null,
    purchasedAt: null
  }
];

export const previewApi = {
  me: async () => mockMe,
  listWishes: async () => ({ wishes: [...mockWishes] }),
  createWish: async (input: import('@afford/shared').CreateWishInput) => {
    const now = new Date().toISOString();
    const threshold =
      input.type === 'essential'
        ? 0
        : input.type === 'need'
          ? 20
          : !input.price
            ? 100
            : input.price < 3000
              ? 100
              : input.price < 30000
                ? 300
                : 800;
    const wish: Wish = {
      id: `mock-${mockId++}`,
      userId: 0,
      title: input.title,
      imageUrl: input.imageUrl ?? null,
      sourceUrl: input.sourceUrl ?? null,
      price: input.price ?? null,
      currency: input.currency ?? 'RUB',
      type: input.type,
      domain: input.domain,
      pointsRequired: threshold,
      pointsEarned: 0,
      status: threshold === 0 ? 'unlocked' : 'active',
      createdAt: now,
      unlockedAt: threshold === 0 ? now : null,
      purchasedAt: null
    };
    mockWishes.unshift(wish);
    return { wish };
  },
  ogPreview: async (_url: string) => ({ title: null, imageUrl: null, price: null })
};
