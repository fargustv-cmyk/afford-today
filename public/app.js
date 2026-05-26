// ───────── Telegram WebApp init ─────────

const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  // Принудительно тёмная тема для MVP — фирменный вид
  if (tg.setHeaderColor) tg.setHeaderColor('#000000');
  if (tg.setBackgroundColor) tg.setBackgroundColor('#000000');
}

const haptic = (k = 'light') => { try { tg?.HapticFeedback?.impactOccurred?.(k); } catch {} };
const hapticNotif = (k) => { try { tg?.HapticFeedback?.notificationOccurred?.(k); } catch {} };

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

// ───────── default state (для первого запуска) ─────────

const now = Date.now();
const defaultState = {
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
    { id: 't1', goalId: 'goal-1', title: 'Finish client proposal', category: 'Work', points: 25, color: 'orange', completedAt: null },
    { id: 't2', goalId: 'goal-1', title: '30 min workout', category: 'Health', points: 15, color: 'green', completedAt: null },
    { id: 't3', goalId: 'goal-1', title: 'Clean the kitchen', category: 'Home', points: 10, color: 'blue', completedAt: null }
  ],
  streak: { current: 5, longest: 8, lastCompletedDay: null },
  todayPoints: 47,
  freedomLog: [],
  unlocked: false
};

let state = structuredClone(defaultState);
let currentScreen = 'home';

async function loadState() {
  const raw = await storage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const saved = JSON.parse(raw);
    state = { ...defaultState, ...saved };
  } catch { /* keep default */ }
}

let saveTimer = null;
function saveState() {
  // Дебаунс: за одну порцию тапов не насрать в CloudStorage квоту
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
  if (h >= 5 && h < 12) return 'Good morning';
  if (h >= 12 && h < 18) return 'Good afternoon';
  if (h >= 18 && h < 23) return 'Good evening';
  return 'Late night';
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function showToast(msg) {
  let t = document.querySelector('.toast');
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => t.classList.remove('show'), 1800);
}

// ───────── screens ─────────

function renderHome() {
  const activeGoal = state.goals.find(g => !g.purchasedAt) || state.goals[0];
  const pendingTasks = state.tasks.filter(t => !t.completedAt && (!t.goalId || t.goalId === activeGoal?.id));

  if (!activeGoal) {
    app.innerHTML = `
      ${topbarHtml()}
      <div class="empty-state">
        <strong>Пока нет цели</strong>
        Добавь первое желание — носки, книгу, наушники. Что угодно, что ты себе пока не разрешил.
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
      <div class="overline">Current goal</div>
      <div class="goal-name">${escapeHtml(activeGoal.name)}</div>
      <div class="goal-points">
        <span class="goal-points-cur">${activeGoal.currentPoints}</span>
        <span class="goal-points-of">/${activeGoal.threshold}</span>
      </div>
      <div class="goal-bar"><div class="goal-bar-fill" style="width:${pct}%"></div></div>
      <div class="goal-meta">Level ${activeGoal.level} · ${remaining} points to go</div>
    </div>

    <div class="section-label">Today</div>
    <div class="stats">
      <div class="stat stat-blue">
        <div class="stat-num">${pendingTasks.length}</div>
        <div class="stat-label">Tasks</div>
      </div>
      <div class="stat stat-green">
        <div class="stat-num">${state.todayPoints}</div>
        <div class="stat-label">Points</div>
      </div>
      <div class="stat stat-red">
        <div class="stat-num">${state.streak.current}</div>
        <div class="stat-label">Streak</div>
      </div>
    </div>

    <div class="section-row">
      <div class="section-label">Up next</div>
      <button type="button" class="section-link" data-go="tasks">View all</button>
    </div>
    ${pendingTasks.length ? renderTaskList(pendingTasks.slice(0, 3)) : `
      <div class="empty-state">
        <strong>На сегодня всё</strong>
        Шкала ждёт. Добавь задачи, чтобы прокликать ещё очков.
      </div>
    `}
  `;
  bindCommon();
}

function renderTasks() {
  app.innerHTML = `
    ${topbarHtml('Tasks')}
    <div class="section-label">All tasks</div>
    ${state.tasks.length ? renderTaskList(state.tasks) : `
      <div class="empty-state">
        <strong>Задач пока нет</strong>
        Добавляй простые шаги к цели — от «помыть посуду» до «закрыть проект».
      </div>
    `}
  `;
  bindCommon();
}

function renderReward() {
  const domains = [
    { key: 'clothing', label: 'Одежда' },
    { key: 'rest', label: 'Отдых' },
    { key: 'comfort', label: 'Комфорт' },
    { key: 'health', label: 'Здоровье' },
    { key: 'pleasure', label: 'Удовольствие' },
    { key: 'other', label: 'Другое' }
  ];
  const counts = {};
  for (const d of domains) counts[d.key] = 0;
  for (const entry of state.freedomLog) counts[entry.domain || 'other'] = (counts[entry.domain || 'other'] || 0) + 1;

  app.innerHTML = `
    ${topbarHtml('Reward')}
    <div class="section-label">Счёт свободы</div>
    <div class="reward-grid">
      ${domains.map(d => `
        <div class="reward-tile">
          <div class="reward-tile-domain">${d.label}</div>
          <div class="reward-tile-count">${counts[d.key]}</div>
          <div class="reward-tile-cap">позволено</div>
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
        <h1 class="title-serif">${title || 'Dashboard'}</h1>
      </div>
      <button type="button" class="icon-btn" id="settingsBtn" aria-label="Настройки">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </button>
    </div>
  `;
}

function renderTaskList(tasks) {
  return `
    <div class="task-list">
      ${tasks.map(t => {
        const color = t.color || pickColor(t.points);
        return `
          <button type="button" class="task-row ${t.completedAt ? 'done' : ''}" data-task="${t.id}">
            <div class="task-badge t-${color}">${t.points}</div>
            <div class="task-body">
              <div class="task-title">${escapeHtml(t.title)}</div>
              <div class="task-meta">${escapeHtml(t.category || '')} · ${t.points} pts</div>
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
}

function completeTask(taskId) {
  const t = state.tasks.find(x => x.id === taskId);
  if (!t || t.completedAt) return;
  t.completedAt = Date.now();

  // Очки идут в текущую цель
  const goalId = t.goalId || state.goals.find(g => !g.purchasedAt)?.id;
  const goal = state.goals.find(g => g.id === goalId);
  if (goal) {
    goal.currentPoints = (goal.currentPoints || 0) + t.points;
    goal.level = Math.floor(goal.currentPoints / 100) + 1;
  }
  state.todayPoints += t.points;

  // Стрик
  const today = new Date().toISOString().slice(0, 10);
  if (state.streak.lastCompletedDay !== today) {
    state.streak.current = (state.streak.lastCompletedDay) ? state.streak.current + 1 : 1;
    state.streak.lastCompletedDay = today;
    state.streak.longest = Math.max(state.streak.longest || 0, state.streak.current);
  }

  saveState();
  hapticNotif('success');
  showToast(`+${t.points} points`);

  // Проверка разблокировки
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
    <div class="unlock-title">Можно!</div>
    <div class="unlock-sub">Ты заслужил <strong>${escapeHtml(goal.name)}</strong>. Открывай вкладку, оформляй покупку, возвращайся.</div>
    <button type="button" class="unlock-btn" id="unlockClose">Принять разрешение</button>
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

function render() {
  if (currentScreen === 'home') renderHome();
  else if (currentScreen === 'tasks') renderTasks();
  else if (currentScreen === 'reward') renderReward();
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
