import type { Wish } from '@afford/shared';
import { ru } from '../i18n/ru';

export function WishCard({ wish, onClick }: { wish: Wish; onClick?: () => void }) {
  const isUnlocked = wish.status === 'unlocked';

  return (
    <article
      className="wish-card"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(event) => {
        if (onClick && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          onClick();
        }
      }}
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
        {isUnlocked ? (
          <div className="wish-pill wish-pill-coral">{ru.wish_unlocked}</div>
        ) : wish.postponedAt ? (
          <div className="wish-pill wish-pill-neutral">отложено — можно вернуться</div>
        ) : (
          <div className="wish-pill wish-pill-neutral">решение впереди</div>
        )}
      </div>
    </article>
  );
}
