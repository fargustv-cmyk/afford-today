import type { MicroPermissionTemplate } from '@afford/shared';

// Suggestion library — actually-skipped things people forget to do for
// themselves. Split into:
//   permission — "разреши себе" (things you keep putting off because
//                «потом», «не сейчас», «зачем», «и так нормально»).
//   effort     — "сделай и заслужи" (chores and small adult things people
//                avoid out of inertia, not malice).
//
// Behaviour: tapping a card adds it to the user's step list AS PENDING.
// Points only accrue when the user marks it «выполнил» — never automatic.
export const MICRO_TEMPLATES: MicroPermissionTemplate[] = [
  // ─────── 🌿 permission (allow yourself) ───────
  { id: 'pm-coffee',   title: 'Возьми кофе навынос, не пей на бегу',         suggestedPoints: 15, domain: 'joy',     category: 'permission', isPremium: false },
  { id: 'pm-taxi',     title: 'Поезжай на такси, не жди автобус',            suggestedPoints: 20, domain: 'comfort', category: 'permission', isPremium: false },
  { id: 'pm-meal',     title: 'Закажи то блюдо, что реально хочешь',         suggestedPoints: 15, domain: 'food',    category: 'permission', isPremium: false },
  { id: 'pm-socks',    title: 'Купи то, что давно откладывал(а)',            suggestedPoints: 10, domain: 'clothes', category: 'permission', isPremium: false },
  { id: 'pm-fun',      title: 'Запишись на то, что приносит удовольствие',   suggestedPoints: 25, domain: 'leisure', category: 'permission', isPremium: false },
  { id: 'pm-rest15',   title: 'Полежи просто так 15 минут без вины',         suggestedPoints: 10, domain: 'leisure', category: 'permission', isPremium: false },
  { id: 'pm-candle',   title: 'Зажги ароматную свечу или благовоние',        suggestedPoints: 10, domain: 'comfort', category: 'permission', isPremium: false },
  { id: 'pm-music',    title: 'Послушай любимую музыку в наушниках',         suggestedPoints: 10, domain: 'joy',     category: 'permission', isPremium: false },
  { id: 'pm-movie',    title: 'Посмотри фильм, который давно хотел(а)',      suggestedPoints: 20, domain: 'leisure', category: 'permission', isPremium: false },
  { id: 'pm-flowers',  title: 'Купи букет цветов себе',                      suggestedPoints: 20, domain: 'joy',     category: 'permission', isPremium: false },
  { id: 'pm-spa',      title: 'Сходи на массаж или спа',                     suggestedPoints: 30, domain: 'health',  category: 'permission', isPremium: false },
  { id: 'pm-sleep',    title: 'Засни без будильника в выходной',             suggestedPoints: 15, domain: 'health',  category: 'permission', isPremium: false },
  { id: 'pm-no',       title: 'Скажи «нет» тому, что не хочется',            suggestedPoints: 20, domain: 'other',   category: 'permission', isPremium: false },
  { id: 'pm-offline',  title: 'Не отвечай в чатах два часа',                 suggestedPoints: 15, domain: 'comfort', category: 'permission', isPremium: false },
  { id: 'pm-bath',     title: 'Полежи в горячей ванне',                      suggestedPoints: 20, domain: 'comfort', category: 'permission', isPremium: false },
  { id: 'pm-want',     title: 'Купи ту вещь, что давно нравится',            suggestedPoints: 25, domain: 'clothes', category: 'permission', isPremium: false },
  { id: 'pm-beauty',   title: 'Запишись к косметологу/парикмахеру',          suggestedPoints: 25, domain: 'health',  category: 'permission', isPremium: false },
  { id: 'pm-cafe',     title: 'Посиди в кафе с книгой, один(а)',             suggestedPoints: 20, domain: 'leisure', category: 'permission', isPremium: false },

  // ─────── 💪 effort (do and earn pride) ───────
  { id: 'ef-meal',     title: 'Приготовь себе нормальный обед',              suggestedPoints: 20, domain: 'food',    category: 'effort', isPremium: false },
  { id: 'ef-bfast',    title: 'Сядь и позавтракай, не на ходу',              suggestedPoints: 15, domain: 'food',    category: 'effort', isPremium: false },
  { id: 'ef-sweep',    title: 'Подмети или пропылесось пол',                 suggestedPoints: 15, domain: 'other',   category: 'effort', isPremium: false },
  { id: 'ef-dishes',   title: 'Помой накопившуюся посуду',                   suggestedPoints: 10, domain: 'other',   category: 'effort', isPremium: false },
  { id: 'ef-closet',   title: 'Разбери шкаф с одеждой',                      suggestedPoints: 30, domain: 'other',   category: 'effort', isPremium: false },
  { id: 'ef-bed',      title: 'Поменяй постельное бельё',                    suggestedPoints: 15, domain: 'other',   category: 'effort', isPremium: false },
  { id: 'ef-throw',    title: 'Выброси то, что давно не используешь',        suggestedPoints: 20, domain: 'other',   category: 'effort', isPremium: false },
  { id: 'ef-emails',   title: 'Разбери накопившуюся почту/чаты',             suggestedPoints: 20, domain: 'other',   category: 'effort', isPremium: false },
  { id: 'ef-bank',     title: 'Закрой надоевшую задачу с банком/документами',suggestedPoints: 25, domain: 'other',   category: 'effort', isPremium: false },
  { id: 'ef-book',     title: 'Прочитай книгу 30 минут',                     suggestedPoints: 20, domain: 'leisure', category: 'effort', isPremium: false },
  { id: 'ef-learn',    title: 'Посмотри полезную программу или лекцию',      suggestedPoints: 20, domain: 'leisure', category: 'effort', isPremium: false },
  { id: 'ef-detox',    title: 'Проведи час без телефона',                    suggestedPoints: 25, domain: 'leisure', category: 'effort', isPremium: false },
  { id: 'ef-move',     title: 'Сделай растяжку или тренировку',              suggestedPoints: 15, domain: 'health',  category: 'effort', isPremium: false },
  { id: 'ef-parents',  title: 'Позвони родителям',                           suggestedPoints: 25, domain: 'other',   category: 'effort', isPremium: false },
  { id: 'ef-friend',   title: 'Напиши другу, с которым давно не общался(лась)', suggestedPoints: 20, domain: 'other', category: 'effort', isPremium: false },
  { id: 'ef-plant',    title: 'Полей цветы / посади что-нибудь',             suggestedPoints: 10, domain: 'joy',     category: 'effort', isPremium: false },
  { id: 'ef-desktop',  title: 'Очисти рабочий стол компьютера',              suggestedPoints: 15, domain: 'other',   category: 'effort', isPremium: false },
  { id: 'ef-subs',     title: 'Закрой подписки, которые не используешь',     suggestedPoints: 15, domain: 'other',   category: 'effort', isPremium: false }
];

export function getMicroTemplate(id: string): MicroPermissionTemplate | undefined {
  return MICRO_TEMPLATES.find((t) => t.id === id);
}
