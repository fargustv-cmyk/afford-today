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
  domain_other: 'другое',

  // wish detail
  wish_back: '← назад',
  wish_steps_title: 'шаги',
  wish_add_step: '+ шаг',
  wish_steps_empty_title: 'начнём с малого',
  wish_steps_empty_body: 'один тап — одно микро-разрешение себе. они уже что-то приятное и заодно капают очки в цель.',
  wish_step_done_btn: 'выполнил',
  wish_unlocked_title: 'можно! 🎉',
  wish_unlocked_body: 'шкала заполнена. иди забирай.',
  wish_essential_title: 'это базовое — можно сразу',
  wish_essential_body: 'без всяких порогов и шагов. еда, лекарства, гигиена — твоё прямо сейчас.',

  // add step
  step_add_title: 'новый шаг',
  step_add_name_label: 'что сделать?',
  step_add_name_placeholder: 'например: 30 минут прогулки',
  step_add_size_label: 'размер',
  step_size_small: 'мелкий · 10',
  step_size_medium: 'средний · 25',
  step_size_large: 'крупный · 50',
  step_add_save: 'добавить',

  // mark-bought + Mozhno screen
  wish_mark_bought: 'я уже купил(а) это',
  wish_mark_bought_hint: 'покупку никогда не блокируем — кнопка всегда твоя',
  mozhno_pill_below: 'без гринда · горжусь',
  mozhno_title: 'Можно!',
  mozhno_sub_normal: 'Ты дошёл(ла) до конца. Официально — можно. Иди забирай.',
  mozhno_sub_below: 'Ты позволил(а) себе это без всякого гринда. Вот это и есть рост 🤍',
  mozhno_share: 'Поделиться',
  mozhno_continue: 'Готово',

  // post-purchase check-in (SPEC §7) — neutral, never judgmental
  checkin_title: 'как ощущается?',
  checkin_sub: 'любой ответ ок. это только для тебя — никуда не уйдёт.',
  checkin_save: 'сохранить',
  checkin_skip: 'пропустить',
  checkin_note_label: 'хочешь добавить?',
  checkin_note_placeholder: 'пару слов для себя — приватно',
  feeling_zero_guilt: 'ноль вины',
  feeling_joy: 'кайф',
  feeling_scared_but_good: 'страшно, но кайф',
  feeling_empty: 'пусто',
  feeling_guilt: 'накрыло',

  // map / "Список да" (SPEC §8)
  home_freedom_link_score: 'ты вернул(а) себе на {amount}',
  home_freedom_link_meta: 'за {count} разрешений · {below} без порога',
  freedom_back: '← к желаниям',
  freedom_title: 'карта свободы',
  freedom_score_label: 'ты вернул(а) себе на',
  freedom_meta_count: '{count} разрешений',
  freedom_meta_below: '{n} из них без порога',
  freedom_meta_empty: 'пока ни одного — но это ненадолго',
  freedom_empty_title: 'тут будет твоё «да»',
  freedom_empty_body: 'когда отметишь первую покупку — она оставит след в одной из категорий. дальше карта будет расти под тебя.',
  freedom_first_badge: 'впервые!',
  freedom_thriving_badge: 'цветёт',
  freedom_count_singular: '{n} раз',
  freedom_count_few: '{n} раза',
  freedom_count_many: '{n} раз',

  // onboarding (SPEC §10, rule-of-90: ends with an immediate "Можно!")
  onboarding_1_title: 'ты много работаешь.',
  onboarding_1_body: 'а тратить на себя без вины — почему-то сложно. знакомо?',
  onboarding_2_title: 'афорд тудей — твоё личное «можно».',
  onboarding_2_body: 'добавь то, что хочешь. сделай пару шагов. разреши себе.',
  onboarding_3_title: 'начнём с малого.',
  onboarding_3_body: 'позволь себе сегодня что-то крошечное. прямо сейчас. бесплатно — потому что ты уже заслужил(а) просто так.',
  onboarding_next: 'дальше',
  onboarding_finish: 'разрешаю',
  onboarding_first_wish_title: 'первое «можно»'
} as const;

export type RuKey = keyof typeof ru;
