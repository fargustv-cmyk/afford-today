// All user-facing copy lives here per CLAUDE.md.
// Tone: cheeky supportive friend; no clinical / wound language.

export const ru = {
  // scaffold (kept for non-Telegram & unauthorized states)
  scaffold_subtitle: 'твоё личное «можно»',
  scaffold_loading: 'секунду…',
  scaffold_no_telegram: 'открой через бота в Telegram — оттуда узнаю тебя.',
  scaffold_unauthorized: 'не получилось проверить твою сессию. перезагрузи мини-апп.',

  // home / wishlist
  home_overline: 'твой вишлист',
  home_title: 'хочу',
  home_add: '+ хочу',
  home_empty_title: 'чего ты хочешь?',
  home_empty_body: 'не «что полезно», а что *хочется*. одна штука — для начала.',
  home_empty_cta: '+ добавить первое желание',

  // wish card
  wish_progress: '{earned} из {required} очков',
  wish_unlocked: 'можно! забирай.',
  wish_essential_badge: 'базовое · сразу можно',
  wish_type_need: 'нужное',
  wish_type_want: 'хотелка',
  wish_type_essential: 'базовое',

  // add wish sheet
  add_title: 'что хочется?',
  add_url_label: 'ссылка',
  add_url_placeholder: 'вставь ссылку — подтяну название и цену',
  add_url_loading: 'смотрю что там…',
  add_url_failed: 'не получилось подтянуть. заполни вручную.',
  add_name_label: 'что это',
  add_name_placeholder: 'например, наушники',
  add_price_label: 'цена',
  add_price_placeholder: 'необязательно',
  add_type_label: 'это…',
  add_type_essential: 'базовое (еда, лекарства)',
  add_type_essential_hint: 'без порога — сразу можно',
  add_type_need: 'нужное',
  add_type_want: 'хочу',
  add_domain_label: 'категория',
  add_save: 'добавить в вишлист',
  add_cancel: 'отмена',
  add_essential_chip: 'это базовое — сразу разрешено',

  // domains
  domain_clothes: 'одежда',
  domain_leisure: 'отдых',
  domain_comfort: 'комфорт',
  domain_health: 'здоровье',
  domain_joy: 'радость',
  domain_food: 'еда',
  domain_other: 'другое'
} as const;

export type RuKey = keyof typeof ru;
