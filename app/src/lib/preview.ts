import type {
  CheckIn,
  Feeling,
  LifeDomain,
  MeResponse,
  MicroPermissionTemplate,
  Step,
  StepCategory,
  User,
  UserFreedom,
  UserSettings,
  Wish
} from '@afford/shared';

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

export let mockMe: MeResponse = { user: mockUser, unlocked: false };

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

// Helper: mirrors server's listActiveWishes filter (active + unlocked only).
const visibleWishes = () =>
  mockWishes.filter((w) => w.status === 'active' || w.status === 'unlocked');

const mockSteps: Step[] = [];
let stepId = 1;

const mockTemplates: MicroPermissionTemplate[] = [
  { id: 'mt-coffee', title: 'Возьми сегодня кофе навынос', suggestedPoints: 15, domain: 'joy', category: 'permission', isPremium: false },
  { id: 'mt-taxi', title: 'Поезжай на такси, не жди автобус', suggestedPoints: 20, domain: 'comfort', category: 'permission', isPremium: false },
  { id: 'mt-meal', title: 'Закажи то блюдо, что реально хочешь', suggestedPoints: 15, domain: 'food', category: 'permission', isPremium: false },
  { id: 'mt-socks', title: 'Купи носки, которые давно откладывал(а)', suggestedPoints: 10, domain: 'clothes', category: 'permission', isPremium: false },
  { id: 'mt-fun', title: 'Запишись на то, что приносит удовольствие', suggestedPoints: 25, domain: 'leisure', category: 'permission', isPremium: false },
  { id: 'ef-clean', title: 'Убраться в комнате', suggestedPoints: 25, domain: 'other', category: 'effort', isPremium: false },
  { id: 'ef-emails', title: 'Разобрать накопившуюся почту', suggestedPoints: 20, domain: 'other', category: 'effort', isPremium: false },
  { id: 'ef-bank', title: 'Закрыть надоевшую задачу с банком', suggestedPoints: 25, domain: 'other', category: 'effort', isPremium: false },
  { id: 'ef-move', title: 'Сделать 20 приседаний / тренировку', suggestedPoints: 15, domain: 'health', category: 'effort', isPremium: false },
  { id: 'ef-cook', title: 'Приготовить нормальный обед', suggestedPoints: 20, domain: 'food', category: 'effort', isPremium: false }
];

function maybeUnlockMockWish(w: Wish) {
  if (w.status === 'active' && w.pointsEarned >= w.pointsRequired) {
    w.status = 'unlocked';
    w.unlockedAt = new Date().toISOString();
  }
}

export const previewApi = {
  me: async () => mockMe,
  // Mirror the server filter so purchased wishes don't linger on Home.
  listWishes: async () => ({ wishes: visibleWishes() }),
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
  createStep: async (
    wishId: string,
    title: string,
    points: number,
    category: StepCategory = 'permission'
  ) => {
    const step: Step = {
      id: `step-${stepId++}`,
      userId: 0,
      wishId,
      title,
      kind: 'step',
      category,
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
      category: tpl.category,
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
  },
  markBought: async (wishId: string) => {
    const wish = mockWishes.find((w) => w.id === wishId);
    if (!wish) throw new Error('not found');
    if (wish.purchasedAt) return { wish, belowThreshold: false, justPurchased: false };
    const belowThreshold = wish.pointsEarned < wish.pointsRequired;
    wish.status = 'purchased';
    wish.purchasedAt = new Date().toISOString();
    return { wish, belowThreshold, justPurchased: true };
  },
  share: async (wishId: string) => {
    // In ?preview=1 mode we don't actually have a server to render the card;
    // open a placeholder so the share button does *something* visible.
    const url = `${window.location.origin}/share/preview-${wishId}.png`;
    return { imageUrl: url, shareUrl: url };
  },
  checkIn: async (wishId: string, feeling: Feeling, note: string) => {
    const ci: CheckIn = {
      id: `ci-${Date.now()}`,
      wishId,
      feeling,
      note: note.trim() || null,
      createdAt: new Date().toISOString()
    };
    return { checkIn: ci };
  },
  updateSettings: async (patch: Partial<UserSettings>): Promise<MeResponse> => {
    mockUser.settings = { ...mockUser.settings, ...patch };
    mockMe = { user: mockUser, unlocked: mockMe.unlocked };
    return mockMe;
  },
  freedom: async (): Promise<UserFreedom> => {
    const purchased = mockWishes.filter((w) => w.purchasedAt);
    const ALL_DOMAINS: LifeDomain[] = ['clothes', 'leisure', 'comfort', 'health', 'joy', 'food', 'other'];
    const byDomain = Object.fromEntries(
      ALL_DOMAINS.map((d) => [d, { count: 0, value: 0, firstAt: null as string | null }])
    ) as UserFreedom['byDomain'];
    let freedomScore = 0;
    let selfPermissions = 0;
    for (const w of purchased) {
      const d = w.domain;
      const value = w.price ?? 0;
      const below = w.pointsEarned < w.pointsRequired;
      byDomain[d].count++;
      byDomain[d].value += value;
      if (!byDomain[d].firstAt) byDomain[d].firstAt = w.purchasedAt;
      freedomScore += value;
      if (below) selfPermissions++;
    }
    const total = purchased.length;
    return {
      totalPermissions: total,
      freedomScore,
      selfPermissions,
      selfPermissionRatio: total > 0 ? selfPermissions / total : 0,
      byDomain
    };
  }
};
