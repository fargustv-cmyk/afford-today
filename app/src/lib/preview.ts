import type { MeResponse, MicroPermissionTemplate, Step, User, Wish } from '@afford/shared';

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

const mockSteps: Step[] = [];
let stepId = 1;

const mockTemplates: MicroPermissionTemplate[] = [
  { id: 'mt-coffee', title: 'Возьми сегодня кофе навынос', suggestedPoints: 15, domain: 'joy', isPremium: false },
  { id: 'mt-taxi', title: 'Поезжай на такси, не жди автобус', suggestedPoints: 20, domain: 'comfort', isPremium: false },
  { id: 'mt-meal', title: 'Закажи то блюдо, что реально хочешь', suggestedPoints: 15, domain: 'food', isPremium: false },
  { id: 'mt-socks', title: 'Купи носки, которые давно откладывал(а)', suggestedPoints: 10, domain: 'clothes', isPremium: false },
  { id: 'mt-fun', title: 'Запишись на то, что приносит удовольствие', suggestedPoints: 25, domain: 'leisure', isPremium: false }
];

function maybeUnlockMockWish(w: Wish) {
  if (w.status === 'active' && w.pointsEarned >= w.pointsRequired) {
    w.status = 'unlocked';
    w.unlockedAt = new Date().toISOString();
  }
}

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
  ogPreview: async (_url: string) => ({ title: null, imageUrl: null, price: null }),

  listSteps: async (wishId: string) => ({
    steps: mockSteps.filter((s) => s.wishId === wishId)
  }),
  createStep: async (wishId: string, title: string, points: number) => {
    const step: Step = {
      id: `step-${stepId++}`,
      userId: 0,
      wishId,
      title,
      kind: 'step',
      points,
      done: false,
      doneAt: null,
      createdAt: new Date().toISOString()
    };
    mockSteps.push(step);
    return { step };
  },
  markStepDone: async (sid: string) => {
    const s = mockSteps.find((x) => x.id === sid);
    if (!s || s.done) return { step: s!, wish: null };
    s.done = true;
    s.doneAt = new Date().toISOString();
    const wish = mockWishes.find((w) => w.id === s.wishId) ?? null;
    if (wish) {
      wish.pointsEarned += s.points;
      maybeUnlockMockWish(wish);
    }
    return { step: s, wish };
  },
  microTemplates: async () => ({ templates: mockTemplates }),
  doMicroPermission: async (wishId: string, templateId: string) => {
    const tpl = mockTemplates.find((t) => t.id === templateId);
    if (!tpl) throw new Error('not found');
    const now = new Date().toISOString();
    const step: Step = {
      id: `step-${stepId++}`,
      userId: 0,
      wishId,
      title: tpl.title,
      kind: 'micro_permission',
      points: tpl.suggestedPoints,
      done: true,
      doneAt: now,
      createdAt: now
    };
    mockSteps.push(step);
    const wish = mockWishes.find((w) => w.id === wishId) ?? null;
    if (wish) {
      wish.pointsEarned += tpl.suggestedPoints;
      maybeUnlockMockWish(wish);
    }
    return { step, wish };
  }
};
