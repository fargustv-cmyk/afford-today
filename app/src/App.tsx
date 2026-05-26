import { useEffect, useState } from 'react';
import type { MeResponse } from '@afford/shared';
import { tg } from './telegram';
import { ru } from './i18n/ru';
import { api } from './api/client';
import { isPreview, mockMe } from './lib/preview';
import { Home } from './screens/Home';
import { WishScreen } from './screens/Wish';

type Screen = { kind: 'home' } | { kind: 'wish'; id: string };

type State =
  | { kind: 'loading' }
  | { kind: 'authed'; me: MeResponse }
  | { kind: 'no-telegram' }
  | { kind: 'unauthorized' };

export function App() {
  const [state, setState] = useState<State>({ kind: 'loading' });
  const [screen, setScreen] = useState<Screen>({ kind: 'home' });

  useEffect(() => {
    if (isPreview()) {
      setState({ kind: 'authed', me: mockMe });
      return;
    }
    if (!tg) {
      setState({ kind: 'no-telegram' });
      return;
    }
    tg.ready();
    tg.expand();

    api
      .me()
      .then((me) => setState({ kind: 'authed', me }))
      .catch((err: unknown) => {
        const e = err as { status?: number } | undefined;
        if (e?.status === 401) setState({ kind: 'unauthorized' });
        else setState({ kind: 'unauthorized' });
      });
  }, []);

  if (state.kind === 'authed') {
    if (screen.kind === 'wish') {
      return <WishScreen wishId={screen.id} onBack={() => setScreen({ kind: 'home' })} />;
    }
    return <Home onOpenWish={(id) => setScreen({ kind: 'wish', id })} />;
  }

  return (
    <main className="shell">
      <Seal />
      <h1 className="title-serif">afford.today</h1>
      <p className="sub">{ru.scaffold_subtitle}</p>

      <section className="status-card">
        {state.kind === 'loading' && <p className="status">{ru.scaffold_loading}</p>}
        {state.kind === 'no-telegram' && <p className="status">{ru.scaffold_no_telegram}</p>}
        {state.kind === 'unauthorized' && <p className="status">{ru.scaffold_unauthorized}</p>}
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
