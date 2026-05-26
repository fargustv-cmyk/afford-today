// ───────── Telegram WebApp init ─────────

const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  if (tg.setHeaderColor) tg.setHeaderColor('#000000');
  if (tg.setBackgroundColor) tg.setBackgroundColor('#000000');
}

const haptic = (k = 'light') => { try { tg?.HapticFeedback?.impactOccurred?.(k); } catch {} };
const hapticNotif = (k) => { try { tg?.HapticFeedback?.notificationOccurred?.(k); } catch {} };

// ───────── i18n ─────────

const I18N = {
  ru: {
    'greeting.morning': 'Доброе утро',
    'greeting.afternoon': 'Добрый день',
    'greeting.evening': 'Добрый вечер',
    'greeting.night': 'Поздняя ночь',
    'screen.dashboard': 'Главная',
    'screen.tasks': 'Задачи',
    'screen.reward': 'Награды',
    'nav.home': 'Главная',
    'nav.tasks': 'Задачи',
    'nav.reward': 'Награды',
    'section.current_goal': 'Текущая цель',
    'section.today': 'Сегодня',
    'section.up_next': 'Следующее',
    'section.view_all': 'Все',
    'section.all_tasks': 'Все задачи',
    'section.history': 'История разрешений',
    'goal.level': 'Уровень {level} · ещё {remaining} оч.',
    'goal.unlocked_hint': 'Ты заработал разрешение',
    'goal.btn_mark_bought': 'Я купил это',
    'goal.btn_add_task': '＋ Добавить задачу',
    'stat.tasks': 'Задачи',
    'stat.points': 'Очки',
    'stat.streak': 'Стрик',
    'empty.no_goal.title': 'Пока нет цели',
    'empty.no_goal.body': 'Добавь первое желание — носки, книгу, наушники. Что угодно, что ты себе пока не разрешил.',
    'empty.no_goal.cta': '＋ Добавить первую цель',
    'empty.no_tasks.title': 'Нет задач',
    'empty.no_tasks.body': 'Добавь простые шаги — от «помыть посуду» до «закрыть проект». За каждый получаешь очки.',
    'empty.no_freedom.title': 'Пока пусто',
    'empty.no_freedom.body': 'Когда отметишь первую покупку — она появится на карте свободы.',
    'reward.title': 'Счёт свободы',
    'reward.allowed': 'позволено',
    'domain.clothing': 'Одежда',
    'domain.rest': 'Отдых',
    'domain.comfort': 'Комфорт',
    'domain.health': 'Здоровье',
    'domain.pleasure': 'Удовольствие',
    'domain.other': 'Другое',
    'toast.points': '+{n} очков',
    'toast.goal_added': 'Цель добавлена',
    'toast.task_added': 'Задача добавлена',
    'toast.bought': 'Записано в твою карту свободы',
    'unlock.title': 'Можно!',
    'unlock.sub': 'Ты заслужил {name}. Открывай магазин, оформляй покупку, возвращайся и нажми «Я купил это».',
    'unlock.btn': 'Принять разрешение',
    'task.pts': 'оч',
    'task.cat.work': 'Работа',
    'task.cat.health': 'Здоровье',
    'task.cat.home': 'Дом',
    'add_goal.title': 'Новая цель',
    'add_goal.name': 'Что хочешь?',
    'add_goal.name_placeholder': 'Например: Sony WH-1000XM5',
    'add_goal.price': 'Цена',
    'add_goal.price_placeholder': '25000',
    'add_goal.type': 'Тип',
    'add_goal.type_need': 'Нужное',
    'add_goal.type_want': 'Хотелка',
    'add_goal.domain': 'Категория',
    'add_goal.save': 'Создать',
    'add_task.title': 'Новая задача',
    'add_task.name': 'Что сделать?',
    'add_task.name_placeholder': 'Например: 30 мин прогулки',
    'add_task.points': 'Сложность',
    'add_task.points_small': 'Мелкая · 10',
    'add_task.points_mid': 'Средняя · 25',
    'add_task.points_big': 'Крупная · 50',
    'add_task.save': 'Добавить',
    'reflect.title': 'Как ощущается?',
    'reflect.sub': 'Это тренировка кнопки «мне можно». Никаких правильных ответов.',
    'reflect.good': 'Хорошо',
    'reflect.okay': 'Норм',
    'reflect.guilty': 'Стыдно',
    'reflect.note_placeholder': 'Что-то добавить? (необязательно)',
    'reflect.save': 'Готово',
    'settings.title': 'Настройки',
    'lang.toggle': 'EN',
    'common.cancel': 'Отмена',
    'common.delete': 'Удалить',
    'goals.title': 'Все цели',
    'goals.subtitle': 'Твой вишлист и то, что уже разрешено',
    'goals.make_current': 'Сделать текущей',
    'goals.current_badge': 'Сейчас',
    'goals.purchased_badge': '✓ Куплено',
    'goals.open': 'Все цели ({n})',
    'toast.current_set': 'Текущая цель обновлена',
    'toast.goal_deleted': 'Цель удалена',
    'confirm.delete_goal': 'Удалить эту цель? Все её задачи также пропадут.'
  },
  en: {
    'greeting.morning': 'Good morning',
    'greeting.afternoon': 'Good afternoon',
    'greeting.evening': 'Good evening',
    'greeting.night': 'Late night',
    'screen.dashboard': 'Dashboard',
    'screen.tasks': 'Tasks',
    'screen.reward': 'Reward',
    'nav.home': 'Home',
    'nav.tasks': 'Tasks',
    'nav.reward': 'Reward',
    'section.current_goal': 'Current goal',
    'section.today': 'Today',
    'section.up_next': 'Up next',
    'section.view_all': 'View all',
    'section.all_tasks': 'All tasks',
    'section.history': 'Permission history',
    'goal.level': 'Level {level} · {remaining} points to go',
    'goal.unlocked_hint': 'You earned permission',
    'goal.btn_mark_bought': 'I bought it',
    'goal.btn_add_task': '＋ Add task',
    'stat.tasks': 'Tasks',
    'stat.points': 'Points',
    'stat.streak': 'Streak',
    'empty.no_goal.title': 'No goal yet',
    'empty.no_goal.body': "Add your first wish — socks, a book, headphones. Anything you've been holding back from.",
    'empty.no_goal.cta': '＋ Add your first goal',
    'empty.no_tasks.title': 'No tasks',
    'empty.no_tasks.body': 'Add simple steps — from "do the dishes" to "ship the project". Each one earns points.',
    'empty.no_freedom.title': 'Empty for now',
    'empty.no_freedom.body': 'When you mark your first purchase, it lands here on your freedom map.',
    'reward.title': 'Freedom score',
    'reward.allowed': 'allowed',
    'domain.clothing': 'Clothing',
    'domain.rest': 'Rest',
    'domain.comfort': 'Comfort',
    'domain.health': 'Health',
    'domain.pleasure': 'Pleasure',
    'domain.other': 'Other',
    'toast.points': '+{n} points',
    'toast.goal_added': 'Goal added',
    'toast.task_added': 'Task added',
    'toast.bought': 'Added to your freedom map',
    'unlock.title': 'You can!',
    'unlock.sub': 'You earned {name}. Go to the shop, buy it, then come back and tap "I bought it".',
    'unlock.btn': 'Accept permission',
    'task.pts': 'pts',
    'task.cat.work': 'Work',
    'task.cat.health': 'Health',
    'task.cat.home': 'Home',
    'add_goal.title': 'New goal',
    'add_goal.name': 'What do you want?',
    'add_goal.name_placeholder': 'e.g. Sony WH-1000XM5',
    'add_goal.price': 'Price',
    'add_goal.price_placeholder': '25000',
    'add_goal.type': 'Type',
    'add_goal.type_need': 'Need',
    'add_goal.type_want': 'Want',
    'add_goal.domain': 'Category',
    'add_goal.save': 'Create',
    'add_task.title': 'New task',
    'add_task.name': 'What to do?',
    'add_task.name_placeholder': 'e.g. 30 min walk',
    'add_task.points': 'Difficulty',
    'add_task.points_small': 'Small · 10',
    'add_task.points_mid': 'Medium · 25',
    'add_task.points_big': 'Large · 50',
    'add_task.save': 'Add',
    'reflect.title': 'How does it feel?',
    'reflect.sub': "This is training the 'I'm allowed' muscle. No right answers.",
    'reflect.good': 'Good',
    'reflect.okay': 'Okay',
    'reflect.guilty': 'Guilty',
    'reflect.note_placeholder': 'Anything to add? (optional)',
    'reflect.save': 'Done',
    'settings.title': 'Settings',
    'lang.toggle': 'RU',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'goals.title': 'All goals',
    'goals.subtitle': 'Your wishlist and what you already allowed',
    'goals.make_current': 'Make current',
    'goals.current_badge': 'Current',
    'goals.purchased_badge': '✓ Bought',
    'goals.open': 'All goals ({n})',
    'toast.current_set': 'Current goal updated',
    'toast.goal_deleted': 'Goal removed',
    'confirm.delete_goal': 'Delete this goal? Its tasks will be removed too.'
  }
};

const LANG_KEY = 'afford:lang';

function detectInitialLang() {
  try {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored === 'ru' || stored === 'en') return stored;
  } catch {}
  const tgLang = tg?.initDataUnsafe?.user?.language_code;
  if (tgLang === 'ru') return 'ru';
  const browser = (navigator.language || 'en').toLowerCase();
  if (browser.startsWith('ru')) return 'ru';
  return 'en';
}

let lang = detectInitialLang();

function t(key, params = {}) {
  let s = (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key;
  for (const [k, v] of Object.entries(params)) s = s.split(`{${k}}`).join(v);
  return s;
}

function setLang(newLang) {
  if (newLang !== 'ru' && newLang !== 'en') return;
  lang = newLang;
  try { localStorage.setItem(LANG_KEY, newLang); } catch {}
  render();
  syncNavLabels();
}

// ───────── storage ─────────

const cs = tg?.CloudStorage;
const storage = {
  getItem(key) {
    if (cs?.getItem) {
      return new Promise(resolve => {
        let done = false;
        const finish = (val) => { if (!done) { done = true; resolve(val); } };
        // Таймаут на случай если Telegram-коллбэк никогда не вернётся
        const to = setTimeout(() => finish(null), 2000);
        try {
          cs.getItem(key, (err, val) => {
            clearTimeout(to);
            finish(err || val == null ? null : val);
          });
        } catch { finish(null); }
      });
    }
    return Promise.resolve(localStorage.getItem(key));
  },
  setItem(key, value) {
    if (cs?.setItem) return new Promise(r => cs.setItem(key, value, () => r()));
    localStorage.setItem(key, value);
    return Promise.resolve();
  }
};

const STORAGE_KEY = 'afford:v2';

// ───────── state ─────────

function makeEmptyState() {
  return {
    goals: [],
    tasks: [],
    freedomLog: [],
    streak: { current: 0, longest: 0, lastCompletedDay: null },
    currentGoalId: null,
    unlocked: false
  };
}

let state = makeEmptyState();
let currentScreen = 'home';

async function loadState() {
  const raw = await storage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const saved = JSON.parse(raw);
    state = { ...makeEmptyState(), ...saved };
    // Миграция: если есть цели, но currentGoalId не выставлен — берём первую активную
    if (!state.currentGoalId && state.goals.length) {
      state.currentGoalId = state.goals.find(g => !g.purchasedAt)?.id || null;
    }
  } catch {}
}

let saveTimer = null;
function saveState() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => storage.setItem(STORAGE_KEY, JSON.stringify(state)), 250);
}

// ───────── pro ─────────

async function checkUnlock() {
  if (!tg?.initData) return;
  try {
    const r = await fetch('/api/me', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData: tg.initData })
    });
    const data = await r.json();
    state.unlocked = !!data.unlocked;
  } catch {}
}

// ───────── helpers ─────────

const $ = (id) => document.getElementById(id);
const app = $('app');

const genId = () => (crypto?.randomUUID?.() || ('id-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8)));

function greeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return t('greeting.morning');
  if (h >= 12 && h < 18) return t('greeting.afternoon');
  if (h >= 18 && h < 23) return t('greeting.evening');
  return t('greeting.night');
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function todayISO() { return new Date().toISOString().slice(0, 10); }
function dateISO(ts) { return new Date(ts).toISOString().slice(0, 10); }

function activeGoal() {
  if (state.currentGoalId) {
    const g = state.goals.find(g => g.id === state.currentGoalId);
    if (g && !g.purchasedAt) return g;
  }
  return state.goals.find(g => !g.purchasedAt) || null;
}

function todayPoints() {
  const today = todayISO();
  return state.tasks
    .filter(task => task.completedAt && dateISO(task.completedAt) === today)
    .reduce((sum, task) => sum + (task.points || 0), 0);
}

function pendingTasksForGoal(goalId) {
  return state.tasks.filter(t => !t.completedAt && t.goalId === goalId);
}

// Порог очков, нужный для цели
function thresholdFor(type, price) {
  if (type === 'need') return 50;
  // want: масштабируем по цене, минимум 100, максимум 1000
  const n = Math.max(100, Math.min(1000, Math.round(price / 50)));
  return n;
}

function taskColorFor(points) {
  if (points >= 50) return 'red';
  if (points >= 25) return 'orange';
  if (points >= 15) return 'green';
  return 'blue';
}

function showToast(msg) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 1800);
}

// ───────── screens ─────────

function renderHome() {
  const goal = activeGoal();

  if (!goal) {
    app.innerHTML = `
      ${topbarHtml()}
      <div class="empty-state">
        <strong>${t('empty.no_goal.title')}</strong>
        ${escapeHtml(t('empty.no_goal.body'))}
        <button type="button" class="cta-btn" data-action="add-goal">${t('empty.no_goal.cta')}</button>
      </div>
    `;
    bindCommon();
    return;
  }

  const tasks = pendingTasksForGoal(goal.id);
  const pct = Math.min(100, (goal.currentPoints / goal.threshold) * 100);
  const remaining = Math.max(0, goal.threshold - goal.currentPoints);
  const ready = goal.currentPoints >= goal.threshold;

  app.innerHTML = `
    ${topbarHtml()}
    <div class="goal-card ${ready ? 'ready' : ''}">
      <div class="overline">${t('section.current_goal')}</div>
      <div class="goal-name">${escapeHtml(goal.name)}</div>
      <div class="goal-points">
        <span class="goal-points-cur">${goal.currentPoints}</span>
        <span class="goal-points-of">/${goal.threshold}</span>
      </div>
      <div class="goal-bar"><div class="goal-bar-fill" style="width:${pct}%"></div></div>
      <div class="goal-meta">${ready
        ? `<strong>${t('goal.unlocked_hint')}</strong>`
        : t('goal.level', { level: Math.floor(goal.currentPoints / 100) + 1, remaining })
      }</div>
      ${ready
        ? `<button type="button" class="goal-action primary" data-action="mark-bought">${t('goal.btn_mark_bought')}</button>`
        : `<button type="button" class="goal-action ghost" data-action="add-task">${t('goal.btn_add_task')}</button>`
      }
    </div>

    <div class="section-label">${t('section.today')}</div>
    <div class="stats">
      <div class="stat stat-blue">
        <div class="stat-num">${tasks.length}</div>
        <div class="stat-label">${t('stat.tasks')}</div>
      </div>
      <div class="stat stat-green">
        <div class="stat-num">${todayPoints()}</div>
        <div class="stat-label">${t('stat.points')}</div>
      </div>
      <div class="stat stat-red">
        <div class="stat-num">${state.streak.current}</div>
        <div class="stat-label">${t('stat.streak')}</div>
      </div>
    </div>

    <div class="section-row">
      <div class="section-label">${t('section.up_next')}</div>
      ${tasks.length > 3 ? `<button type="button" class="section-link" data-go="tasks">${t('section.view_all')}</button>` : ''}
    </div>
    ${tasks.length ? renderTaskList(tasks.slice(0, 3)) : `
      <div class="empty-state">
        <strong>${t('empty.no_tasks.title')}</strong>
        ${escapeHtml(t('empty.no_tasks.body'))}
        <button type="button" class="cta-btn" data-action="add-task">${t('goal.btn_add_task')}</button>
      </div>
    `}
  `;
  bindCommon();
}

function renderTasks() {
  const goal = activeGoal();
  const tasks = goal ? state.tasks.filter(t => t.goalId === goal.id) : state.tasks;

  app.innerHTML = `
    ${topbarHtml(t('screen.tasks'))}
    ${goal ? `<div class="task-goal-hint">${escapeHtml(goal.name)} · ${goal.currentPoints}/${goal.threshold}</div>` : ''}
    ${tasks.length ? renderTaskList(tasks) : `
      <div class="empty-state">
        <strong>${t('empty.no_tasks.title')}</strong>
        ${escapeHtml(t('empty.no_tasks.body'))}
        ${goal ? `<button type="button" class="cta-btn" data-action="add-task">${t('goal.btn_add_task')}</button>` : ''}
      </div>
    `}
  `;
  bindCommon();
}

function renderReward() {
  const domains = [
    { key: 'clothing' }, { key: 'rest' }, { key: 'comfort' },
    { key: 'health' }, { key: 'pleasure' }, { key: 'other' }
  ];
  const counts = {};
  for (const d of domains) counts[d.key] = 0;
  for (const entry of state.freedomLog) {
    const key = entry.domain || 'other';
    counts[key] = (counts[key] || 0) + 1;
  }

  const hasAny = state.freedomLog.length > 0;
  const sortedHistory = [...state.freedomLog].sort((a, b) => b.purchasedAt - a.purchasedAt);

  app.innerHTML = `
    ${topbarHtml(t('screen.reward'))}
    <div class="section-label">${t('reward.title')}</div>
    <div class="reward-grid">
      ${domains.map(d => `
        <div class="reward-tile">
          <div class="reward-tile-domain">${t('domain.' + d.key)}</div>
          <div class="reward-tile-count">${counts[d.key]}</div>
          <div class="reward-tile-cap">${t('reward.allowed')}</div>
        </div>
      `).join('')}
    </div>

    ${hasAny ? `
      <div class="section-label">${t('section.history')}</div>
      <div class="history-list">
        ${sortedHistory.map(e => `
          <div class="history-item">
            <div class="history-feeling">${feelingEmoji(e.feeling)}</div>
            <div class="history-body">
              <div class="history-name">${escapeHtml(e.name)}</div>
              <div class="history-meta">${t('domain.' + (e.domain || 'other'))} · ${formatDate(e.purchasedAt)}</div>
            </div>
          </div>
        `).join('')}
      </div>
    ` : `
      <div class="empty-state" style="margin-top:16px">
        <strong>${t('empty.no_freedom.title')}</strong>
        ${escapeHtml(t('empty.no_freedom.body'))}
      </div>
    `}
  `;
  bindCommon();
}

function feelingEmoji(f) {
  if (f === 'good') return '😌';
  if (f === 'okay') return '😐';
  if (f === 'guilty') return '😞';
  return '·';
}

function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'short' });
}

// ───────── partials ─────────

function topbarHtml(title) {
  const goal = activeGoal();
  const showPlus = currentScreen === 'home' || currentScreen === 'tasks';
  const plusAction = !goal ? 'add-goal' : 'add-task';
  const showGoalsBtn = state.goals.length > 0 && (currentScreen === 'home' || currentScreen === 'tasks');

  return `
    <div class="topbar">
      <div>
        <div class="overline">${title ? '' : greeting()}</div>
        <h1 class="title-serif">${escapeHtml(title || t('screen.dashboard'))}</h1>
      </div>
      <div class="topbar-actions">
        ${showGoalsBtn ? `<button type="button" class="icon-btn" data-action="open-goals" aria-label="${t('goals.title')}">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
        </button>` : ''}
        ${showPlus ? `<button type="button" class="icon-btn primary" data-action="${plusAction}" aria-label="Add">+</button>` : ''}
        <button type="button" class="lang-btn" id="langBtn" aria-label="Language">${t('lang.toggle')}</button>
      </div>
    </div>
  `;
}

function renderTaskList(tasks) {
  return `
    <div class="task-list">
      ${tasks.map(task => {
        const color = task.color || taskColorFor(task.points);
        return `
          <button type="button" class="task-row ${task.completedAt ? 'done' : ''}" data-task="${task.id}">
            <div class="task-badge t-${color}">${task.points}</div>
            <div class="task-body">
              <div class="task-title">${escapeHtml(task.title)}</div>
              <div class="task-meta">${task.points} ${t('task.pts')}</div>
            </div>
            ${task.completedAt
              ? `<span class="task-check">✓</span>`
              : `<svg class="chev" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`
            }
          </button>
        `;
      }).join('')}
    </div>
  `;
}

// ───────── actions ─────────

function bindCommon() {
  for (const btn of document.querySelectorAll('[data-task]')) {
    btn.addEventListener('click', () => completeTask(btn.dataset.task));
  }
  for (const btn of document.querySelectorAll('[data-go]')) {
    btn.addEventListener('click', () => switchScreen(btn.dataset.go));
  }
  for (const btn of document.querySelectorAll('[data-action]')) {
    btn.addEventListener('click', () => handleAction(btn.dataset.action));
  }
  const langBtn = $('langBtn');
  if (langBtn) langBtn.addEventListener('click', () => {
    setLang(lang === 'ru' ? 'en' : 'ru');
    haptic('light');
  });
}

function handleAction(action) {
  if (action === 'add-goal') openAddGoal();
  else if (action === 'add-task') openAddTask();
  else if (action === 'mark-bought') openReflection();
  else if (action === 'open-goals') openGoals();
}

function completeTask(taskId) {
  const task = state.tasks.find(x => x.id === taskId);
  if (!task || task.completedAt) return;
  task.completedAt = Date.now();

  const goal = state.goals.find(g => g.id === task.goalId);
  if (goal && !goal.purchasedAt) {
    goal.currentPoints = (goal.currentPoints || 0) + task.points;
  }

  const today = todayISO();
  if (state.streak.lastCompletedDay !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    state.streak.current = state.streak.lastCompletedDay === yesterday ? state.streak.current + 1 : 1;
    state.streak.lastCompletedDay = today;
    state.streak.longest = Math.max(state.streak.longest || 0, state.streak.current);
  }

  saveState();
  hapticNotif('success');
  showToast(t('toast.points', { n: task.points }));

  if (goal && goal.currentPoints >= goal.threshold && !goal.purchasedAt && !goal._celebrated) {
    goal._celebrated = true;
    saveState();
    setTimeout(() => showUnlock(goal), 400);
  }
  render();
}

function showUnlock(goal) {
  let ov = document.querySelector('.unlock-overlay');
  if (!ov) {
    ov = document.createElement('div');
    ov.className = 'unlock-overlay';
    document.body.appendChild(ov);
  }
  ov.innerHTML = `
    <div class="unlock-title">${t('unlock.title')}</div>
    <div class="unlock-sub">${t('unlock.sub', { name: escapeHtml(goal.name) })}</div>
    <button type="button" class="unlock-btn" id="unlockClose">${t('unlock.btn')}</button>
  `;
  requestAnimationFrame(() => ov.classList.add('show'));
  hapticNotif('success');
  $('unlockClose').addEventListener('click', () => {
    ov.classList.remove('show');
    haptic('medium');
  });
}

// ───────── sheets ─────────

function openSheet(html) {
  closeSheet();
  const ov = document.createElement('div');
  ov.className = 'sheet-overlay';
  ov.innerHTML = `<div class="sheet">${html}</div>`;
  document.body.appendChild(ov);
  document.body.classList.add('sheet-open');
  requestAnimationFrame(() => ov.classList.add('visible'));
  ov.addEventListener('click', e => {
    if (e.target === ov) closeSheet();
  });
}

function closeSheet() {
  const ov = document.querySelector('.sheet-overlay');
  if (!ov) return;
  ov.classList.remove('visible');
  document.body.classList.remove('sheet-open');
  setTimeout(() => ov.remove(), 220);
}

function openAddGoal() {
  const domains = ['clothing', 'rest', 'comfort', 'health', 'pleasure', 'other'];
  openSheet(`
    <div class="sheet-grabber"></div>
    <div class="sheet-title-row">
      <h3 class="sheet-title">${t('add_goal.title')}</h3>
      <button type="button" class="sheet-close" id="sheetClose">✕</button>
    </div>
    <label class="field">
      <span class="field-label">${t('add_goal.name')}</span>
      <input type="text" id="ag-name" class="field-input" placeholder="${t('add_goal.name_placeholder')}" autocomplete="off">
    </label>
    <label class="field">
      <span class="field-label">${t('add_goal.price')}</span>
      <input type="number" id="ag-price" class="field-input" placeholder="${t('add_goal.price_placeholder')}" inputmode="numeric">
    </label>
    <div class="field">
      <span class="field-label">${t('add_goal.type')}</span>
      <div class="seg">
        <button type="button" class="seg-btn active" data-type="want">${t('add_goal.type_want')}</button>
        <button type="button" class="seg-btn" data-type="need">${t('add_goal.type_need')}</button>
      </div>
    </div>
    <div class="field">
      <span class="field-label">${t('add_goal.domain')}</span>
      <div class="chips">
        ${domains.map((d, i) => `<button type="button" class="chip ${i === 2 ? 'active' : ''}" data-domain="${d}">${t('domain.' + d)}</button>`).join('')}
      </div>
    </div>
    <div class="sheet-actions">
      <button type="button" class="btn-primary" id="ag-save">${t('add_goal.save')}</button>
    </div>
  `);

  let pickedType = 'want';
  let pickedDomain = 'comfort';

  const ov = document.querySelector('.sheet-overlay');
  ov.querySelector('#sheetClose').addEventListener('click', closeSheet);
  ov.querySelectorAll('.seg-btn').forEach(b => b.addEventListener('click', () => {
    pickedType = b.dataset.type;
    ov.querySelectorAll('.seg-btn').forEach(x => x.classList.toggle('active', x === b));
  }));
  ov.querySelectorAll('.chip').forEach(b => b.addEventListener('click', () => {
    pickedDomain = b.dataset.domain;
    ov.querySelectorAll('.chip').forEach(x => x.classList.toggle('active', x === b));
  }));
  ov.querySelector('#ag-save').addEventListener('click', () => {
    const name = ov.querySelector('#ag-name').value.trim();
    const price = Number(ov.querySelector('#ag-price').value) || 0;
    if (!name) { ov.querySelector('#ag-name').focus(); return; }
    const newGoal = {
      id: genId(),
      name,
      price,
      type: pickedType,
      threshold: thresholdFor(pickedType, price),
      domain: pickedDomain,
      currentPoints: 0,
      createdAt: Date.now(),
      purchasedAt: null
    };
    state.goals.push(newGoal);
    // Если активной цели нет — новая автоматически становится текущей
    if (!activeGoal()) state.currentGoalId = newGoal.id;
    saveState();
    closeSheet();
    showToast(t('toast.goal_added'));
    haptic('medium');
    render();
  });

  setTimeout(() => ov.querySelector('#ag-name').focus(), 100);
}

function openAddTask() {
  const goal = activeGoal();
  if (!goal) { openAddGoal(); return; }

  openSheet(`
    <div class="sheet-grabber"></div>
    <div class="sheet-title-row">
      <h3 class="sheet-title">${t('add_task.title')}</h3>
      <button type="button" class="sheet-close" id="sheetClose">✕</button>
    </div>
    <div class="sheet-hint">${escapeHtml(goal.name)} · ${goal.currentPoints}/${goal.threshold}</div>
    <label class="field">
      <span class="field-label">${t('add_task.name')}</span>
      <input type="text" id="at-name" class="field-input" placeholder="${t('add_task.name_placeholder')}" autocomplete="off">
    </label>
    <div class="field">
      <span class="field-label">${t('add_task.points')}</span>
      <div class="seg seg-3">
        <button type="button" class="seg-btn" data-pts="10">${t('add_task.points_small')}</button>
        <button type="button" class="seg-btn active" data-pts="25">${t('add_task.points_mid')}</button>
        <button type="button" class="seg-btn" data-pts="50">${t('add_task.points_big')}</button>
      </div>
    </div>
    <div class="sheet-actions">
      <button type="button" class="btn-primary" id="at-save">${t('add_task.save')}</button>
    </div>
  `);

  let pickedPts = 25;
  const ov = document.querySelector('.sheet-overlay');
  ov.querySelector('#sheetClose').addEventListener('click', closeSheet);
  ov.querySelectorAll('.seg-btn').forEach(b => b.addEventListener('click', () => {
    pickedPts = Number(b.dataset.pts);
    ov.querySelectorAll('.seg-btn').forEach(x => x.classList.toggle('active', x === b));
  }));
  ov.querySelector('#at-save').addEventListener('click', () => {
    const title = ov.querySelector('#at-name').value.trim();
    if (!title) { ov.querySelector('#at-name').focus(); return; }
    state.tasks.push({
      id: genId(),
      goalId: goal.id,
      title,
      points: pickedPts,
      color: taskColorFor(pickedPts),
      createdAt: Date.now(),
      completedAt: null
    });
    saveState();
    closeSheet();
    showToast(t('toast.task_added'));
    haptic('medium');
    render();
  });

  setTimeout(() => ov.querySelector('#at-name').focus(), 100);
}

function openReflection() {
  const goal = activeGoal();
  if (!goal) return;

  openSheet(`
    <div class="sheet-grabber"></div>
    <div class="sheet-title-row">
      <h3 class="sheet-title">${t('reflect.title')}</h3>
      <button type="button" class="sheet-close" id="sheetClose">✕</button>
    </div>
    <div class="sheet-hint">${escapeHtml(goal.name)}</div>
    <div class="sheet-sub">${t('reflect.sub')}</div>
    <div class="feel-row">
      <button type="button" class="feel-btn" data-feel="good"><span>😌</span><span class="feel-label">${t('reflect.good')}</span></button>
      <button type="button" class="feel-btn" data-feel="okay"><span>😐</span><span class="feel-label">${t('reflect.okay')}</span></button>
      <button type="button" class="feel-btn" data-feel="guilty"><span>😞</span><span class="feel-label">${t('reflect.guilty')}</span></button>
    </div>
    <textarea id="rf-note" class="field-input area" rows="3" placeholder="${t('reflect.note_placeholder')}"></textarea>
    <div class="sheet-actions">
      <button type="button" class="btn-primary" id="rf-save" disabled>${t('reflect.save')}</button>
    </div>
  `);

  let feeling = null;
  const ov = document.querySelector('.sheet-overlay');
  ov.querySelector('#sheetClose').addEventListener('click', closeSheet);
  ov.querySelectorAll('.feel-btn').forEach(b => b.addEventListener('click', () => {
    feeling = b.dataset.feel;
    ov.querySelectorAll('.feel-btn').forEach(x => x.classList.toggle('active', x === b));
    ov.querySelector('#rf-save').disabled = false;
    haptic('light');
  }));
  ov.querySelector('#rf-save').addEventListener('click', () => {
    if (!feeling) return;
    const note = ov.querySelector('#rf-note').value.trim();
    goal.purchasedAt = Date.now();
    goal.reflection = { feeling, note: note || null };
    state.freedomLog.push({
      goalId: goal.id,
      name: goal.name,
      price: goal.price,
      domain: goal.domain,
      feeling,
      note: note || null,
      purchasedAt: goal.purchasedAt
    });
    // Эта цель куплена — выбираем следующую активную как текущую
    if (state.currentGoalId === goal.id) {
      state.currentGoalId = state.goals.find(g => !g.purchasedAt)?.id || null;
    }
    saveState();
    closeSheet();
    showToast(t('toast.bought'));
    hapticNotif('success');
    render();
  });
}

function openGoals() {
  const sorted = [...state.goals].sort((a, b) => {
    const ap = a.purchasedAt ? 1 : 0;
    const bp = b.purchasedAt ? 1 : 0;
    if (ap !== bp) return ap - bp; // активные сверху
    if (!ap) return (b.createdAt || 0) - (a.createdAt || 0); // среди активных: новее сверху
    return (b.purchasedAt || 0) - (a.purchasedAt || 0); // среди купленных: новее сверху
  });
  const cur = activeGoal();

  openSheet(`
    <div class="sheet-grabber"></div>
    <div class="sheet-title-row">
      <h3 class="sheet-title">${t('goals.title')}</h3>
      <button type="button" class="sheet-close" id="sheetClose">✕</button>
    </div>
    <div class="sheet-sub">${escapeHtml(t('goals.subtitle'))}</div>
    <div class="goals-list">
      ${sorted.map(g => goalRowHtml(g, cur?.id === g.id)).join('')}
    </div>
    <div class="sheet-actions">
      <button type="button" class="btn-primary" id="goals-add">${t('empty.no_goal.cta')}</button>
    </div>
  `);

  const ov = document.querySelector('.sheet-overlay');
  ov.querySelector('#sheetClose').addEventListener('click', closeSheet);
  ov.querySelector('#goals-add').addEventListener('click', () => {
    closeSheet();
    setTimeout(openAddGoal, 250);
  });
  ov.querySelectorAll('[data-set-current]').forEach(b => b.addEventListener('click', () => {
    state.currentGoalId = b.dataset.setCurrent;
    saveState();
    showToast(t('toast.current_set'));
    haptic('medium');
    closeSheet();
    render();
  }));
  ov.querySelectorAll('[data-delete-goal]').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.deleteGoal;
    if (!window.confirm(t('confirm.delete_goal'))) return;
    state.goals = state.goals.filter(g => g.id !== id);
    state.tasks = state.tasks.filter(task => task.goalId !== id);
    if (state.currentGoalId === id) {
      state.currentGoalId = state.goals.find(g => !g.purchasedAt)?.id || null;
    }
    saveState();
    showToast(t('toast.goal_deleted'));
    hapticNotif('warning');
    closeSheet();
    setTimeout(() => {
      if (state.goals.length) openGoals();
      render();
    }, 220);
  }));
}

function goalRowHtml(g, isCurrent) {
  const purchased = !!g.purchasedAt;
  const statusLine = purchased
    ? `${t('goals.purchased_badge')} · ${formatDate(g.purchasedAt)}`
    : `${g.currentPoints}/${g.threshold} · ${t('add_goal.type_' + (g.type || 'want'))}`;
  return `
    <div class="goal-row ${isCurrent && !purchased ? 'current' : ''} ${purchased ? 'done' : ''}">
      <div class="goal-row-body">
        <div class="goal-row-name">${escapeHtml(g.name)}</div>
        <div class="goal-row-meta">${statusLine}${g.price ? ' · ' + g.price : ''}</div>
      </div>
      <div class="goal-row-actions">
        ${isCurrent && !purchased ? `<span class="goal-row-badge">${t('goals.current_badge')}</span>` : ''}
        ${!isCurrent && !purchased ? `<button type="button" class="goal-row-make" data-set-current="${g.id}">${t('goals.make_current')}</button>` : ''}
        <button type="button" class="goal-row-delete" data-delete-goal="${g.id}" aria-label="${t('common.delete')}">✕</button>
      </div>
    </div>
  `;
}

// ───────── navigation ─────────

function switchScreen(name) {
  if (currentScreen === name) return;
  currentScreen = name;
  for (const b of document.querySelectorAll('.nav-item')) {
    b.classList.toggle('active', b.dataset.screen === name);
  }
  render();
  haptic('light');
}

function syncNavLabels() {
  const nav = document.querySelectorAll('.nav-item');
  if (nav.length >= 3) {
    nav[0].querySelector('span').textContent = t('nav.home');
    nav[1].querySelector('span').textContent = t('nav.tasks');
    nav[2].querySelector('span').textContent = t('nav.reward');
  }
}

function render() {
  if (currentScreen === 'home') renderHome();
  else if (currentScreen === 'tasks') renderTasks();
  else if (currentScreen === 'reward') renderReward();
  syncNavLabels();
}

// ───────── bootstrap ─────────

for (const b of document.querySelectorAll('.nav-item')) {
  b.addEventListener('click', () => switchScreen(b.dataset.screen));
}

// Сразу рисуем UI с дефолтным пустым стейтом — чтобы экран не висел чёрным,
// пока ждём асинхронную загрузку из CloudStorage.
render();

(async () => {
  await loadState();
  render();
  await checkUnlock();
  render();
})();
