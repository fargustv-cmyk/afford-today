import { useEffect, useState } from 'react';
import type { MeResponse, ThemeId } from '@afford/shared';

function applyTheme(theme: ThemeId) {
  if (theme === 'default') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', theme);
}
export { applyTheme };
import { tg } from './telegram';
import { ru } from './i18n/ru';
import { api } from './api/client';
import { isPreview, mockMe, previewApi } from './lib/preview';
import { Home } from './screens/Home';
import { WishScreen } from './screens/Wish';
import { FreedomScreen } from './screens/Freedom';
import { Onboarding } from './screens/Onboarding';
import { Landing } from './screens/Landing';

type Screen = { kind: 'home' } | { kind: 'wish'; id: string } | { kind: 'freedom' };

const ONBOARDED_KEY = 'afford:onboarded:v2';
const hasOnboarded = (): boolean => {
  try { return localStorage.getItem(ONBOARDED_KEY) === '1'; } catch { return false; }
};
const markOnboarded = () => {
  try { localStorage.setItem(ONBOARDED_KEY, '1'); } catch { /* private mode etc — fine */ }
};

type State =
  | { kind: 'loading' }
  | { kind: 'authed'; me: MeResponse }
  | { kind: 'unauthorized' };

export function App() {
  const [state, setState] = useState<State>({ kind: 'loading' });
  const [screen, setScreen] = useState<Screen>({ kind: 'home' });
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean>(!hasOnboarded());
  const [startAdding, setStartAdding] = useState(false);

  useEffect(() => {
    if (isPreview()) {
      setState({ kind: 'authed', me: mockMe });
      applyTheme(mockMe.user.settings?.theme ?? 'default');
      return;
    }
    // telegram-web-app.js creates window.Telegram even in a regular browser.
    // initData is the reliable signal that the page is actually running as a
    // Mini App. Outside Telegram we deliberately render a public landing page.
    if (!tg?.initData) {
      return;
    }
    tg.ready();
    tg.expand();

    api
      .me()
      .then((me) => {
        applyTheme(me.user.settings?.theme ?? 'default');
        setState({ kind: 'authed', me });
        setNeedsOnboarding(me.user.settings?.onboardingComplete !== true && !hasOnboarded());
      })
      .catch((err: unknown) => {
        const e = err as { status?: number } | undefined;
        if (e?.status === 401) setState({ kind: 'unauthorized' });
        else setState({ kind: 'unauthorized' });
      });
  }, []);

  if (!isPreview() && !tg?.initData) return <Landing />;

  if (state.kind === 'authed') {
    if (needsOnboarding) {
      return (
        <Onboarding
          onDone={async () => {
            markOnboarded();
            setStartAdding(true);
            setNeedsOnboarding(false);
            try {
              const me = await (isPreview() ? previewApi : api).updateSettings({ onboardingComplete: true });
              setState({ kind: 'authed', me });
            } catch {
              // Local marker still prevents a broken network from trapping the
              // user in onboarding. The server syncs on a later settings write.
            }
          }}
        />
      );
    }
    if (screen.kind === 'wish') {
      return (
        <WishScreen
          me={state.me}
          wishId={screen.id}
          onBack={() => setScreen({ kind: 'home' })}
        />
      );
    }
    if (screen.kind === 'freedom') {
      return <FreedomScreen me={state.me} onBack={() => setScreen({ kind: 'home' })} />;
    }
    return (
      <Home
        me={state.me}
        initialAddOpen={startAdding}
        onInitialAddOpened={() => setStartAdding(false)}
        onUpdateMe={(me) => setState({ kind: 'authed', me })}
        onOpenWish={(id) => setScreen({ kind: 'wish', id })}
        onOpenFreedom={() => setScreen({ kind: 'freedom' })}
      />
    );
  }

  return (
    <main className="shell">
      <Seal />
      <h1 className="title-serif">afford.today</h1>
      <p className="sub">{ru.scaffold_subtitle}</p>

      <section className="status-card">
        {state.kind === 'loading' && <p className="status">{ru.scaffold_loading}</p>}
        {state.kind === 'unauthorized' && (
          <>
            <p className="status">{ru.scaffold_unauthorized}</p>
            <a className="landing-cta landing-cta-compact" href="https://t.me/afford_today_bot?start=retry">
              открыть через бота
            </a>
          </>
        )}
      </section>
    </main>
  );
}

function Seal() {
  return (
    <svg className="seal" viewBox="0 0 100 100" aria-hidden>
      <defs>
        <path id="ring" d="M50,12 A38,38 0 1,1 49.99,12" />
      </defs>
      <g className="seal-ring">
        <text
          fontFamily="Unbounded, sans-serif"
          fontSize="7.2"
          fontWeight="700"
          fill="#7A6450"
          letterSpacing="1.2"
        >
          <textPath href="#ring" startOffset="0">
            AFFORD.TODAY ✦ РАЗРЕШЕНО ✦ AFFORD.TODAY ✦ РАЗРЕШЕНО ✦
          </textPath>
        </text>
      </g>
      <circle cx="50" cy="50" r="22" fill="#E0533A" />
      <path
        d="M40 50 l6.5 6.5 L62 41"
        fill="none"
        stroke="#fff"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
