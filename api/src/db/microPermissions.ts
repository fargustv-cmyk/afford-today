import type { MicroPermissionTemplate } from '@afford/shared';

// Suggestion catalogue — real, commonly-skipped things people forget to do
// for themselves. Two flavours:
//
//   🌿 permission — "разреши себе" — pleasures and boundaries that you keep
//                   putting off ("not now", "later", "и так нормально").
//   💪 effort     — "сделай и заслужи" — chores and small adult things you
//                   avoid out of inertia, not malice.
//
// Behaviour: tapping a card adds it to the user's step list AS PENDING.
// Points only accrue when the user marks it «выполнил» — never automatic.
// Each item is tagged with a life-domain so completing it lights up the
// matching region on the freedom map.
//
// Sorted within each category by domain so visually similar items cluster.
// Shape mirrors schema.sql `micro_permission_templates` — ready to drop into
// Postgres when we wire it up.
export const MICRO_TEMPLATES: MicroPermissionTemplate[] = [
  // ─────────────────────────── 🌿 PERMISSIONS ───────────────────────────
  // food
  { id: 'pm-meal-want',    title: 'Закажи то блюдо, что реально хочешь',         suggestedPoints: 15, domain: 'food',    category: 'permission', isPremium: false },
  { id: 'pm-delicacy',     title: 'Купи дорогое лакомство — себе одному',         suggestedPoints: 20, domain: 'food',    category: 'permission', isPremium: false },
  { id: 'pm-coffee',       title: 'Возьми кофе в любимом месте, не на бегу',     suggestedPoints: 15, domain: 'food',    category: 'permission', isPremium: false },
  { id: 'pm-delivery',     title: 'Закажи доставку вместо «потерплю»',           suggestedPoints: 15, domain: 'food',    category: 'permission', isPremium: false },
  { id: 'pm-restaurant',   title: 'Сходи в ресторан, что давно откладываешь',    suggestedPoints: 30, domain: 'food',    category: 'permission', isPremium: false },

  // clothes
  { id: 'pm-cart',         title: 'Купи то, что давно лежит в корзине',          suggestedPoints: 25, domain: 'clothes', category: 'permission', isPremium: false },
  { id: 'pm-occasion',     title: 'Надень то, что бережёшь «на особый случай»',  suggestedPoints: 10, domain: 'clothes', category: 'permission', isPremium: false },
  { id: 'pm-underwear',    title: 'Купи бельё, в котором будешь себе нравиться', suggestedPoints: 20, domain: 'clothes', category: 'permission', isPremium: false },
  { id: 'pm-compliment',   title: 'Прими комплимент про одежду, не отнекивайся', suggestedPoints: 10, domain: 'clothes', category: 'permission', isPremium: false },

  // comfort
  { id: 'pm-bath',         title: 'Полежи в горячей ванне',                      suggestedPoints: 20, domain: 'comfort', category: 'permission', isPremium: false },
  { id: 'pm-blanket',      title: 'Купи плед, в который хочется завернуться',    suggestedPoints: 25, domain: 'comfort', category: 'permission', isPremium: false },
  { id: 'pm-taxi',         title: 'Поезжай на такси, не жди автобус',            suggestedPoints: 20, domain: 'comfort', category: 'permission', isPremium: false },
  { id: 'pm-headphones',   title: 'Купи хорошие наушники с шумоподавлением',     suggestedPoints: 30, domain: 'comfort', category: 'permission', isPremium: false },
  { id: 'pm-candle',       title: 'Зажги ароматную свечу или благовоние',        suggestedPoints: 10, domain: 'comfort', category: 'permission', isPremium: false },
  { id: 'pm-offline',      title: 'Не отвечай в чатах два часа',                 suggestedPoints: 15, domain: 'comfort', category: 'permission', isPremium: false },

  // health
  { id: 'pm-sleep',        title: 'Засни без будильника в выходной',             suggestedPoints: 15, domain: 'health',  category: 'permission', isPremium: false },
  { id: 'pm-beauty',       title: 'Запишись к косметологу/парикмахеру',          suggestedPoints: 25, domain: 'health',  category: 'permission', isPremium: false },
  { id: 'pm-spa',          title: 'Сходи на массаж или спа',                     suggestedPoints: 30, domain: 'health',  category: 'permission', isPremium: false },
  { id: 'pm-dayoff',       title: 'Возьми отгул, потому что устал(а)',           suggestedPoints: 30, domain: 'health',  category: 'permission', isPremium: false },
  { id: 'pm-vitamins',     title: 'Купи витамины, что давно нужны',              suggestedPoints: 15, domain: 'health',  category: 'permission', isPremium: false },
  { id: 'pm-doctor-postp', title: 'Запишись к врачу по тому, что откладываешь',  suggestedPoints: 25, domain: 'health',  category: 'permission', isPremium: false },

  // joy
  { id: 'pm-flowers',      title: 'Купи букет цветов себе',                      suggestedPoints: 20, domain: 'joy',     category: 'permission', isPremium: false },
  { id: 'pm-music',        title: 'Послушай любимую музыку в наушниках',         suggestedPoints: 10, domain: 'joy',     category: 'permission', isPremium: false },
  { id: 'pm-gift-self',    title: 'Купи маленький приятный подарок себе',        suggestedPoints: 20, domain: 'joy',     category: 'permission', isPremium: false },
  { id: 'pm-song-loop',    title: 'Поставь ту песню, что цепляет, на повтор',    suggestedPoints: 10, domain: 'joy',     category: 'permission', isPremium: false },
  { id: 'pm-dessert',      title: 'Купи десерт без всякого повода',              suggestedPoints: 15, domain: 'joy',     category: 'permission', isPremium: false },
  { id: 'pm-mug',          title: 'Завари чай/какао в красивой кружке',          suggestedPoints: 10, domain: 'joy',     category: 'permission', isPremium: false },

  // leisure
  { id: 'pm-movie',        title: 'Посмотри фильм, что давно хотел(а)',          suggestedPoints: 20, domain: 'leisure', category: 'permission', isPremium: false },
  { id: 'pm-class',        title: 'Запишись на то, что приносит удовольствие',   suggestedPoints: 25, domain: 'leisure', category: 'permission', isPremium: false },
  { id: 'pm-cafe-book',    title: 'Посиди в кафе с книгой, один(а)',             suggestedPoints: 20, domain: 'leisure', category: 'permission', isPremium: false },
  { id: 'pm-cinema-solo',  title: 'Сходи в кино один(а), на тот сеанс, что хочешь', suggestedPoints: 25, domain: 'leisure', category: 'permission', isPremium: false },
  { id: 'pm-event',        title: 'Сходи на выставку или концерт',               suggestedPoints: 30, domain: 'leisure', category: 'permission', isPremium: false },
  { id: 'pm-game-shelf',   title: 'Открой ту игру/книгу, что лежит «потом»',     suggestedPoints: 20, domain: 'leisure', category: 'permission', isPremium: false },

  // other — boundaries, "no"
  { id: 'pm-no',           title: 'Скажи «нет» тому, что не хочется',            suggestedPoints: 20, domain: 'other',   category: 'permission', isPremium: false },
  { id: 'pm-no-help',      title: 'Не помогай тем, кто не просил',               suggestedPoints: 15, domain: 'other',   category: 'permission', isPremium: false },
  { id: 'pm-decline',      title: 'Откажись от приглашения, которое не зашло',   suggestedPoints: 20, domain: 'other',   category: 'permission', isPremium: false },
  { id: 'pm-rest15',       title: 'Полежи просто так 15 минут без вины',         suggestedPoints: 10, domain: 'other',   category: 'permission', isPremium: false },
  { id: 'pm-useless',      title: 'Запрети себе быть полезным один час',         suggestedPoints: 20, domain: 'other',   category: 'permission', isPremium: false },
  { id: 'pm-weekend-off',  title: 'Не работай в выходной, даже если можно',      suggestedPoints: 25, domain: 'other',   category: 'permission', isPremium: false },

  // ─────────────────────────── 💪 EFFORT ───────────────────────────
  // food
  { id: 'ef-meal',         title: 'Приготовь себе нормальный обед',              suggestedPoints: 20, domain: 'food',    category: 'effort', isPremium: false },
  { id: 'ef-bfast',        title: 'Сядь и позавтракай, не на ходу',              suggestedPoints: 15, domain: 'food',    category: 'effort', isPremium: false },
  { id: 'ef-groceries',    title: 'Купи нормальные продукты на неделю',          suggestedPoints: 25, domain: 'food',    category: 'effort', isPremium: false },
  { id: 'ef-batch',        title: 'Сделай заготовку на пару дней вперёд',        suggestedPoints: 25, domain: 'food',    category: 'effort', isPremium: false },
  { id: 'ef-no-coffee',    title: 'Замени утренний кофе на нормальный завтрак',  suggestedPoints: 15, domain: 'food',    category: 'effort', isPremium: false },

  // clothes
  { id: 'ef-closet',       title: 'Разбери шкаф с одеждой',                      suggestedPoints: 30, domain: 'clothes', category: 'effort', isPremium: false },
  { id: 'ef-laundry',      title: 'Постирай отложенное бельё',                   suggestedPoints: 15, domain: 'clothes', category: 'effort', isPremium: false },
  { id: 'ef-repair',       title: 'Зашей или отнеси в ремонт сломавшееся',       suggestedPoints: 20, domain: 'clothes', category: 'effort', isPremium: false },
  { id: 'ef-iron',         title: 'Выгладь то, что висит мятым',                 suggestedPoints: 10, domain: 'clothes', category: 'effort', isPremium: false },

  // comfort / home
  { id: 'ef-sweep',        title: 'Подмети или пропылесось пол',                 suggestedPoints: 15, domain: 'comfort', category: 'effort', isPremium: false },
  { id: 'ef-dishes',       title: 'Помой накопившуюся посуду',                   suggestedPoints: 10, domain: 'comfort', category: 'effort', isPremium: false },
  { id: 'ef-bed',          title: 'Поменяй постельное бельё',                    suggestedPoints: 15, domain: 'comfort', category: 'effort', isPremium: false },
  { id: 'ef-throw',        title: 'Выброси то, что давно не используешь',        suggestedPoints: 20, domain: 'comfort', category: 'effort', isPremium: false },
  { id: 'ef-desktop',      title: 'Очисти рабочий стол компьютера',              suggestedPoints: 15, domain: 'comfort', category: 'effort', isPremium: false },
  { id: 'ef-junk-drawer',  title: 'Разбери ящик «всё подряд»',                   suggestedPoints: 20, domain: 'comfort', category: 'effort', isPremium: false },
  { id: 'ef-window',       title: 'Помой окно/раму',                             suggestedPoints: 20, domain: 'comfort', category: 'effort', isPremium: false },
  { id: 'ef-shelf',        title: 'Расхламь полку с книгами/безделушками',       suggestedPoints: 15, domain: 'comfort', category: 'effort', isPremium: false },

  // health
  { id: 'ef-move',         title: 'Сделай растяжку или тренировку',              suggestedPoints: 15, domain: 'health',  category: 'effort', isPremium: false },
  { id: 'ef-walk-8k',      title: 'Пройди 8000 шагов сегодня',                   suggestedPoints: 20, domain: 'health',  category: 'effort', isPremium: false },
  { id: 'ef-food-log',     title: 'Запиши, что съел(а) за день',                 suggestedPoints: 10, domain: 'health',  category: 'effort', isPremium: false },
  { id: 'ef-water',        title: 'Выпей 2 литра воды',                          suggestedPoints: 10, domain: 'health',  category: 'effort', isPremium: false },
  { id: 'ef-doctor',       title: 'Сходи к стоматологу/врачу, что откладывал(а)',suggestedPoints: 30, domain: 'health',  category: 'effort', isPremium: false },

  // joy
  { id: 'ef-plant',        title: 'Полей цветы или посади что-нибудь',           suggestedPoints: 10, domain: 'joy',     category: 'effort', isPremium: false },
  { id: 'ef-handmade',     title: 'Сделай что-то руками: рисуй / лепи / шей',    suggestedPoints: 25, domain: 'joy',     category: 'effort', isPremium: false },
  { id: 'ef-tidy-desk',    title: 'Прибери стол так, чтобы радовало глаз',       suggestedPoints: 10, domain: 'joy',     category: 'effort', isPremium: false },

  // leisure / mind
  { id: 'ef-book',         title: 'Прочитай книгу 30 минут',                     suggestedPoints: 20, domain: 'leisure', category: 'effort', isPremium: false },
  { id: 'ef-learn',        title: 'Посмотри полезную программу или лекцию',      suggestedPoints: 20, domain: 'leisure', category: 'effort', isPremium: false },
  { id: 'ef-course',       title: 'Пройди урок на курсе, что забросил(а)',       suggestedPoints: 25, domain: 'leisure', category: 'effort', isPremium: false },
  { id: 'ef-detox',        title: 'Проведи час без телефона',                    suggestedPoints: 25, domain: 'leisure', category: 'effort', isPremium: false },
  { id: 'ef-journal',      title: 'Напиши страницу дневника',                    suggestedPoints: 15, domain: 'leisure', category: 'effort', isPremium: false },

  // other — admin, relationships, work
  { id: 'ef-emails',       title: 'Разбери накопившуюся почту/чаты',             suggestedPoints: 20, domain: 'other',   category: 'effort', isPremium: false },
  { id: 'ef-bank',         title: 'Закрой надоевшую задачу с банком/документами',suggestedPoints: 25, domain: 'other',   category: 'effort', isPremium: false },
  { id: 'ef-parents',      title: 'Позвони родителям',                           suggestedPoints: 25, domain: 'other',   category: 'effort', isPremium: false },
  { id: 'ef-friend',       title: 'Напиши другу, с которым давно не общался(лась)', suggestedPoints: 20, domain: 'other', category: 'effort', isPremium: false },
  { id: 'ef-subs',         title: 'Закрой подписки, которые не используешь',     suggestedPoints: 15, domain: 'other',   category: 'effort', isPremium: false },
  { id: 'ef-spending',     title: 'Подсчитай траты за неделю',                   suggestedPoints: 20, domain: 'other',   category: 'effort', isPremium: false },
  { id: 'ef-paperwork',    title: 'Заполни ту бумажку, что висит',               suggestedPoints: 20, domain: 'other',   category: 'effort', isPremium: false },
  { id: 'ef-report',       title: 'Напиши отчёт, что откладываешь',              suggestedPoints: 25, domain: 'other',   category: 'effort', isPremium: false }
];

export function getMicroTemplate(id: string): MicroPermissionTemplate | undefined {
  return MICRO_TEMPLATES.find((t) => t.id === id);
}
