import { useState } from 'react';
import { ru } from '../i18n/ru';

interface Props {
  onDone: () => void;
}

const STEPS = [
  {
    eyebrow: 'знакомая мысль?',
    title: ru.onboarding_1_title,
    body: ru.onboarding_1_body
  },
  {
    eyebrow: 'вот зачем afford.today',
    title: ru.onboarding_2_title,
    body: ru.onboarding_2_body
  }
] as const;

export function Onboarding({ onDone }: Props) {
  const [idx, setIdx] = useState(0);
  const step = STEPS[idx]!;
  const last = idx === STEPS.length - 1;

  return (
    <main className="onboarding">
      <div className="onboarding-dots" aria-label={`шаг ${idx + 1} из ${STEPS.length}`}>
        {STEPS.map((_, i) => (
          <span key={i} className={`onboarding-dot ${i === idx ? 'active' : ''}`} />
        ))}
      </div>

      <div className="onboarding-content">
        <div className="onboarding-eyebrow">{step.eyebrow}</div>
        <h1 className="onboarding-title">{step.title}</h1>
        <p className="onboarding-body">{step.body}</p>

        {last && (
          <div className="onboarding-rule">
            <span aria-hidden>✓</span>
            <p><strong>Главное правило:</strong> здесь ничего не нужно заслуживать.</p>
          </div>
        )}
      </div>

      <button
        type="button"
        className="onboarding-cta"
        onClick={() => last ? onDone() : setIdx(idx + 1)}
      >
        {last ? ru.onboarding_finish : ru.onboarding_next}
      </button>
    </main>
  );
}
