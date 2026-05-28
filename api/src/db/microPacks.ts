// Pro-only curated step packs. Free users see the metadata (locked); Pro users
// can attach them to a wish, just like the default 110-item library. Tone is
// situational, not clinical — the pack is a friend who knows where you are.

import type { MicroPermissionPack, MicroPermissionTemplate } from '@afford/shared';

export const PRO_PACKS: { meta: MicroPermissionPack; items: MicroPermissionTemplate[] }[] = [
  {
    meta: {
      id: 'burnout',
      title: 'после выгорания',
      description: 'микро-шаги для тех, кто пережал. ничего не должно быть «правильно».',
      isPremium: true,
      count: 0
    },
    items: [
      { id: 'bo-no-replies',    title: 'Не отвечай в чатах до обеда',                 suggestedPoints: 20, domain: 'comfort', category: 'permission', isPremium: true, pack: 'burnout' },
      { id: 'bo-window-15',     title: 'Посиди у окна 15 минут — без задач',           suggestedPoints: 15, domain: 'comfort', category: 'permission', isPremium: true, pack: 'burnout' },
      { id: 'bo-easy-meal',     title: 'Поешь то, что не надо готовить',              suggestedPoints: 10, domain: 'food',    category: 'permission', isPremium: true, pack: 'burnout' },
      { id: 'bo-tv-good',       title: 'Включи то «не очень полезное», от чего тепло',suggestedPoints: 10, domain: 'leisure', category: 'permission', isPremium: true, pack: 'burnout' },
      { id: 'bo-cancel',        title: 'Отмени одну встречу, которая «надо»',          suggestedPoints: 25, domain: 'other',   category: 'permission', isPremium: true, pack: 'burnout' },
      { id: 'bo-cry',           title: 'Поплачь, если надо — без объяснений',         suggestedPoints: 15, domain: 'health',  category: 'permission', isPremium: true, pack: 'burnout' },
      { id: 'bo-no-bed',        title: 'Полежи днём, не оправдывайся',                suggestedPoints: 15, domain: 'health',  category: 'permission', isPremium: true, pack: 'burnout' },
      { id: 'bo-warm-shower',   title: 'Прими тёплый душ дольше обычного',            suggestedPoints: 10, domain: 'comfort', category: 'permission', isPremium: true, pack: 'burnout' },
      { id: 'bo-soft-light',    title: 'Зажги мягкий свет вместо верхнего',           suggestedPoints: 10, domain: 'comfort', category: 'permission', isPremium: true, pack: 'burnout' },
      { id: 'bo-no-work-7pm',   title: 'После 19:00 никаких рабочих экранов',          suggestedPoints: 20, domain: 'other',   category: 'permission', isPremium: true, pack: 'burnout' },
      { id: 'bo-water',         title: 'Просто выпей стакан воды',                    suggestedPoints: 10, domain: 'health',  category: 'effort',     isPremium: true, pack: 'burnout' },
      { id: 'bo-make-bed',      title: 'Заправь только постель — больше ничего',      suggestedPoints: 10, domain: 'comfort', category: 'effort',     isPremium: true, pack: 'burnout' },
      { id: 'bo-air',           title: 'Выйди на 10 минут на воздух',                 suggestedPoints: 15, domain: 'health',  category: 'effort',     isPremium: true, pack: 'burnout' },
      { id: 'bo-clean-cup',     title: 'Помой ту самую кружку, что стоит',            suggestedPoints: 10, domain: 'comfort', category: 'effort',     isPremium: true, pack: 'burnout' },
      { id: 'bo-say-tired',     title: 'Скажи близкому: «я устал(а)» — вслух',         suggestedPoints: 20, domain: 'other',   category: 'effort',     isPremium: true, pack: 'burnout' }
    ]
  },
  {
    meta: {
      id: 'first-salary',
      title: 'первая зарплата',
      description: 'не «отложить всё» и не «спустить на ерунду». разреши себе одно настоящее.',
      isPremium: true,
      count: 0
    },
    items: [
      { id: 'fs-self-gift',     title: 'Купи себе одну вещь, которую давно хотел(а)',  suggestedPoints: 30, domain: 'joy',     category: 'permission', isPremium: true, pack: 'first-salary' },
      { id: 'fs-restaurant',    title: 'Сходи в ресторан — не «по поводу»',            suggestedPoints: 30, domain: 'food',    category: 'permission', isPremium: true, pack: 'first-salary' },
      { id: 'fs-taxi',          title: 'Поезжай на такси, когда устал(а)',             suggestedPoints: 15, domain: 'comfort', category: 'permission', isPremium: true, pack: 'first-salary' },
      { id: 'fs-haircut',       title: 'Сходи в нормальный салон, не в «эконом»',      suggestedPoints: 25, domain: 'health',  category: 'permission', isPremium: true, pack: 'first-salary' },
      { id: 'fs-glasses',       title: 'Купи нормальные очки/линзы, что давно надо',   suggestedPoints: 30, domain: 'health',  category: 'permission', isPremium: true, pack: 'first-salary' },
      { id: 'fs-replace-old',   title: 'Замени поношенное — обувь/одежду/что-то',      suggestedPoints: 25, domain: 'clothes', category: 'permission', isPremium: true, pack: 'first-salary' },
      { id: 'fs-airpods',       title: 'Купи беспроводные наушники, если не было',     suggestedPoints: 30, domain: 'comfort', category: 'permission', isPremium: true, pack: 'first-salary' },
      { id: 'fs-event-tix',     title: 'Возьми билет на концерт/спектакль',           suggestedPoints: 30, domain: 'leisure', category: 'permission', isPremium: true, pack: 'first-salary' },
      { id: 'fs-good-coffee',   title: 'Купи хорошую кофемолку или зерно',             suggestedPoints: 20, domain: 'joy',     category: 'permission', isPremium: true, pack: 'first-salary' },
      { id: 'fs-bedding',       title: 'Купи постельное, в котором приятно спать',     suggestedPoints: 25, domain: 'comfort', category: 'permission', isPremium: true, pack: 'first-salary' },
      { id: 'fs-checkup',       title: 'Сделай плановый медосмотр',                    suggestedPoints: 30, domain: 'health',  category: 'effort',     isPremium: true, pack: 'first-salary' },
      { id: 'fs-investing',     title: 'Открой брокерский/накопительный, положи 5%',   suggestedPoints: 25, domain: 'other',   category: 'effort',     isPremium: true, pack: 'first-salary' },
      { id: 'fs-thanks',        title: 'Скажи спасибо тем, кто помог — лично',         suggestedPoints: 20, domain: 'other',   category: 'effort',     isPremium: true, pack: 'first-salary' },
      { id: 'fs-tax',           title: 'Разберись с налоговой / самозанятостью',       suggestedPoints: 25, domain: 'other',   category: 'effort',     isPremium: true, pack: 'first-salary' },
      { id: 'fs-emergency',     title: 'Отложи мини-подушку — хотя бы 10%',            suggestedPoints: 25, domain: 'other',   category: 'effort',     isPremium: true, pack: 'first-salary' }
    ]
  },
  {
    meta: {
      id: 'evening-ritual',
      title: 'вечерний ритуал',
      description: 'для тех, кто к вечеру разрешает только листать ленту. соберём вечер заново.',
      isPremium: true,
      count: 0
    },
    items: [
      { id: 'er-tea',           title: 'Завари чай в красивой кружке',                suggestedPoints: 10, domain: 'joy',     category: 'permission', isPremium: true, pack: 'evening-ritual' },
      { id: 'er-candle',        title: 'Зажги свечу за 30 минут до сна',              suggestedPoints: 10, domain: 'comfort', category: 'permission', isPremium: true, pack: 'evening-ritual' },
      { id: 'er-bath',          title: 'Полежи в ванне 20 минут',                     suggestedPoints: 20, domain: 'comfort', category: 'permission', isPremium: true, pack: 'evening-ritual' },
      { id: 'er-music',         title: 'Поставь медленную музыку, не подкаст',        suggestedPoints: 10, domain: 'joy',     category: 'permission', isPremium: true, pack: 'evening-ritual' },
      { id: 'er-no-news',       title: 'Не открывай новости после 21:00',             suggestedPoints: 15, domain: 'comfort', category: 'permission', isPremium: true, pack: 'evening-ritual' },
      { id: 'er-paper-book',    title: 'Почитай бумажную книгу 15 минут',             suggestedPoints: 15, domain: 'leisure', category: 'permission', isPremium: true, pack: 'evening-ritual' },
      { id: 'er-stretch',       title: 'Сделай 5 минут растяжки на полу',              suggestedPoints: 10, domain: 'health',  category: 'effort',     isPremium: true, pack: 'evening-ritual' },
      { id: 'er-skincare',      title: 'Сделай нормальный уход за кожей',             suggestedPoints: 15, domain: 'health',  category: 'effort',     isPremium: true, pack: 'evening-ritual' },
      { id: 'er-tidy-5',        title: 'Прибери 5 минут в одной зоне',                suggestedPoints: 10, domain: 'comfort', category: 'effort',     isPremium: true, pack: 'evening-ritual' },
      { id: 'er-prep-morning',  title: 'Достань с утра одежду, не утром',              suggestedPoints: 10, domain: 'clothes', category: 'effort',     isPremium: true, pack: 'evening-ritual' },
      { id: 'er-screen-off',    title: 'Убери телефон за час до сна',                  suggestedPoints: 25, domain: 'health',  category: 'effort',     isPremium: true, pack: 'evening-ritual' },
      { id: 'er-write-3',       title: 'Напиши 3 строчки в дневник',                  suggestedPoints: 15, domain: 'leisure', category: 'effort',     isPremium: true, pack: 'evening-ritual' },
      { id: 'er-warm-feet',     title: 'Согрей ноги (носки, ванночка)',                suggestedPoints: 10, domain: 'comfort', category: 'permission', isPremium: true, pack: 'evening-ritual' },
      { id: 'er-no-dishes',     title: 'Оставь посуду до утра — это можно',           suggestedPoints: 15, domain: 'other',   category: 'permission', isPremium: true, pack: 'evening-ritual' },
      { id: 'er-pillow-fluff',  title: 'Взбей подушку, поправь одеяло — это важно',    suggestedPoints: 10, domain: 'comfort', category: 'effort',     isPremium: true, pack: 'evening-ritual' }
    ]
  },
  {
    meta: {
      id: 'post-breakup',
      title: 'после расставания',
      description: 'без терапевтических лозунгов. маленькие шаги, которые держат, пока шатает.',
      isPremium: true,
      count: 0
    },
    items: [
      { id: 'pb-cry',           title: 'Поплачь столько, сколько надо',                suggestedPoints: 15, domain: 'health',  category: 'permission', isPremium: true, pack: 'post-breakup' },
      { id: 'pb-walk',          title: 'Иди пешком час, без музыки',                  suggestedPoints: 20, domain: 'health',  category: 'permission', isPremium: true, pack: 'post-breakup' },
      { id: 'pb-no-replies',    title: 'Не пиши ему/ей. Сегодня — нет.',              suggestedPoints: 30, domain: 'other',   category: 'permission', isPremium: true, pack: 'post-breakup' },
      { id: 'pb-feed-yourself', title: 'Поешь нормально — хотя бы один раз',          suggestedPoints: 15, domain: 'food',    category: 'permission', isPremium: true, pack: 'post-breakup' },
      { id: 'pb-call-friend',   title: 'Позвони другу, не пиши — голосом',             suggestedPoints: 25, domain: 'other',   category: 'effort',     isPremium: true, pack: 'post-breakup' },
      { id: 'pb-new-pillow',    title: 'Поменяй подушку/постельное — стало твоим',     suggestedPoints: 20, domain: 'comfort', category: 'effort',     isPremium: true, pack: 'post-breakup' },
      { id: 'pb-photos-away',   title: 'Спрячь фотки в отдельную папку',              suggestedPoints: 25, domain: 'other',   category: 'effort',     isPremium: true, pack: 'post-breakup' },
      { id: 'pb-things-back',   title: 'Верни/выкини то, что не твоё',                 suggestedPoints: 25, domain: 'other',   category: 'effort',     isPremium: true, pack: 'post-breakup' },
      { id: 'pb-haircut',       title: 'Сходи в парикмахерскую — что-то поменяй',      suggestedPoints: 25, domain: 'health',  category: 'permission', isPremium: true, pack: 'post-breakup' },
      { id: 'pb-self-flowers',  title: 'Купи цветы себе',                              suggestedPoints: 15, domain: 'joy',     category: 'permission', isPremium: true, pack: 'post-breakup' },
      { id: 'pb-tea-night',     title: 'Заварю чай, посижу с собой',                  suggestedPoints: 10, domain: 'comfort', category: 'permission', isPremium: true, pack: 'post-breakup' },
      { id: 'pb-movie',         title: 'Посмотри тот фильм, что ОН/ОНА не любил(а)',   suggestedPoints: 20, domain: 'leisure', category: 'permission', isPremium: true, pack: 'post-breakup' },
      { id: 'pb-sing',          title: 'Включи песню громко, подпевай',               suggestedPoints: 10, domain: 'joy',     category: 'permission', isPremium: true, pack: 'post-breakup' },
      { id: 'pb-new-place',     title: 'Сходи туда, где не были вдвоём',              suggestedPoints: 25, domain: 'leisure', category: 'permission', isPremium: true, pack: 'post-breakup' },
      { id: 'pb-write-it',      title: 'Напиши то, что не сказал(а), не отправляй',    suggestedPoints: 25, domain: 'other',   category: 'effort',     isPremium: true, pack: 'post-breakup' }
    ]
  }
];

// Fill in counts so the client doesn't have to compute it.
for (const p of PRO_PACKS) p.meta.count = p.items.length;

export const PRO_PACK_TEMPLATES: MicroPermissionTemplate[] = PRO_PACKS.flatMap((p) => p.items);
