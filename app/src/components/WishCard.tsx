import type { Wish } from '@afford/shared';
import { ru } from '../i18n/ru';

export function WishCard({ wish, onClick }: { wish: Wish; onClick?: () => void }) {
  const isEssential = wish.type === 'essential';
  const isUnlocked = wish.status === 'unlocked';
  const pct =
    wish.pointsRequired > 0
      ? Math.min(100, (wish.pointsEarned / wish.pointsRequired) * 100)
      : 100;

  return (
    <article
      className="wish-card"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="wish-thumb">
        {wish.imageUrl ? (
          <img src={wish.imageUrl} alt="" />
        ) : (
          <span className="wish-thumb-placeholder" aria-hidden>✦</span>
        )}
      </div>
      <div className="wish-body">
        <div className="wish-title">{wish.title}</div>
        {wish.price != null && (
          <div className="wish-price">{wish.price.toLocaleString('ru-RU')} {wish.currency}</div>
        )}
        {isEssential ? (
          <div className="wish-pill wish-pill-teal">{ru.wish_essential_badge}</div>
        ) : isUnlocked ? (
          <div className="wish-pill wish-pill-coral">{ru.wish_unlocked}</div>
        ) : (
          <>
            <div className="wish-bar">
              <div className="wish-bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="wish-progress">
              {ru.wish_progress
                .replace('{earned}', String(wish.pointsEarned))
                .replace('{required}', String(wish.pointsRequired))}
            </div>
          </>
        )}
      </div>
    </article>
  );
}
