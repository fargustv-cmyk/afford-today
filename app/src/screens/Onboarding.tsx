// First-run onboarding — 3 screens that end with an immediate "Можно!".
// SPEC §10 + "rule of 90": user should experience relief in their first
// session. We deliver that by creating an essential wish on the spot, marking
// it bought (server writes permission_event), and showing Mozhno.

import { useState } from 'react';
import type { Wish } from '@afford/shared';
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

export function Onboarding({ onDone }: Props) {
  const [idx, setIdx] = useState(0);
  const [working, setWorking] = useState(false);
  const [firstWish, setFirstWish] = useState<Wish | null>(null);
  const last = idx === STEPS.length - 1;
  const step = STEPS[idx]!;

  const claimFirst = async () => {
    if (working) return;
    setWorking(true);
    try {
      const { wish } = await a().createWish({
        title: ru.onboarding_first_wish_title,
        price: null,
        sourceUrl: null,
        imageUrl: null,
        type: 'essential',
        domain: 'joy'
      });
      // Essentials unlock immediately; mark bought right away so we get a
      // proper permission_event and the freedom map starts at 1.
      const bought = await a().markBought(wish.id);
      // Only celebrate if the server actually moved the wish to 'purchased'.
      // If markBought returned null (race / 404), skip Mozhno and let the
      // user finish onboarding — they can claim the wish from the list.
      if (bought.wish?.status === 'purchased') {
        setFirstWish(bought.wish);
      } else {
        onDone();
      }
    } catch {
      // Soft fail: never block onboarding — just finish without the wish.
      onDone();
    } finally {
      setWorking(false);
    }
  };

  if (firstWish) {
    return (
      <Mozhno
        wish={firstWish}
        belowThreshold={false}
        onShare={() => { /* share appears later, when user wants it */ }}
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
      </div>

      <button
        type="button"
        className="onboarding-cta"
        onClick={last ? claimFirst : () => setIdx(idx + 1)}
        disabled={working}
      >
        {working ? '…' : last ? ru.onboarding_finish : ru.onboarding_next}
      </button>
    </main>
  );
}
