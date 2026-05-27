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
  // 🌿 permission — food
  { id: 'pm-meal-want',    title: 'Закажи то блюдо, что реально хочешь',         suggestedPoints: 15, domain: 'food',    category: 'permission', isPremium: false },
  { id: 'pm-delicacy',     title: 'Купи дорогое лакомство — себе одному',         suggestedPoints: 20, domain: 'food',    category: 'permission', isPremium: false },
  { id: 'pm-coffee',       title: 'Возьми кофе в любимом месте, не на бегу',     suggestedPoints: 15, domain: 'food',    category: 'permission', isPremium: false },
  { id: 'pm-delivery',     title: 'Закажи доставку вместо «потерплю»',           suggestedPoints: 15, domain: 'food',    category: 'permission', isPremium: false },
  { id: 'pm-restaurant',   title: 'Сходи в ресторан, что давно откладываешь',    suggestedPoints: 30, domain: 'food',    category: 'permission', isPremium: false },
  // permission — clothes
  { id: 'pm-cart',         title: 'Купи то, что давно лежит в корзине',          suggestedPoints: 25, domain: 'clothes', category: 'permission', isPremium: false },
  { id: 'pm-occasion',     title: 'Надень то, что бережёшь «на особый случай»',  suggestedPoints: 10, domain: 'clothes', category: 'permission', isPremium: false },
  { id: 'pm-underwear',    title: 'Купи бельё, в котором будешь себе нравиться', suggestedPoints: 20, domain: 'clothes', category: 'permission', isPremium: false },
  { id: 'pm-compliment',   title: 'Прими комплимент про одежду, не отнекивайся', suggestedPoints: 10, domain: 'clothes', category: 'permission', isPremium: false },
  // permission — comfort
  { id: 'pm-bath',         title: 'Полежи в горячей ванне',                      suggestedPoints: 20, domain: 'comfort', category: 'permission', isPremium: false },
  { id: 'pm-blanket',      title: 'Купи плед, в который хочется завернуться',    suggestedPoints: 25, domain: 'comfort', category: 'permission', isPremium: false },
  { id: 'pm-taxi',         title: 'Поезжай на такси, не жди автобус',            suggestedPoints: 20, domain: 'comfort', category: 'permission', isPremium: false },
  { id: 'pm-headphones',   title: 'Купи хорошие наушники с шумоподавлением',     suggestedPoints: 30, domain: 'comfort', category: 'permission', isPremium: false },
  { id: 'pm-candle',       title: 'Зажги ароматную свечу или благовоние',        suggestedPoints: 10, domain: 'comfort', category: 'permission', isPremium: false },
  { id: 'pm-offline',      title: 'Не отвечай в чатах два часа',                 suggestedPoints: 15, domain: 'comfort', category: 'permission', isPremium: false },
  // permission — health
  { id: 'pm-sleep',        title: 'Засни без будильника в выходной',             suggestedPoints: 15, domain: 'health',  category: 'permission', isPremium: false },
  { id: 'pm-beauty',       title: 'Запишись к косметологу/парикмахеру',          suggestedPoints: 25, domain: 'health',  category: 'permission', isPremium: false },
  { id: 'pm-spa',          title: 'Сходи на массаж или спа',                     suggestedPoints: 30, domain: 'health',  category: 'permission', isPremium: false },
  { id: 'pm-dayoff',       title: 'Возьми отгул, потому что устал(а)',           suggestedPoints: 30, domain: 'health',  category: 'permission', isPremium: false },
  { id: 'pm-vitamins',     title: 'Купи витамины, что давно нужны',              suggestedPoints: 15, domain: 'health',  category: 'permission', isPremium: false },
  { id: 'pm-doctor-postp', title: 'Запишись к врачу по тому, что откладываешь',  suggestedPoints: 25, domain: 'health',  category: 'permission', isPremium: false },
  // permission — joy
  { id: 'pm-flowers',      title: 'Купи букет цветов себе',                      suggestedPoints: 20, domain: 'joy',     category: 'permission', isPremium: false },
  { id: 'pm-music',        title: 'Послушай любимую музыку в наушниках',         suggestedPoints: 10, domain: 'joy',     category: 'permission', isPremium: false },
  { id: 'pm-gift-self',    title: 'Купи маленький приятный подарок себе',        suggestedPoints: 20, domain: 'joy',     category: 'permission', isPremium: false },
  { id: 'pm-song-loop',    title: 'Поставь ту песню, что цепляет, на повтор',    suggestedPoints: 10, domain: 'joy',     category: 'permission', isPremium: false },
  { id: 'pm-dessert',      title: 'Купи десерт без всякого повода',              suggestedPoints: 15, domain: 'joy',     category: 'permission', isPremium: false },
  { id: 'pm-mug',          title: 'Завари чай/какао в красивой кружке',          suggestedPoints: 10, domain: 'joy',     category: 'permission', isPremium: false },
  // permission — leisure
  { id: 'pm-movie',        title: 'Посмотри фильм, что давно хотел(а)',          suggestedPoints: 20, domain: 'leisure', category: 'permission', isPremium: false },
  { id: 'pm-class',        title: 'Запишись на то, что приносит удовольствие',   suggestedPoints: 25, domain: 'leisure', category: 'permission', isPremium: false },
  { id: 'pm-cafe-book',    title: 'Посиди в кафе с книгой, один(а)',             suggestedPoints: 20, domain: 'leisure', category: 'permission', isPremium: false },
  { id: 'pm-cinema-solo',  title: 'Сходи в кино один(а), на тот сеанс, что хочешь', suggestedPoints: 25, domain: 'leisure', category: 'permission', isPremium: false },
  { id: 'pm-event',        title: 'Сходи на выставку или концерт',               suggestedPoints: 30, domain: 'leisure', category: 'permission', isPremium: false },
  { id: 'pm-game-shelf',   title: 'Открой ту игру/книгу, что лежит «потом»',     suggestedPoints: 20, domain: 'leisure', category: 'permission', isPremium: false },
  // permission — boundaries
  { id: 'pm-no',           title: 'Скажи «нет» тому, что не хочется',            suggestedPoints: 20, domain: 'other',   category: 'permission', isPremium: false },
  { id: 'pm-no-help',      title: 'Не помогай тем, кто не просил',               suggestedPoints: 15, domain: 'other',   category: 'permission', isPremium: false },
  { id: 'pm-decline',      title: 'Откажись от приглашения, которое не зашло',   suggestedPoints: 20, domain: 'other',   category: 'permission', isPremium: false },
  { id: 'pm-rest15',       title: 'Полежи просто так 15 минут без вины',         suggestedPoints: 10, domain: 'other',   category: 'permission', isPremium: false },
  { id: 'pm-useless',      title: 'Запрети себе быть полезным один час',         suggestedPoints: 20, domain: 'other',   category: 'permission', isPremium: false },
  { id: 'pm-weekend-off',  title: 'Не работай в выходной, даже если можно',      suggestedPoints: 25, domain: 'other',   category: 'permission', isPremium: false },

  // 💪 effort — food
  { id: 'ef-meal',         title: 'Приготовь себе нормальный обед',              suggestedPoints: 20, domain: 'food',    category: 'effort', isPremium: false },
  { id: 'ef-bfast',        title: 'Сядь и позавтракай, не на ходу',              suggestedPoints: 15, domain: 'food',    category: 'effort', isPremium: false },
  { id: 'ef-groceries',    title: 'Купи нормальные продукты на неделю',          suggestedPoints: 25, domain: 'food',    category: 'effort', isPremium: false },
  { id: 'ef-batch',        title: 'Сделай заготовку на пару дней вперёд',        suggestedPoints: 25, domain: 'food',    category: 'effort', isPremium: false },
  { id: 'ef-no-coffee',    title: 'Замени утренний кофе на нормальный завтрак',  suggestedPoints: 15, domain: 'food',    category: 'effort', isPremium: false },
  // effort — clothes
  { id: 'ef-closet',       title: 'Разбери шкаф с одеждой',                      suggestedPoints: 30, domain: 'clothes', category: 'effort', isPremium: false },
  { id: 'ef-laundry',      title: 'Постирай отложенное бельё',                   suggestedPoints: 15, domain: 'clothes', category: 'effort', isPremium: false },
  { id: 'ef-repair',       title: 'Зашей или отнеси в ремонт сломавшееся',       suggestedPoints: 20, domain: 'clothes', category: 'effort', isPremium: false },
  { id: 'ef-iron',         title: 'Выгладь то, что висит мятым',                 suggestedPoints: 10, domain: 'clothes', category: 'effort', isPremium: false },
  // effort — comfort/home
  { id: 'ef-sweep',        title: 'Подмети или пропылесось пол',                 suggestedPoints: 15, domain: 'comfort', category: 'effort', isPremium: false },
  { id: 'ef-dishes',       title: 'Помой накопившуюся посуду',                   suggestedPoints: 10, domain: 'comfort', category: 'effort', isPremium: false },
  { id: 'ef-bed',          title: 'Поменяй постельное бельё',                    suggestedPoints: 15, domain: 'comfort', category: 'effort', isPremium: false },
  { id: 'ef-throw',        title: 'Выброси то, что давно не используешь',        suggestedPoints: 20, domain: 'comfort', category: 'effort', isPremium: false },
  { id: 'ef-desktop',      title: 'Очисти рабочий стол компьютера',              suggestedPoints: 15, domain: 'comfort', category: 'effort', isPremium: false },
  { id: 'ef-junk-drawer',  title: 'Разбери ящик «всё подряд»',                   suggestedPoints: 20, domain: 'comfort', category: 'effort', isPremium: false },
  { id: 'ef-window',       title: 'Помой окно/раму',                             suggestedPoints: 20, domain: 'comfort', category: 'effort', isPremium: false },
  { id: 'ef-shelf',        title: 'Расхламь полку с книгами/безделушками',       suggestedPoints: 15, domain: 'comfort', category: 'effort', isPremium: false },
  // effort — health
  { id: 'ef-move',         title: 'Сделай растяжку или тренировку',              suggestedPoints: 15, domain: 'health',  category: 'effort', isPremium: false },
  { id: 'ef-walk-8k',      title: 'Пройди 8000 шагов сегодня',                   suggestedPoints: 20, domain: 'health',  category: 'effort', isPremium: false },
  { id: 'ef-food-log',     title: 'Запиши, что съел(а) за день',                 suggestedPoints: 10, domain: 'health',  category: 'effort', isPremium: false },
  { id: 'ef-water',        title: 'Выпей 2 литра воды',                          suggestedPoints: 10, domain: 'health',  category: 'effort', isPremium: false },
  { id: 'ef-doctor',       title: 'Сходи к стоматологу/врачу, что откладывал(а)',suggestedPoints: 30, domain: 'health',  category: 'effort', isPremium: false },
  // effort — joy
  { id: 'ef-plant',        title: 'Полей цветы или посади что-нибудь',           suggestedPoints: 10, domain: 'joy',     category: 'effort', isPremium: false },
  { id: 'ef-handmade',     title: 'Сделай что-то руками: рисуй / лепи / шей',    suggestedPoints: 25, domain: 'joy',     category: 'effort', isPremium: false },
  { id: 'ef-tidy-desk',    title: 'Прибери стол так, чтобы радовало глаз',       suggestedPoints: 10, domain: 'joy',     category: 'effort', isPremium: false },
  // effort — leisure/mind
  { id: 'ef-book',         title: 'Прочитай книгу 30 минут',                     suggestedPoints: 20, domain: 'leisure', category: 'effort', isPremium: false },
  { id: 'ef-learn',        title: 'Посмотри полезную программу или лекцию',      suggestedPoints: 20, domain: 'leisure', category: 'effort', isPremium: false },
  { id: 'ef-course',       title: 'Пройди урок на курсе, что забросил(а)',       suggestedPoints: 25, domain: 'leisure', category: 'effort', isPremium: false },
  { id: 'ef-detox',        title: 'Проведи час без телефона',                    suggestedPoints: 25, domain: 'leisure', category: 'effort', isPremium: false },
  { id: 'ef-journal',      title: 'Напиши страницу дневника',                    suggestedPoints: 15, domain: 'leisure', category: 'effort', isPremium: false },
  // effort — admin / relationships
  { id: 'ef-emails',       title: 'Разбери накопившуюся почту/чаты',             suggestedPoints: 20, domain: 'other',   category: 'effort', isPremium: false },
  { id: 'ef-bank',         title: 'Закрой надоевшую задачу с банком/документами',suggestedPoints: 25, domain: 'other',   category: 'effort', isPremium: false },
  { id: 'ef-parents',      title: 'Позвони родителям',                           suggestedPoints: 25, domain: 'other',   category: 'effort', isPremium: false },
  { id: 'ef-friend',       title: 'Напиши другу, с которым давно не общался(лась)', suggestedPoints: 20, domain: 'other', category: 'effort', isPremium: false },
  { id: 'ef-subs',         title: 'Закрой подписки, которые не используешь',     suggestedPoints: 15, domain: 'other',   category: 'effort', isPremium: false },
  { id: 'ef-spending',     title: 'Подсчитай траты за неделю',                   suggestedPoints: 20, domain: 'other',   category: 'effort', isPremium: false },
  { id: 'ef-paperwork',    title: 'Заполни ту бумажку, что висит',               suggestedPoints: 20, domain: 'other',   category: 'effort', isPremium: false },
  { id: 'ef-report',       title: 'Напиши отчёт, что откладываешь',              suggestedPoints: 25, domain: 'other',   category: 'effort', isPremium: false }
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
