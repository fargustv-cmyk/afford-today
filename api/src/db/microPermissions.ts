import type { MicroPermissionTemplate } from '@afford/shared';

// Mirrors the seed in schema.sql. Lives in code until we wire Postgres up
// so the empty-step-list experience works on day 1.
export const MICRO_TEMPLATES: MicroPermissionTemplate[] = [
  { id: 'mt-coffee',    title: 'Возьми сегодня кофе навынос',               suggestedPoints: 15, domain: 'joy',     isPremium: false },
  { id: 'mt-taxi',      title: 'Поезжай на такси, не жди автобус',          suggestedPoints: 20, domain: 'comfort', isPremium: false },
  { id: 'mt-meal',      title: 'Закажи то блюдо, что реально хочешь',       suggestedPoints: 15, domain: 'food',    isPremium: false },
  { id: 'mt-socks',     title: 'Купи носки, которые давно откладывал(а)',   suggestedPoints: 10, domain: 'clothes', isPremium: false },
  { id: 'mt-fun',       title: 'Запишись на то, что приносит удовольствие', suggestedPoints: 25, domain: 'leisure', isPremium: false }
];

export function getMicroTemplate(id: string): MicroPermissionTemplate | undefined {
  return MICRO_TEMPLATES.find((t) => t.id === id);
}
