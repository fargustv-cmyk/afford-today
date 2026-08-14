import { useEffect, useState } from 'react';
import type { EnrichedEvent, LifeDomain, MeResponse, UserFreedom } from '@afford/shared';
import { ru } from '../i18n/ru';
import { api } from '../api/client';
import { isPreview, previewApi } from '../lib/preview';
import { Sheet } from '../components/Sheet';

const a = () => (isPreview() ? previewApi : api);

interface DomainMeta {
  key: LifeDomain;
  label: string;
  emoji: string;
}

const DOMAINS: DomainMeta[] = [
  { key: 'clothes', label: 'одежда', emoji: '👕' },
  { key: 'leisure', label: 'впечатления', emoji: '🌿' },
  { key: 'comfort', label: 'комфорт', emoji: '🛋' },
  { key: 'health', label: 'здоровье', emoji: '💚' },
  { key: 'joy', label: 'радость', emoji: '✨' },
  { key: 'food', label: 'еда', emoji: '🍽' },
  { key: 'other', label: 'другое', emoji: '✦' }
];

function decisionsLabel(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} решение`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} решения`;
  return `${n} решений`;
}

function formatDate(ts: string): string {
  return new Date(ts).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}

interface Props {
  me: MeResponse;
  onBack: () => void;
}

export function FreedomScreen({ onBack }: Props) {
  const [data, setData] = useState<UserFreedom | null>(null);
  const [openDomain, setOpenDomain] = useState<DomainMeta | null>(null);

  useEffect(() => {
    a().freedom().then(setData).catch(() => setData(null));
  }, []);

  if (!data) {
    return (
      <main className="shell shell-home">
        <button className="back-btn" onClick={onBack}>{ru.freedom_back}</button>
        <p className="muted">секунду…</p>
      </main>
    );
  }

  const eventsByDomain = Object.fromEntries(
    DOMAINS.map((domain) => [domain.key, [] as EnrichedEvent[]])
  ) as Record<LifeDomain, EnrichedEvent[]>;
  for (const event of data.events) eventsByDomain[event.domain].push(event);

  return (
    <main className="shell shell-home evidence-page">
      <button className="back-btn" onClick={onBack}>{ru.freedom_back}</button>

      <header className="evidence-head">
        <div className="overline">не сумма денег — история выбора</div>
        <h1>{ru.freedom_title}</h1>
        <div className="evidence-count">{data.totalPermissions}</div>
        <p>{decisionsLabel(data.totalPermissions)} в свою пользу</p>
        {data.selfPermissions > 0 && (
          <div className="evidence-self">
            {decisionsLabel(data.selfPermissions)} — без необходимости что-то заслужить
          </div>
        )}
      </header>

      {data.totalPermissions === 0 ? (
        <section className="empty-state">
          <div className="empty-mark" aria-hidden>✦</div>
          <h2 className="empty-title">{ru.freedom_empty_title}</h2>
          <p className="empty-body">{ru.freedom_empty_body}</p>
        </section>
      ) : (
        <>
          <section className="evidence-grid" aria-label="решения по сферам">
            {DOMAINS.map((domain) => {
              const count = data.byDomain[domain.key].count;
              if (count === 0) return null;
              return (
                <button key={domain.key} onClick={() => setOpenDomain(domain)}>
                  <span aria-hidden>{domain.emoji}</span>
                  <strong>{domain.label}</strong>
                  <small>{decisionsLabel(count)}</small>
                </button>
              );
            })}
          </section>

          <section className="evidence-history">
            <div className="overline">последние решения</div>
            <div className="evidence-list">
              {data.events.slice(0, 8).map((event) => (
                <article key={event.id}>
                  <div className="evidence-event-mark" aria-hidden>✓</div>
                  <div>
                    <h2>{event.wishTitle || 'решение для себя'}</h2>
                    <p>{formatDate(event.createdAt)}{event.belowThreshold ? ' · без условий' : ''}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      )}

      {openDomain && (
        <Sheet open={true} onClose={() => setOpenDomain(null)} title={`${openDomain.emoji} ${openDomain.label}`}>
          <div className="evidence-list evidence-list-sheet">
            {eventsByDomain[openDomain.key].map((event) => (
              <article key={event.id}>
                <div className="evidence-event-mark" aria-hidden>✓</div>
                <div>
                  <h2>{event.wishTitle || 'решение для себя'}</h2>
                  <p>{formatDate(event.createdAt)}{event.belowThreshold ? ' · без условий' : ''}</p>
                </div>
              </article>
            ))}
          </div>
        </Sheet>
      )}
    </main>
  );
}
