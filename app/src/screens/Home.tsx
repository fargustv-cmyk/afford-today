import { useEffect, useState } from 'react';
import type { UserFreedom, Wish } from '@afford/shared';
import { ru } from '../i18n/ru';
import { WishCard } from '../components/WishCard';
import { api } from '../api/client';
import { isPreview, previewApi } from '../lib/preview';
import { AddWishSheet } from './AddWish';

const a = () => (isPreview() ? previewApi : api);

interface HomeProps {
  onOpenWish: (id: string) => void;
  onOpenFreedom: () => void;
}

export function Home({ onOpenWish, onOpenFreedom }: HomeProps) {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [freedom, setFreedom] = useState<UserFreedom | null>(null);

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
