import { useEffect, useState } from 'react';
import type { MeResponse, UserFreedom, Wish, Wishlist } from '@afford/shared';
import { ru } from '../i18n/ru';
import { WishCard } from '../components/WishCard';
import { SettingsSheet } from '../components/Settings';
import { PaywallSheet } from '../components/Paywall';
import { Sheet } from '../components/Sheet';
import { api } from '../api/client';
import { isPreview, previewApi } from '../lib/preview';
import { AddWishSheet } from './AddWish';

const a = () => (isPreview() ? previewApi : api);

interface HomeProps {
  me: MeResponse;
  onUpdateMe: (me: MeResponse) => void;
  onOpenWish: (id: string) => void;
  onOpenFreedom: () => void;
}

export function Home({ me, onUpdateMe, onOpenWish, onOpenFreedom }: HomeProps) {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [paywallReason, setPaywallReason] = useState<string | null>(null);
  const [freedom, setFreedom] = useState<UserFreedom | null>(null);
  const [newListOpen, setNewListOpen] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [creatingList, setCreatingList] = useState(false);

  const reloadWishes = (listId: string | null) => {
    setLoading(true);
    a()
      .listWishes(listId ?? undefined)
      .then(({ wishes }) => setWishes(wishes))
      .catch(() => setWishes([]))
      .finally(() => setLoading(false));
  };

  const reload = () => {
    a().listWishlists().then(({ wishlists: ls }) => {
      setWishlists(ls);
      const fallback = ls.find((l) => l.isDefault)?.id ?? ls[0]?.id ?? null;
      const next = activeListId && ls.some((l) => l.id === activeListId) ? activeListId : fallback;
      setActiveListId(next);
      reloadWishes(next);
    }).catch(() => {
      setWishlists([]);
      reloadWishes(null);
    });
    a().freedom().then(setFreedom).catch(() => setFreedom(null));
  };

  useEffect(reload, []);

  const switchList = (id: string) => {
    setActiveListId(id);
    reloadWishes(id);
  };

  const onTapNewList = () => {
    if (!me.unlocked) {
      setPaywallReason(ru.paywall_reason_list ?? 'несколько списков — часть Pro.');
      return;
    }
    setNewListOpen(true);
  };

  const submitNewList = async () => {
    const t = newListTitle.trim();
    if (!t || creatingList) return;
    setCreatingList(true);
    try {
      const { wishlist } = await a().createWishlist(t);
      setWishlists((prev) => [...prev, wishlist]);
      setActiveListId(wishlist.id);
      reloadWishes(wishlist.id);
      setNewListTitle('');
      setNewListOpen(false);
    } catch (err) {
      console.warn('createWishlist failed', err);
    } finally {
      setCreatingList(false);
    }
  };

  const empty = !loading && wishes.length === 0;

  return (
    <main className="shell shell-home">
      <header className="home-head">
        <div>
          <div className="overline">{ru.home_overline}</div>
          <h1 className="title-serif">{ru.home_title}</h1>
        </div>
        <div className="home-head-actions">
          <button
            type="button"
            className="icon-btn-soft"
            aria-label="настройки"
            onClick={() => setSettingsOpen(true)}
          >
            ⚙
          </button>
          {!empty && (
            <button className="add-btn" onClick={() => setAddOpen(true)}>
              {ru.home_add}
            </button>
          )}
        </div>
      </header>

      {wishlists.length > 0 && (wishlists.length > 1 || me.unlocked) && (
        <nav className="wishlist-tabs" aria-label="списки">
          <div className="wishlist-tabs-scroll">
            {wishlists.map((l) => (
              <button
                key={l.id}
                type="button"
                className={`wishlist-tab ${activeListId === l.id ? 'active' : ''}`}
                onClick={() => switchList(l.id)}
              >
                {l.title}
              </button>
            ))}
            <button
              type="button"
              className="wishlist-tab wishlist-tab-add"
              onClick={onTapNewList}
              aria-label="новый список"
            >
              + список
              {!me.unlocked && <span className="pro-pill">PRO</span>}
            </button>
          </div>
        </nav>
      )}

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
        (freedom && freedom.totalPermissions > 0) ? (
          <section className="empty-state">
            <div className="empty-mark" aria-hidden>✦</div>
            <h2 className="empty-title">{ru.home_done_title}</h2>
            <p className="empty-body">{ru.home_done_body}</p>
            <button className="cta-btn" onClick={() => setAddOpen(true)}>
              {ru.home_done_cta}
            </button>
          </section>
        ) : (
          <section className="empty-state">
            <div className="empty-mark" aria-hidden>✦</div>
            <h2 className="empty-title">{ru.home_empty_title}</h2>
            <p className="empty-body">{ru.home_empty_body}</p>
            <button className="cta-btn" onClick={() => setAddOpen(true)}>
              {ru.home_empty_cta}
            </button>
          </section>
        )
      ) : (
        <section className="wish-list">
          {wishes.map((w) => (
            <WishCard key={w.id} wish={w} onClick={() => onOpenWish(w.id)} />
          ))}
          <button type="button" className="wish-add-card" onClick={() => setAddOpen(true)}>
            <span className="wish-add-plus" aria-hidden>＋</span>
            <span className="wish-add-label">{ru.home_add_more}</span>
          </button>
        </section>
      )}

      <AddWishSheet
        open={addOpen}
        wishlistId={activeListId}
        onClose={() => setAddOpen(false)}
        onCreated={() => { setAddOpen(false); reload(); }}
      />

      <Sheet open={newListOpen} onClose={() => setNewListOpen(false)} title="новый список">
        <p className="muted">{ru.wishlist_new_hint ?? 'короткое имя, например «на отпуск».'}</p>
        <input
          className="field-input"
          type="text"
          value={newListTitle}
          onChange={(e) => setNewListTitle(e.target.value)}
          placeholder="на отпуск"
          autoFocus
        />
        <button
          type="button"
          className="btn-primary"
          onClick={submitNewList}
          disabled={!newListTitle.trim() || creatingList}
        >
          {creatingList ? '…' : 'создать'}
        </button>
      </Sheet>

      {settingsOpen && (
        <SettingsSheet
          me={me}
          onClose={() => setSettingsOpen(false)}
          onUpdate={onUpdateMe}
          onOpenPaywall={(reason) => { setSettingsOpen(false); setPaywallReason(reason); }}
        />
      )}

      <PaywallSheet
        open={paywallReason !== null}
        reason={paywallReason ?? undefined}
        onClose={() => setPaywallReason(null)}
      />
    </main>
  );
}
