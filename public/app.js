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
    'screen.dashboard': 'Дашборд',
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
    'goal.level': 'Уровень {level} · ещё {remaining} оч.',
    'stat.tasks': 'Задачи',
    'stat.points': 'Очки',
    'stat.streak': 'Стрик',
    'empty.no_goal.title': 'Пока нет цели',
    'empty.no_goal.body': 'Добавь первое желание — носки, книгу, наушники. Что угодно, что ты себе пока не разрешил.',
    'empty.done_today.title': 'На сегодня всё',
    'empty.done_today.body': 'Шкала ждёт. Добавь задач, чтобы прокликать ещё очки.',
    'empty.no_tasks.title': 'Задач пока нет',
    'empty.no_tasks.body': 'Добавляй простые шаги к цели — от «помыть посуду» до «закрыть проект».',
    'reward.title': 'Счёт свободы',
    'reward.allowed': 'позволено',
    'domain.clothing': 'Одежда',
    'domain.rest': 'Отдых',
    'domain.comfort': 'Комфорт',
    'domain.health': 'Здоровье',
    'domain.pleasure': 'Удовольствие',
    'domain.other': 'Другое',
    'toast.points': '+{n} очков',
    'unlock.title': 'Можно!',
    'unlock.sub': 'Ты заслужил {name}. Открывай магазин, оформляй покупку, возвращайся.',
    'unlock.btn': 'Принять разрешение',
    'task.pts': 'оч',
    'task.cat.work': 'Работа',
    'task.cat.health': 'Здоровье',
    'task.cat.home': 'Дом',
    'sample.task.proposal': 'Закончить предложение клиенту',
    'sample.task.workout': '30 мин тренировки',
    'sample.task.kitchen': 'Убрать кухню',
    'settings.title': 'Настройки',
    'lang.toggle': 'EN'
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
    'goal.level': 'Level {level} · {remaining} points to go',
    'stat.tasks': 'Tasks',
    'stat.points': 'Points',
    'stat.streak': 'Streak',
    'empty.no_goal.title': 'No goal yet',
    'empty.no_goal.body': "Add your first wish — socks, a book, headphones. Anything you've been holding back from.",
    'empty.done_today.title': "That's it for today",
    'empty.done_today.body': 'The bar is waiting. Add tasks to earn more points.',
    'empty.no_tasks.title': 'No tasks yet',
    'empty.no_tasks.body': 'Add simple steps toward your goal — from "do the dishes" to "ship the project".',
    'reward.title': 'Freedom score',
    'reward.allowed': 'allowed',
    'domain.clothing': 'Clothing',
    'domain.rest': 'Rest',
    'domain.comfort': 'Comfort',
    'domain.health': 'Health',
    'domain.pleasure': 'Pleasure',
    'domain.other': 'Other',
    'toast.points': '+{n} points',
    'unlock.title': 'You can!',
    'unlock.sub': 'You earned {name}. Go to the shop, buy it, come back.',
    'unlock.btn': 'Accept permission',
    'task.pts': 'pts',
    'task.cat.work': 'Work',
    'task.cat.health': 'Health',
    'task.cat.home': 'Home',
    'sample.task.proposal': 'Finish client proposal',
    'sample.task.workout': '30 min workout',
    'sample.task.kitchen': 'Clean the kitchen',
    'settings.title': 'Settings',
    'lang.toggle': 'RU'
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

// ───────── storage: Telegram CloudStorage с fallback на localStorage ─────────

const cs = tg?.CloudStorage;

const storage = {
  getItem(key) {
    if (cs?.getItem) {
      return new Promise(resolve => cs.getItem(key, (err, val) => resolve(err || val == null ? null : val)));
    }
    return Promise.resolve(localStorage.getItem(key));
  },
  setItem(key, value) {
    if (cs?.setItem) {
      return new Promise(resolve => cs.setItem(key, value, () => resolve()));
    }
    localStorage.setItem(key, value);
    return Promise.resolve();
  }
};

const STORAGE_KEY = 'afford:v1';

// ───────── default state ─────────

function makeDefaultState() {
  const now = Date.now();
  return {
    goals: [
      {
        id: 'goal-1',
        name: 'Sony WH-1000XM5',
        price: 25000,
        type: 'want',
        threshold: 500,
        domain: 'comfort',
        currentPoints: 340,
        level: 3,
        createdAt: now,
        purchasedAt: null
      }
    ],
    tasks: [
      { id: 't1', goalId: 'goal-1', titleKey: 'sample.task.proposal', categoryKey: 'task.cat.work', points: 25, color: 'orange', completedAt: null },
      { id: 't2', goalId: 'goal-1', titleKey: 'sample.task.workout', categoryKey: 'task.cat.health', points: 15, color: 'green', completedAt: null },
      { id: 't3', goalId: 'goal-1', titleKey: 'sample.task.kitchen', categoryKey: 'task.cat.home', points: 10, color: 'blue', completedAt: null }
    ],
    streak: { current: 5, longest: 8, lastCompletedDay: null },
    todayPoints: 47,
    freedomLog: [],
    unlocked: false
  };
}

let state = makeDefaultState();
let currentScreen = 'home';

async function loadState() {
  const raw = await storage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const saved = JSON.parse(raw);
    state = { ...makeDefaultState(), ...saved };
  } catch { /* keep default */ }
}

let saveTimer = null;
function saveState() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => storage.setItem(STORAGE_KEY, JSON.stringify(state)), 250);
}

// ───────── pro state ─────────

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

// Перевести title задачи: если есть titleKey — через t(), иначе literal title
function taskTitle(task) {
  if (task.titleKey) return t(task.titleKey);
  return task.title || '';
}
function taskCategory(task) {
  if (task.categoryKey) return t(task.categoryKey);
  return task.category || '';
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
  const activeGoal = state.goals.find(g => !g.purchasedAt) || state.goals[0];
  const pendingTasks = state.tasks.filter(t => !t.completedAt && (!t.goalId || t.goalId === activeGoal?.id));

  if (!activeGoal) {
    app.innerHTML = `
      ${topbarHtml()}
      <div class="empty-state">
        <strong>${t('empty.no_goal.title')}</strong>
        ${escapeHtml(t('empty.no_goal.body'))}
      </div>
    `;
    bindCommon();
    return;
  }

  const pct = Math.min(100, (activeGoal.currentPoints / activeGoal.threshold) * 100);
  const remaining = Math.max(0, activeGoal.threshold - activeGoal.currentPoints);

  app.innerHTML = `
    ${topbarHtml()}
    <div class="goal-card">
      <div class="overline">${t('section.current_goal')}</div>
      <div class="goal-name">${escapeHtml(activeGoal.name)}</div>
      <div class="goal-points">
        <span class="goal-points-cur">${activeGoal.currentPoints}</span>
        <span class="goal-points-of">/${activeGoal.threshold}</span>
      </div>
      <div class="goal-bar"><div class="goal-bar-fill" style="width:${pct}%"></div></div>
      <div class="goal-meta">${t('goal.level', { level: activeGoal.level, remaining })}</div>
    </div>

    <div class="section-label">${t('section.today')}</div>
    <div class="stats">
      <div class="stat stat-blue">
        <div class="stat-num">${pendingTasks.length}</div>
        <div class="stat-label">${t('stat.tasks')}</div>
      </div>
      <div class="stat stat-green">
        <div class="stat-num">${state.todayPoints}</div>
        <div class="stat-label">${t('stat.points')}</div>
      </div>
      <div class="stat stat-red">
        <div class="stat-num">${state.streak.current}</div>
        <div class="stat-label">${t('stat.streak')}</div>
      </div>
    </div>

    <div class="section-row">
      <div class="section-label">${t('section.up_next')}</div>
      <button type="button" class="section-link" data-go="tasks">${t('section.view_all')}</button>
    </div>
    ${pendingTasks.length ? renderTaskList(pendingTasks.slice(0, 3)) : `
      <div class="empty-state">
        <strong>${t('empty.done_today.title')}</strong>
        ${escapeHtml(t('empty.done_today.body'))}
      </div>
    `}
  `;
  bindCommon();
}

function renderTasks() {
  app.innerHTML = `
    ${topbarHtml(t('screen.tasks'))}
    <div class="section-label">${t('section.all_tasks')}</div>
    ${state.tasks.length ? renderTaskList(state.tasks) : `
      <div class="empty-state">
        <strong>${t('empty.no_tasks.title')}</strong>
        ${escapeHtml(t('empty.no_tasks.body'))}
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
  for (const entry of state.freedomLog) counts[entry.domain || 'other'] = (counts[entry.domain || 'other'] || 0) + 1;

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
  `;
  bindCommon();
}

// ───────── partials ─────────

function topbarHtml(title) {
  return `
    <div class="topbar">
      <div>
        <div class="overline">${title ? '' : greeting()}</div>
        <h1 class="title-serif">${escapeHtml(title || t('screen.dashboard'))}</h1>
      </div>
      <div class="topbar-actions">
        <button type="button" class="lang-btn" id="langBtn" aria-label="Language">${t('lang.toggle')}</button>
        <button type="button" class="icon-btn" id="settingsBtn" aria-label="${t('settings.title')}">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      </div>
    </div>
  `;
}

function renderTaskList(tasks) {
  return `
    <div class="task-list">
      ${tasks.map(task => {
        const color = task.color || pickColor(task.points);
        return `
          <button type="button" class="task-row ${task.completedAt ? 'done' : ''}" data-task="${task.id}">
            <div class="task-badge t-${color}">${task.points}</div>
            <div class="task-body">
              <div class="task-title">${escapeHtml(taskTitle(task))}</div>
              <div class="task-meta">${escapeHtml(taskCategory(task))} · ${task.points} ${t('task.pts')}</div>
            </div>
            <svg class="chev" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        `;
      }).join('')}
    </div>
  `;
}

function pickColor(points) {
  if (points >= 50) return 'red';
  if (points >= 25) return 'orange';
  if (points >= 15) return 'green';
  return 'blue';
}

// ───────── interactions ─────────

function bindCommon() {
  for (const btn of document.querySelectorAll('[data-task]')) {
    btn.addEventListener('click', () => completeTask(btn.dataset.task));
  }
  for (const btn of document.querySelectorAll('[data-go]')) {
    btn.addEventListener('click', () => switchScreen(btn.dataset.go));
  }
  const langBtn = $('langBtn');
  if (langBtn) langBtn.addEventListener('click', () => {
    setLang(lang === 'ru' ? 'en' : 'ru');
    haptic('light');
  });
}

function completeTask(taskId) {
  const task = state.tasks.find(x => x.id === taskId);
  if (!task || task.completedAt) return;
  task.completedAt = Date.now();

  const goalId = task.goalId || state.goals.find(g => !g.purchasedAt)?.id;
  const goal = state.goals.find(g => g.id === goalId);
  if (goal) {
    goal.currentPoints = (goal.currentPoints || 0) + task.points;
    goal.level = Math.floor(goal.currentPoints / 100) + 1;
  }
  state.todayPoints += task.points;

  const today = new Date().toISOString().slice(0, 10);
  if (state.streak.lastCompletedDay !== today) {
    state.streak.current = (state.streak.lastCompletedDay) ? state.streak.current + 1 : 1;
    state.streak.lastCompletedDay = today;
    state.streak.longest = Math.max(state.streak.longest || 0, state.streak.current);
  }

  saveState();
  hapticNotif('success');
  showToast(t('toast.points', { n: task.points }));

  if (goal && goal.currentPoints >= goal.threshold && !goal.purchasedAt) {
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

(async () => {
  await loadState();
  await checkUnlock();
  render();
})();
