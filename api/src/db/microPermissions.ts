import type { MicroPermissionTemplate } from '@afford/shared';

// Mirrors the seed in schema.sql + the new `category` split.
//
// Two flavours of step you can pick instead of staring at a blank "+ шаг":
//   permission — "разреши себе нечто приятное"
//   effort     — "сделай что-то полезное и заслужи горжусь"
// Both feed the same wish bar; the split is purely psychological framing.
export const MICRO_TEMPLATES: MicroPermissionTemplate[] = [
  // Permissions (treat yourself)
  { id: 'mt-coffee',  title: 'Возьми сегодня кофе навынос',               suggestedPoints: 15, domain: 'joy',     category: 'permission', isPremium: false },
  { id: 'mt-taxi',    title: 'Поезжай на такси, не жди автобус',          suggestedPoints: 20, domain: 'comfort', category: 'permission', isPremium: false },
  { id: 'mt-meal',    title: 'Закажи то блюдо, что реально хочешь',       suggestedPoints: 15, domain: 'food',    category: 'permission', isPremium: false },
  { id: 'mt-socks',   title: 'Купи носки, которые давно откладывал(а)',   suggestedPoints: 10, domain: 'clothes', category: 'permission', isPremium: false },
  { id: 'mt-fun',     title: 'Запишись на то, что приносит удовольствие', suggestedPoints: 25, domain: 'leisure', category: 'permission', isPremium: false },

  // Effort (earn it through work — fills the bar by labor, not by treats)
  { id: 'ef-clean',   title: 'Убраться в комнате',                        suggestedPoints: 25, domain: 'other',   category: 'effort',     isPremium: false },
  { id: 'ef-emails',  title: 'Разобрать накопившуюся почту',              suggestedPoints: 20, domain: 'other',   category: 'effort',     isPremium: false },
  { id: 'ef-bank',    title: 'Закрыть надоевшую задачу с банком',         suggestedPoints: 25, domain: 'other',   category: 'effort',     isPremium: false },
  { id: 'ef-move',    title: 'Сделать 20 приседаний / тренировку',         suggestedPoints: 15, domain: 'health',  category: 'effort',     isPremium: false },
  { id: 'ef-cook',    title: 'Приготовить нормальный обед',               suggestedPoints: 20, domain: 'food',    category: 'effort',     isPremium: false }
];

export function getMicroTemplate(id: string): MicroPermissionTemplate | undefined {
  return MICRO_TEMPLATES.find((t) => t.id === id);
}
