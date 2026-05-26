import { useEffect, useState } from 'react';
import type { MicroPermissionTemplate, Step, Wish } from '@afford/shared';
import { ru } from '../i18n/ru';
import { Sheet } from '../components/Sheet';
import { api } from '../api/client';
import { isPreview, previewApi } from '../lib/preview';

const a = () => (isPreview() ? previewApi : api);

interface Props {
  wishId: string;
  onBack: () => void;
}

export function WishScreen({ wishId, onBack }: Props) {
  const [wish, setWish] = useState<Wish | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [templates, setTemplates] = useState<MicroPermissionTemplate[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [working, setWorking] = useState<string | null>(null);

  useEffect(() => {
    // Find the wish in the list — we don't have a single-wish endpoint yet
    a().listWishes().then(({ wishes }) => {
      const w = wishes.find((x) => x.id === wishId);
      setWish(w ?? null);
    });
    a().listSteps(wishId).then(({ steps }) => setSteps(steps));
    a().microTemplates().then(({ templates }) => setTemplates(templates));
  }, [wishId]);

  if (!wish) {
    return (
      <main className="shell shell-home">
        <button className="back-btn" onClick={onBack}>{ru.wish_back}</button>
        <p className="muted">…</p>
      </main>
    );
  }

  const isEssential = wish.type === 'essential';
  const isUnlocked = wish.status === 'unlocked';
  const pct = wish.pointsRequired > 0
    ? Math.min(100, (wish.pointsEarned / wish.pointsRequired) * 100)
    : 100;

  const refreshWish = (updated: Wish | null) => {
    if (updated) setWish(updated);
  };

  const onStepDone = async (stepId: string) => {
    if (working) return;
    setWorking(stepId);
    try {
      const { step, wish: w } = await a().markStepDone(stepId);
      setSteps((prev) => prev.map((s) => (s.id === step.id ? step : s)));
      refreshWish(w);
    } finally {
      setWorking(null);
    }
  };

  const onTemplateTap = async (templateId: string) => {
    if (working) return;
    setWorking(templateId);
    try {
      const { step, wish: w } = await a().doMicroPermission(wishId, templateId);
      setSteps((prev) => [step, ...prev]);
      refreshWish(w);
    } finally {
      setWorking(null);
    }
  };

  const onStepCreated = (step: Step) => {
    setSteps((prev) => [...prev, step]);
    setAddOpen(false);
  };

  const visibleSteps = steps;
  const showTemplates = !isEssential && !isUnlocked && steps.filter((s) => !s.done).length === 0;

  return (
    <main className="shell shell-home">
      <button className="back-btn" onClick={onBack}>{ru.wish_back}</button>

      <article className="wish-hero">
        <div className="wish-hero-thumb">
          {wish.imageUrl ? <img src={wish.imageUrl} alt="" /> : <span aria-hidden>✦</span>}
        </div>
        <div className="wish-hero-name">{wish.title}</div>
        {wish.price != null && (
          <div className="wish-hero-price">{wish.price.toLocaleString('ru-RU')} {wish.currency}</div>
        )}

        {isEssential ? (
          <div className="wish-banner wish-banner-teal">
            <strong>{ru.wish_essential_title}</strong>
            <p>{ru.wish_essential_body}</p>
          </div>
        ) : isUnlocked ? (
          <div className="wish-banner wish-banner-coral">
            <strong>{ru.wish_unlocked_title}</strong>
            <p>{ru.wish_unlocked_body}</p>
          </div>
        ) : (
          <div className="wish-progress-block">
            <div className="wish-progress-numbers">
              <span className="wish-points-now">{wish.pointsEarned}</span>
              <span className="wish-points-of">/ {wish.pointsRequired}</span>
            </div>
            <div className="wish-bar">
              <div className="wish-bar-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}
      </article>

      {!isEssential && (
        <section className="wish-steps">
          <div className="wish-steps-head">
            <h2 className="section-title">{ru.wish_steps_title}</h2>
            {!isUnlocked && (
              <button className="add-btn" onClick={() => setAddOpen(true)}>{ru.wish_add_step}</button>
            )}
          </div>

          {visibleSteps.length > 0 && (
            <ul className="step-list">
              {visibleSteps.map((s) => (
                <li key={s.id} className={`step-row ${s.done ? 'done' : ''}`}>
                  <span className="step-points">{s.points}</span>
                  <span className="step-title">{s.title}</span>
                  {!s.done && (
                    <button
                      className="step-done-btn"
                      onClick={() => onStepDone(s.id)}
                      disabled={working === s.id}
                    >
                      {working === s.id ? '…' : ru.wish_step_done_btn}
                    </button>
                  )}
                  {s.done && <span className="step-check" aria-hidden>✓</span>}
                </li>
              ))}
            </ul>
          )}

          {showTemplates && (
            <div className="micro-block">
              <strong className="micro-title">{ru.wish_steps_empty_title}</strong>
              <p className="micro-body">{ru.wish_steps_empty_body}</p>
              <ul className="micro-list">
                {templates.map((t) => (
                  <li key={t.id}>
                    <button
                      className="micro-card"
                      onClick={() => onTemplateTap(t.id)}
                      disabled={working === t.id}
                    >
                      <span className="micro-card-title">{t.title}</span>
                      <span className="micro-card-points">+{t.suggestedPoints}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <AddStepSheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={onStepCreated}
        wishId={wishId}
      />
    </main>
  );
}

interface AddStepProps {
  open: boolean;
  onClose: () => void;
  onCreated: (s: Step) => void;
  wishId: string;
}

function AddStepSheet({ open, onClose, onCreated, wishId }: AddStepProps) {
  const [title, setTitle] = useState('');
  const [points, setPoints] = useState<10 | 25 | 50>(25);
  const [saving, setSaving] = useState(false);

  const reset = () => { setTitle(''); setPoints(25); };

  const onSave = async () => {
    if (!title.trim() || saving) return;
    setSaving(true);
    try {
      const { step } = await a().createStep(wishId, title.trim(), points);
      reset();
      onCreated(step);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onClose={() => { reset(); onClose(); }} title={ru.step_add_title}>
      <div className="form">
        <label className="field">
          <span className="field-label">{ru.step_add_name_label}</span>
          <input
            className="field-input"
            type="text"
            placeholder={ru.step_add_name_placeholder}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoComplete="off"
          />
        </label>

        <div className="field">
          <span className="field-label">{ru.step_add_size_label}</span>
          <div className="seg seg-3">
            <button
              type="button"
              className={`seg-btn ${points === 10 ? 'active' : ''}`}
              onClick={() => setPoints(10)}
            >
              {ru.step_size_small}
            </button>
            <button
              type="button"
              className={`seg-btn ${points === 25 ? 'active' : ''}`}
              onClick={() => setPoints(25)}
            >
              {ru.step_size_medium}
            </button>
            <button
              type="button"
              className={`seg-btn ${points === 50 ? 'active' : ''}`}
              onClick={() => setPoints(50)}
            >
              {ru.step_size_large}
            </button>
          </div>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={onSave}
          disabled={!title.trim() || saving}
        >
          {saving ? '…' : ru.step_add_save}
        </button>
      </div>
    </Sheet>
  );
}
