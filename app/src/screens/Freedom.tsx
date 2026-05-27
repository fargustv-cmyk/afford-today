// Карта / «список да» — SPEC §8.
// 6 region tiles (clothes, leisure, comfort, health, joy, food) with states
// fogged → opened → thriving driven by permission_events counts.
// Freedom score is framed as "вернул себе на X", never "потратил".

import { useEffect, useState } from 'react';
import type { LifeDomain, UserFreedom } from '@afford/shared';
import { ru } from '../i18n/ru';
import { api } from '../api/client';
import { isPreview, previewApi } from '../lib/preview';

const a = () => (isPreview() ? previewApi : api);

interface DomainMeta {
  key: LifeDomain;
  label: string;
  emoji: string;
}

const DOMAINS: DomainMeta[] = [
  { key: 'clothes',  label: 'одежда',       emoji: '👕' },
  { key: 'leisure',  label: 'отдых',        emoji: '🌿' },
  { key: 'comfort',  label: 'комфорт',      emoji: '🛋' },
  { key: 'health',   label: 'здоровье',     emoji: '💚' },
  { key: 'joy',      label: 'радость',      emoji: '✨' },
  { key: 'food',     label: 'еда',          emoji: '🍽' }
];

type DomainState = 'fogged' | 'opened' | 'thriving';
function domainState(count: number): DomainState {
  if (count === 0) return 'fogged';
  if (count >= 5) return 'thriving';
  return 'opened';
}

function pluralRu(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return ru.freedom_count_singular.replace('{n}', String(n));
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14))
    return ru.freedom_count_few.replace('{n}', String(n));
  return ru.freedom_count_many.replace('{n}', String(n));
}

interface Props {
  onBack: () => void;
}

export function FreedomScreen({ onBack }: Props) {
  const [data, setData] = useState<UserFreedom | null>(null);

  useEffect(() => {
    a().freedom().then(setData).catch(() => setData(null));
  }, []);

  if (!data) {
    return (
      <main className="shell shell-home">
        <button className="back-btn" onClick={onBack}>{ru.freedom_back}</button>
        <p className="muted">…</p>
      </main>
    );
  }

  const empty = data.totalPermissions === 0;
  const scoreText = Math.round(data.freedomScore).toLocaleString('ru-RU');

  return (
    <main className="shell shell-home">
      <button className="back-btn" onClick={onBack}>{ru.freedom_back}</button>

      <header className="freedom-head">
        <h1 className="title-serif">{ru.freedom_title}</h1>
        <div className="freedom-score-label">{ru.freedom_score_label}</div>
        <div className="freedom-score">{empty ? '—' : scoreText}</div>
        <div className="freedom-meta">
          {empty
            ? ru.freedom_meta_empty
            : <>
                {ru.freedom_meta_count.replace('{count}', String(data.totalPermissions))}
                {data.selfPermissions > 0 && (
                  <> · <strong>{ru.freedom_meta_below.replace('{n}', String(data.selfPermissions))}</strong></>
                )}
              </>
          }
        </div>
      </header>

      {empty && (
        <section className="empty-state">
          <div className="empty-mark" aria-hidden>✦</div>
          <h2 className="empty-title">{ru.freedom_empty_title}</h2>
          <p className="empty-body">{ru.freedom_empty_body}</p>
        </section>
      )}

      <section className="freedom-grid">
        {DOMAINS.map((d) => {
          const agg = data.byDomain[d.key];
          const state = domainState(agg.count);
          return (
            <article key={d.key} className={`freedom-tile state-${state}`}>
              <div className="freedom-tile-emoji" aria-hidden>{d.emoji}</div>
              <div className="freedom-tile-name">{d.label}</div>
              {state === 'fogged' ? (
                <div className="freedom-tile-meta freedom-tile-meta-muted">—</div>
              ) : (
                <div className="freedom-tile-meta">{pluralRu(agg.count)}</div>
              )}
              {agg.count === 1 && (
                <div className="freedom-tile-badge">{ru.freedom_first_badge}</div>
              )}
              {state === 'thriving' && (
                <div className="freedom-tile-badge thriving">{ru.freedom_thriving_badge}</div>
              )}
            </article>
          );
        })}
      </section>
    </main>
  );
}
