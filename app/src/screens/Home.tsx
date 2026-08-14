import { useEffect, useState } from 'react';
import type { MeResponse, UserFreedom, Wish } from '@afford/shared';
import { ru } from '../i18n/ru';
import { WishCard } from '../components/WishCard';
import { api } from '../api/client';
import { isPreview, previewApi } from '../lib/preview';
import { AddWishSheet } from './AddWish';

const a = () => (isPreview() ? previewApi : api);

interface HomeProps {
  me: MeResponse;
  initialAddOpen?: boolean;
  onInitialAddOpened?: () => void;
  onUpdateMe: (me: MeResponse) => void;
  onOpenWish: (id: string) => void;
  onOpenFreedom: () => void;
}

function permissionWord(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'решение';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'решения';
  return 'решений';
}

export function Home({ initialAddOpen = false, onInitialAddOpened, onOpenWish, onOpenFreedom }: HomeProps) {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [defaultListId, setDefaultListId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [freedom, setFreedom] = useState<UserFreedom | null>(null);

  const reload = () => {
    setLoading(true);
    a().listWishlists()
      .then(({ wishlists }) => {
        const fallback = wishlists.find((l) => l.isDefault)?.id ?? wishlists[0]?.id ?? null;
        setDefaultListId(fallback);
        return a().listWishes(fallback ?? undefined);
      })
      .then(({ wishes }) => setWishes(wishes))
      .catch(() => setWishes([]))
      .finally(() => setLoading(false));
    a().freedom().then(setFreedom).catch(() => setFreedom(null));
  };

  useEffect(reload, []);
  useEffect(() => {
    if (!initialAddOpen) return;
    setAddOpen(true);
    onInitialAddOpened?.();
  }, [initialAddOpen, onInitialAddOpened]);

  const empty = !loading && wishes.length === 0;
  const completed = freedom?.totalPermissions ?? 0;

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

      <section className="home-principle">
        <span aria-hidden>✓</span>
        <p><strong>Здесь не нужно заслуживать.</strong> Мы только отделим реальные ограничения от привычного чувства вины.</p>
      </section>

      {completed > 0 && (
        <button type="button" className="freedom-strip" onClick={onOpenFreedom}>
          <div className="freedom-strip-body">
            <div className="freedom-strip-score">
              {completed} {permissionWord(completed)} в свою пользу
            </div>
            <div className="freedom-strip-meta">твои доказательства, что выбирать себя безопасно</div>
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
          {wishes.map((wish) => (
            <WishCard key={wish.id} wish={wish} onClick={() => onOpenWish(wish.id)} />
          ))}
          <button type="button" className="wish-add-card" onClick={() => setAddOpen(true)}>
            <span className="wish-add-plus" aria-hidden>＋</span>
            <span className="wish-add-label">{ru.home_add_more}</span>
          </button>
        </section>
      )}

      <AddWishSheet
        open={addOpen}
        wishlistId={defaultListId}
        onClose={() => setAddOpen(false)}
        onCreated={(id) => {
          setAddOpen(false);
          if (id) onOpenWish(id);
          else reload();
        }}
      />
    </main>
  );
}
