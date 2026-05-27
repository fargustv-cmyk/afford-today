import { useEffect, useState } from 'react';
import type { InterpretationMode, MeResponse, UserFreedom, Wish } from '@afford/shared';
import { ru } from '../i18n/ru';
import { WishCard } from '../components/WishCard';
import { api } from '../api/client';
import { isPreview, previewApi } from '../lib/preview';
import { AddWishSheet } from './AddWish';

const a = () => (isPreview() ? previewApi : api);

interface HomeProps {
  me: MeResponse;
  onMeUpdate: (next: MeResponse) => void;
  onOpenWish: (id: string) => void;
  onOpenFreedom: () => void;
}

const INTERP_OPTIONS: { key: InterpretationMode; label: string }[] = [
  { key: 'permission', label: ru.settings_interp_permission },
  { key: 'effort',     label: ru.settings_interp_effort     },
  { key: 'both',       label: ru.settings_interp_both       }
];

export function Home({ me, onMeUpdate, onOpenWish, onOpenFreedom }: HomeProps) {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [freedom, setFreedom] = useState<UserFreedom | null>(null);
  const [savingInterp, setSavingInterp] = useState<InterpretationMode | null>(null);

  const currentInterp =
    (me.user.settings.interpretation as InterpretationMode | undefined) ?? 'both';

  const pickInterp = async (key: InterpretationMode) => {
    if (key === currentInterp || savingInterp) return;
    setSavingInterp(key);
    try {
      const next = await a().updateSettings({ interpretation: key });
      onMeUpdate(next);
    } finally {
      setSavingInterp(null);
    }
  };

  const reload = () => {
    setLoading(true);
    a()
      .listWishes()
      .then(({ wishes }) => setWishes(wishes))
      .catch(() => setWishes([]))
      .finally(() => setLoading(false));
    a().freedom().then(setFreedom).catch(() => setFreedom(null));
  };

  useEffect(reload, []);

  const empty = !loading && wishes.length === 0;

  return (
    <main className="shell shell-home">
      <header className="home-head">
        <div>
          <div className="overline">{ru.home_overline}</div>
          <h1 className="title-serif">{ru.home_title}</h1>
        </div>
        {!empty && (
          <button className="add-btn" onClick={() => setAddOpen(true)}>
            {ru.home_add}
          </button>
        )}
      </header>

      <div className="interp-strip">
        <div className="interp-strip-label">{ru.settings_interpretation_label}</div>
        <div className="interp-chips">
          {INTERP_OPTIONS.map((o) => (
            <button
              key={o.key}
              type="button"
              className={`interp-chip ${currentInterp === o.key ? 'active' : ''}`}
              onClick={() => pickInterp(o.key)}
              disabled={savingInterp !== null}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {freedom && freedom.totalPermissions > 0 && (
        <button type="button" className="freedom-strip" onClick={onOpenFreedom}>
          <div className="freedom-strip-body">
            <div className="freedom-strip-score">
              {ru.home_freedom_link_score.replace(
                '{amount}',
                Math.round(freedom.freedomScore).toLocaleString('ru-RU')
              )}
            </div>
            <div className="freedom-strip-meta">
              {ru.home_freedom_link_meta
                .replace('{count}', String(freedom.totalPermissions))
                .replace('{below}', String(freedom.selfPermissions))}
            </div>
          </div>
          <span className="freedom-strip-chev" aria-hidden>→</span>
        </button>
      )}

      {empty ? (
        <section className="empty-state">
          <div className="empty-mark" aria-hidden>✦</div>
          <h2 className="empty-title">{ru.home_empty_title}</h2>
          <p className="empty-body">{ru.home_empty_body}</p>
          <button className="cta-btn" onClick={() => setAddOpen(true)}>
            {ru.home_empty_cta}
          </button>
        </section>
      ) : (
        <section className="wish-list">
          {wishes.map((w) => (
            <WishCard key={w.id} wish={w} onClick={() => onOpenWish(w.id)} />
          ))}
        </section>
      )}

      <AddWishSheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={() => { setAddOpen(false); reload(); }}
      />

    </main>
  );
}
