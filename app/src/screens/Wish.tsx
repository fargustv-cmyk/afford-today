import { useEffect, useMemo, useState } from 'react';
import type {
  InterpretationMode,
  LifeDomain,
  MeResponse,
  MicroPermissionPack,
  MicroPermissionTemplate,
  Step,
  StepCategory,
  UserStepTemplate,
  Wish
} from '@afford/shared';
import { ru } from '../i18n/ru';
import { Sheet } from '../components/Sheet';
import { Mozhno } from '../components/Mozhno';
import { CheckInSheet } from '../components/CheckIn';
import { PaywallSheet } from '../components/Paywall';
import { api } from '../api/client';
import { isPreview, previewApi } from '../lib/preview';
import { tg } from '../telegram';

const a = () => (isPreview() ? previewApi : api);

const catIcon = (c?: StepCategory) => (c === 'effort' ? '💪' : '🌿');

// Three picks: prefer the wish's domain, respect the interpretation lens,
// random within tiers so a reshuffle gives something new each time. User's
// own saved templates always take priority over the curated library.
function pickSmart(
  templates: MicroPermissionTemplate[],
  userTemplates: MicroPermissionTemplate[],
  domain: LifeDomain | undefined,
  interp: InterpretationMode,
  count: number
): MicroPermissionTemplate[] {
  const all = [...userTemplates, ...templates];
  if (all.length === 0) return [];
  const filtered = interp === 'both'
    ? all.slice()
    : all.filter((t) => t.category === interp);
  const shuffled = (arr: MicroPermissionTemplate[]) =>
    arr
      .map((v) => [Math.random(), v] as const)
      .sort((a, b) => a[0] - b[0])
      .map(([, v]) => v);
  const matched = domain ? filtered.filter((t) => t.domain === domain) : [];
  const others = domain ? filtered.filter((t) => t.domain !== domain) : filtered;
  return [...shuffled(matched), ...shuffled(others)].slice(0, count);
}

function userTemplateToTemplate(t: UserStepTemplate): MicroPermissionTemplate {
  return {
    id: `user:${t.id}`,
    title: t.title,
    suggestedPoints: t.suggestedPoints,
    domain: t.domain,
    category: t.category,
    isPremium: false
  };
}

interface Props {
  me: MeResponse;
  wishId: string;
  onBack: () => void;
}

export function WishScreen({ me, wishId, onBack }: Props) {
  const [wish, setWish] = useState<Wish | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [templates, setTemplates] = useState<MicroPermissionTemplate[]>([]);
  const [packs, setPacks] = useState<MicroPermissionPack[]>([]);
  const [activePack, setActivePack] = useState<string>('default');
  const [userTemplates, setUserTemplates] = useState<UserStepTemplate[]>([]);
  const [savedStepIds, setSavedStepIds] = useState<Set<string>>(new Set());
  const [addOpen, setAddOpen] = useState(false);
  const [libOpen, setLibOpen] = useState(false);
  const [paywallReason, setPaywallReason] = useState<string | null>(null);
  const [pickSeed, setPickSeed] = useState(0);
  const [working, setWorking] = useState<string | null>(null);
  const [mozhno, setMozhno] = useState<null | { belowThreshold: boolean; closeToHome: boolean }>(null);
  const [checkInOpen, setCheckInOpen] = useState(false);

  useEffect(() => {
    // Find the wish in the list — we don't have a single-wish endpoint yet
    a().listWishes().then(({ wishes }) => {
      const w = wishes.find((x) => x.id === wishId);
      setWish(w ?? null);
    });
    a().listSteps(wishId).then(({ steps }) => setSteps(steps));
    a().microTemplates('default').then(({ templates }) => setTemplates(templates));
    a().listPacks().then(({ packs }) => setPacks(packs)).catch(() => setPacks([]));
    if (me.unlocked) {
      a().listUserTemplates().then(({ templates }) => setUserTemplates(templates)).catch(() => setUserTemplates([]));
    }
  }, [wishId, me.unlocked]);

  const switchPack = async (packId: string) => {
    const pack = packs.find((p) => p.id === packId);
    if (!pack) return;
    if (pack.isPremium && !me.unlocked) {
      setPaywallReason(ru.paywall_reason_pack);
      return;
    }
    setActivePack(packId);
    const { templates } = await a().microTemplates(packId);
    setTemplates(templates);
  };

  // Hooks must run in stable order; can't sit after the early return below.
  const wishInterp: InterpretationMode = wish?.interpretation ?? 'both';
  const smartPicks = useMemo(
    () =>
      pickSmart(
        templates,
        userTemplates.map(userTemplateToTemplate),
        wish?.domain,
        wishInterp,
        3
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pickSeed, templates, userTemplates, wish?.domain, wishInterp]
  );

  const onSaveStepAsTemplate = async (step: Step) => {
    if (!me.unlocked) {
      setPaywallReason(ru.paywall_reason_favorite);
      return;
    }
    if (savedStepIds.has(step.id)) return;
    try {
      const { template } = await a().createUserTemplate({
        title: step.title,
        points: step.points,
        domain: wish?.domain ?? 'other',
        category: step.category
      });
      setUserTemplates((prev) => [template, ...prev]);
      setSavedStepIds((prev) => new Set(prev).add(step.id));
    } catch (err) {
      console.warn('save template failed', err);
    }
  };

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
  // Per-wish lens — set at creation. Falls back to 'both' for old wishes.
  const interpretation: InterpretationMode = wish.interpretation ?? 'both';
  const defaultStepCategory: StepCategory =
    interpretation === 'effort' ? 'effort' : 'permission';
  const sectionOrder: StepCategory[] =
    interpretation === 'effort' ? ['effort', 'permission'] : ['permission', 'effort'];

  const refreshWish = (updated: Wish | null) => {
    if (!updated) return;
    const prev = wish;
    setWish(updated);
    // Just crossed the threshold? Trigger Mozhno automatically.
    if (prev && prev.status === 'active' && updated.status === 'unlocked') {
      setMozhno({ belowThreshold: false, closeToHome: false });
    }
  };

  const onStepDone = async (stepId: string) => {
    if (working) return;
    setWorking(stepId);
    try {
      const { step, wish: w } = await a().markStepDone(stepId);
      setSteps((prev) => prev.map((s) => (s.id === step.id ? step : s)));
      refreshWish(w);
    } catch (err) {
      console.warn('markStepDone failed', err);
    } finally {
      setWorking(null);
    }
  };

  const onTemplateTap = async (templateId: string) => {
    if (working) return;
    const tpl = templates.find((t) => t.id === templateId);
    if (!tpl) return;
    setWorking(templateId);
    try {
      // Suggestions are PENDING by design — points accrue only when the
      // user actually does it and taps «выполнил».
      const { step } = await a().createStep(wishId, tpl.title, tpl.suggestedPoints, tpl.category);
      setSteps((prev) => [...prev, step]);
      setLibOpen(false);
    } catch (err) {
      // Surface failures instead of swallowing them silently; otherwise the
      // user taps a card and nothing happens.
      console.warn('template tap failed', err);
    } finally {
      setWorking(null);
    }
  };

  const onMarkBought = async () => {
    if (working) return;
    setWorking('buy');
    try {
      const { wish: w, belowThreshold, justPurchased } = await a().markBought(wishId);
      if (w) setWish(w);
      if (justPurchased) setMozhno({ belowThreshold, closeToHome: true });
    } finally {
      setWorking(null);
    }
  };

  const onStepCreated = (step: Step) => {
    setSteps((prev) => [...prev, step]);
    setAddOpen(false);
  };

  const visibleSteps = steps;
  // First-time helper: render the library inline when the wish has no steps at all.
  // After that the user gets to it via the «идеи» button (libOpen sheet).
  const showInlineTemplates = !isEssential && !isUnlocked && steps.length === 0;

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
              <div className="wish-steps-actions">
                <button className="add-btn add-btn-ghost" onClick={() => setLibOpen(true)}>{ru.wish_lib_btn}</button>
                <button className="add-btn" onClick={() => setAddOpen(true)}>{ru.wish_add_step}</button>
              </div>
            )}
          </div>

          {visibleSteps.length > 0 && (
            <ul className="step-list">
              {visibleSteps.map((s) => (
                <li key={s.id} className={`step-row cat-${s.category} ${s.done ? 'done' : ''}`}>
                  <span className="step-points">{s.points}</span>
                  <span className="step-cat" aria-hidden>{catIcon(s.category)}</span>
                  <span className="step-title">{s.title}</span>
                  {!s.done && (
                    <>
                      <button
                        type="button"
                        className={`step-fav-btn ${savedStepIds.has(s.id) ? 'saved' : ''}`}
                        onClick={() => onSaveStepAsTemplate(s)}
                        aria-label={savedStepIds.has(s.id) ? ru.wish_template_saved : ru.wish_save_template}
                        title={savedStepIds.has(s.id) ? ru.wish_template_saved : ru.wish_save_template}
                      >
                        {savedStepIds.has(s.id) ? '★' : '☆'}
                      </button>
                      <button
                        className="step-done-btn"
                        onClick={() => onStepDone(s.id)}
                        disabled={working === s.id}
                      >
                        {working === s.id ? '…' : ru.wish_step_done_btn}
                      </button>
                    </>
                  )}
                  {s.done && <span className="step-check" aria-hidden>✓</span>}
                </li>
              ))}
            </ul>
          )}

          {showInlineTemplates && (
            <div className="smart-picks">
              <strong className="micro-title">{ru.wish_steps_empty_title}</strong>
              <p className="micro-body">{ru.wish_steps_empty_body}</p>

              <ul className="micro-list">
                {smartPicks.map((t) => (
                  <li key={t.id}>
                    <button
                      className={`micro-card cat-${t.category}`}
                      onClick={() => onTemplateTap(t.id)}
                      disabled={working === t.id}
                    >
                      <span className="micro-card-emoji" aria-hidden>{catIcon(t.category)}</span>
                      <span className="micro-card-title">{t.title}</span>
                      <span className="micro-card-points">+{t.suggestedPoints}</span>
                    </button>
                  </li>
                ))}
              </ul>

              <div className="smart-picks-foot">
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => setPickSeed((s) => s + 1)}
                >
                  ↻ {ru.wish_steps_reshuffle}
                </button>
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => setLibOpen(true)}
                >
                  {ru.wish_steps_open_lib}
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {wish.status === 'unlocked' && (
        <div className="claim-wrap">
          <button
            type="button"
            className="claim-btn"
            onClick={onMarkBought}
            disabled={working === 'buy'}
          >
            {working === 'buy' ? '…' : ru.wish_claim_btn}
          </button>
          <div className="claim-hint">{ru.wish_claim_hint}</div>
        </div>
      )}

      {wish.status === 'active' && (
        <div className="mark-bought-wrap">
          <button
            type="button"
            className="mark-bought-btn"
            onClick={onMarkBought}
            disabled={working === 'buy'}
          >
            {working === 'buy' ? '…' : ru.wish_mark_bought}
          </button>
          <div className="mark-bought-hint">{ru.wish_mark_bought_hint}</div>
        </div>
      )}

      <AddStepSheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={onStepCreated}
        wishId={wishId}
        defaultCategory={defaultStepCategory}
      />

      <Sheet open={libOpen} onClose={() => setLibOpen(false)} title={ru.wish_lib_sheet_title}>
        <p className="muted micro-body">{ru.wish_lib_sheet_hint}</p>
        {packs.length > 1 && (
          <div className="pack-picker">
            <div className="pack-picker-label muted">{ru.packs_picker_label}</div>
            <div className="pack-chips">
              {packs.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`pack-chip ${activePack === p.id ? 'active' : ''} ${p.isPremium ? 'is-pro' : ''}`}
                  onClick={() => switchPack(p.id)}
                >
                  {p.title}
                  {p.isPremium && <span className="pro-pill">PRO</span>}
                </button>
              ))}
            </div>
          </div>
        )}
        {sectionOrder.map((cat) => {
          const list = templates.filter((t) => t.category === cat);
          if (list.length === 0) return null;
          return (
            <div key={cat} className="micro-section">
              <div className="micro-section-label">
                {cat === 'permission' ? ru.wish_lib_permission_title : ru.wish_lib_effort_title}
              </div>
              <ul className="micro-list">
                {list.map((t) => (
                  <li key={t.id}>
                    <button
                      className={`micro-card cat-${t.category}`}
                      onClick={() => onTemplateTap(t.id)}
                      disabled={working === t.id}
                    >
                      <span className="micro-card-emoji" aria-hidden>{catIcon(t.category)}</span>
                      <span className="micro-card-title">{t.title}</span>
                      <span className="micro-card-points">+{t.suggestedPoints}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </Sheet>

      {mozhno && (
        <Mozhno
          wish={wish}
          belowThreshold={mozhno.belowThreshold}
          onShare={async () => {
            try {
              const { shareUrl } = await a().share(wishId);
              // In Telegram: open the native share-to-chat sheet. The chat
              // client unfurls the PNG inline.
              if (tg?.openTelegramLink) {
                tg.openTelegramLink(
                  `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}`
                );
              } else if (typeof window !== 'undefined') {
                window.open(shareUrl, '_blank');
              }
            } catch {
              // soft fail — share is bonus
            }
          }}
          onContinue={() => {
            const close = mozhno.closeToHome;
            setMozhno(null);
            // If the user just marked it bought, go straight into the check-in
            // sheet (SPEC §7); otherwise stay on the wish.
            if (close) setCheckInOpen(true);
          }}
        />
      )}

      {checkInOpen && (
        <CheckInSheet
          wishId={wishId}
          onDone={() => {
            setCheckInOpen(false);
            onBack();
          }}
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

interface AddStepProps {
  open: boolean;
  onClose: () => void;
  onCreated: (s: Step) => void;
  wishId: string;
  defaultCategory: StepCategory;
}

function AddStepSheet({ open, onClose, onCreated, wishId, defaultCategory }: AddStepProps) {
  const [title, setTitle] = useState('');
  const [points, setPoints] = useState<10 | 25 | 50>(25);
  const [category, setCategory] = useState<StepCategory>(defaultCategory);
  const [saving, setSaving] = useState(false);

  const reset = () => { setTitle(''); setPoints(25); setCategory(defaultCategory); };

  const onSave = async () => {
    if (!title.trim() || saving) return;
    setSaving(true);
    try {
      const { step } = await a().createStep(wishId, title.trim(), points, category);
      reset();
      onCreated(step);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onClose={() => { reset(); onClose(); }} title={ru.step_add_title}>
      <div className="form">
        <div className="field">
          <span className="field-label">{ru.step_category_label}</span>
          <div className="seg">
            <button
              type="button"
              className={`seg-btn ${category === 'permission' ? 'active' : ''}`}
              onClick={() => setCategory('permission')}
            >
              {ru.step_category_permission}
            </button>
            <button
              type="button"
              className={`seg-btn ${category === 'effort' ? 'active' : ''}`}
              onClick={() => setCategory('effort')}
            >
              {ru.step_category_effort}
            </button>
          </div>
          <div className="field-hint muted">
            {category === 'permission' ? ru.step_category_permission_hint : ru.step_category_effort_hint}
          </div>
        </div>

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
