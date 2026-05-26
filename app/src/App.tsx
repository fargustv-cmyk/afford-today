import { useEffect, useState } from 'react';
import type { MeResponse } from '@afford/shared';
import { tg } from './telegram';
import { ru } from './i18n/ru';

type State =
  | { kind: 'loading' }
  | { kind: 'authed'; me: MeResponse }
  | { kind: 'no-telegram' }
  | { kind: 'unauthorized' };

export function App() {
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    // Browser preview mode (?preview=1): skip server auth so the design can
    // be inspected without going through Telegram. Server stays strict — this
    // is purely client-side.
    const previewMode = new URLSearchParams(window.location.search).get('preview') === '1';
    if (previewMode) {
      setState({
        kind: 'authed',
        me: {
          unlocked: false,
          user: {
            id: 0,
            createdAt: new Date().toISOString(),
            currency: 'RUB',
            locale: 'ru',
            subscriptionStatus: 'free',
            subscriptionUntil: null,
            giftedTokens: 0,
            selfPermissionFactor: 1,
            settings: {},
            firstName: 'preview'
          }
        }
      });
      return;
    }

    if (!tg) {
      setState({ kind: 'no-telegram' });
      return;
    }
    tg.ready();
    tg.expand();

    fetch('/api/me', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData: tg.initData ?? '' })
    })
      .then(async (r) => {
        if (r.status === 401) {
          setState({ kind: 'unauthorized' });
          return;
        }
        const data = (await r.json()) as MeResponse;
        setState({ kind: 'authed', me: data });
      })
      .catch(() => setState({ kind: 'unauthorized' }));
  }, []);

  return (
    <main className="shell">
      <Seal />
      <h1 className="title">afford.today</h1>
      <p className="sub">{ru.scaffold_subtitle}</p>

      <section className="status-card">
        {state.kind === 'loading' && <p className="status">{ru.scaffold_loading}</p>}
        {state.kind === 'no-telegram' && <p className="status">{ru.scaffold_no_telegram}</p>}
        {state.kind === 'unauthorized' && <p className="status">{ru.scaffold_unauthorized}</p>}
        {state.kind === 'authed' && (
          <>
            <p className="status">
              {ru.scaffold_greet.replace('{name}', state.me.user.firstName ?? 'друг')}
            </p>
            <p className="muted">
              id · {state.me.user.id} · locale {state.me.user.locale} · {state.me.user.currency}
            </p>
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
