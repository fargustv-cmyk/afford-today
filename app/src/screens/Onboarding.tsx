// First-run onboarding — 3 screens that end with the user picking ONE concrete
// tiny permission. That choice becomes a real wish (essential, marked bought),
// the freedom map gets its first event, and Mozhno celebrates the specific
// thing the user chose. Avoids the meaningless "первое можно" placeholder.

import { useState } from 'react';
import type { LifeDomain, Wish } from '@afford/shared';
import { ru } from '../i18n/ru';
import { Mozhno } from '../components/Mozhno';
import { api } from '../api/client';
import { isPreview, previewApi } from '../lib/preview';

const a = () => (isPreview() ? previewApi : api);

interface Props {
  onDone: () => void;
}

const STEPS: { title: string; body: string }[] = [
  { title: ru.onboarding_1_title, body: ru.onboarding_1_body },
  { title: ru.onboarding_2_title, body: ru.onboarding_2_body },
  { title: ru.onboarding_3_title, body: ru.onboarding_3_body }
];

interface FirstChoice {
  emoji: string;
  title: string;
  domain: LifeDomain;
}

const FIRST_CHOICES: FirstChoice[] = [
  { emoji: '🌸', title: 'купить себе цветы',          domain: 'joy'     },
  { emoji: '☕️', title: 'кофе в любимом месте',       domain: 'food'    },
  { emoji: '🛏', title: 'полежать 15 минут без вины', domain: 'comfort' }
];

export function Onboarding({ onDone }: Props) {
  const [idx, setIdx] = useState(0);
  const [working, setWorking] = useState<string | null>(null);
  const [firstWish, setFirstWish] = useState<Wish | null>(null);
  const last = idx === STEPS.length - 1;
  const step = STEPS[idx]!;

  const claimFirst = async (choice: FirstChoice) => {
    if (working) return;
    setWorking(choice.title);
    try {
      const { wish } = await a().createWish({
        title: choice.title,
        price: null,
        sourceUrl: null,
        imageUrl: null,
        type: 'essential',
        domain: choice.domain
      });
      const bought = await a().markBought(wish.id);
      // Only celebrate if the server actually moved the wish to 'purchased'.
      if (bought.wish?.status === 'purchased') {
        setFirstWish(bought.wish);
      } else {
        onDone();
      }
    } catch {
      onDone();
    } finally {
      setWorking(null);
    }
  };

  if (firstWish) {
    return (
      <Mozhno
        wish={firstWish}
        belowThreshold={false}
        hideShare
        subtitleOverride={ru.mozhno_sub_first}
        onShare={() => {}}
        onContinue={onDone}
      />
    );
  }

  return (
    <main className="onboarding">
      <div className="onboarding-dots">
        {STEPS.map((_, i) => (
          <span key={i} className={`onboarding-dot ${i === idx ? 'active' : ''}`} />
        ))}
      </div>

      <div className="onboarding-content">
        <h1 className="onboarding-title">{step.title}</h1>
        <p className="onboarding-body">{step.body}</p>

        {last && (
          <div className="first-choice-list">
            {FIRST_CHOICES.map((c) => (
              <button
                key={c.title}
                type="button"
                className="first-choice-card"
                onClick={() => claimFirst(c)}
                disabled={working !== null}
              >
                <span className="first-choice-emoji" aria-hidden>{c.emoji}</span>
                <span className="first-choice-title">
                  {working === c.title ? '…' : c.title}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {!last && (
        <button
          type="button"
          className="onboarding-cta"
          onClick={() => setIdx(idx + 1)}
        >
          {ru.onboarding_next}
        </button>
      )}
    </main>
  );
}
