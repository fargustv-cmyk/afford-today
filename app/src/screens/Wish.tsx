import { useEffect, useState } from 'react';
import type { MeResponse, Wish } from '@afford/shared';
import { ru } from '../i18n/ru';
import { Mozhno } from '../components/Mozhno';
import { CheckInSheet } from '../components/CheckIn';
import { api } from '../api/client';
import { isPreview, previewApi } from '../lib/preview';
import { tg } from '../telegram';

const a = () => (isPreview() ? previewApi : api);

interface Props {
  me: MeResponse;
  wishId: string;
  onBack: () => void;
}

type AnswerKey = 'obligations' | 'debt' | 'desire';
type Answers = Record<AnswerKey, boolean | null>;

const PURCHASE_QUESTIONS: Array<{ key: AnswerKey; title: string; hint: string }> = [
  {
    key: 'obligations',
    title: 'Обязательные расходы закрыты?',
    hint: 'жильё, еда, здоровье и ближайшие платежи не пострадают'
  },
  {
    key: 'debt',
    title: 'Покупка не загонит в долг?',
    hint: 'не придётся занимать или жить в тревоге до следующего дохода'
  },
  {
    key: 'desire',
    title: 'Ты хочешь именно эту вещь?',
    hint: 'не идеальную версию себя — а эту покупку для себя сегодняшнего'
  }
];

const ACTION_QUESTIONS: Array<{ key: AnswerKey; title: string; hint: string }> = [
  {
    key: 'obligations',
    title: 'Это безопасно для тебя и других?',
    hint: 'не навредит здоровью и действительно важным обязательствам'
  },
  {
    key: 'debt',
    title: 'Можно выделить на это время сейчас?',
    hint: 'ничего срочного не требует тебя прямо в эти минуты'
  },
  {
    key: 'desire',
    title: 'Ты правда этого хочешь?',
    hint: 'не «надо», а хочется тебе сегодняшнему'
  }
];

const PURCHASE_BLOCKERS = [
  'жалко денег на себя',
  'кажется, что не заслужил(а)',
  'боюсь потом пожалеть',
  'сначала надо быть полезным'
] as const;

const ACTION_BLOCKERS = [
  'кажется, что я ленюсь',
  'сначала надо быть полезным',
  'другим сейчас важнее',
  'боюсь потратить время зря'
] as const;

export function WishScreen({ wishId, onBack }: Props) {
  const [wish, setWish] = useState<Wish | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [answers, setAnswers] = useState<Answers>({ obligations: null, debt: null, desire: null });
  const [blocker, setBlocker] = useState<string | null>(null);
  const [mozhno, setMozhno] = useState<{ closeToHome: boolean; selfDirected: boolean } | null>(null);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    a().listWishes()
      .then(({ wishes }) => setWish(wishes.find((item) => item.id === wishId) ?? null))
      .catch(() => setWish(null))
      .finally(() => setLoading(false));
  }, [wishId]);

  const answer = (key: AnswerKey, value: boolean) => {
    setAnswers((current) => ({ ...current, [key]: value }));
  };

  const allow = async () => {
    if (!wish || working) return;
    setWorking(true);
    setError(null);
    try {
      const result = await a().allowWish(wish.id);
      setWish(result.wish);
      if (result.justAllowed) setMozhno({ closeToHome: false, selfDirected: true });
    } catch {
      setError('не получилось сохранить решение. попробуй ещё раз.');
    } finally {
      setWorking(false);
    }
  };

  const postpone = async () => {
    if (!wish || working) return;
    setWorking(true);
    setError(null);
    try {
      const result = await a().postponeWish(wish.id);
      setWish(result.wish);
      onBack();
    } catch {
      setError('не получилось сохранить паузу. попробуй ещё раз.');
    } finally {
      setWorking(false);
    }
  };

  const complete = async () => {
    if (!wish || working) return;
    const wasAlreadyAllowed = wish.status === 'unlocked';
    setWorking(true);
    setError(null);
    try {
      const result = await a().completeWish(wish.id);
      setWish(result.wish);
      if (result.justCompleted) {
        if (wasAlreadyAllowed) setCheckInOpen(true);
        else setMozhno({ closeToHome: true, selfDirected: result.belowThreshold });
      }
    } catch {
      setError('не получилось отметить завершение. попробуй ещё раз.');
    } finally {
      setWorking(false);
    }
  };

  const share = async () => {
    if (!wish) return;
    try {
      const { shareUrl } = await a().share(wish.id);
      const telegramShare = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('Я выбрал(а) себя — без необходимости заслуживать.')}`;
      if (tg?.openTelegramLink) tg.openTelegramLink(telegramShare);
      else window.open(telegramShare, '_blank', 'noopener,noreferrer');
    } catch {
      setError('карточка пока не собралась. решение всё равно сохранено.');
    }
  };

  if (loading) {
    return <main className="shell shell-home"><p className="muted">секунду…</p></main>;
  }

  if (!wish) {
    return (
      <main className="shell shell-home">
        <button className="back-btn" onClick={onBack}>{ru.wish_back}</button>
        <section className="empty-state">
          <h1 className="empty-title">желание не нашлось</h1>
          <button className="cta-btn" onClick={onBack}>к списку</button>
        </section>
      </main>
    );
  }

  const allAnswered = Object.values(answers).every((value) => value !== null);
  const supportsAreSafe = answers.obligations === true && answers.debt === true;
  const desireIsClear = answers.desire === true;
  const isAllowed = wish.status === 'unlocked';
  const isAction = wish.intentKind === 'action';
  const questions = isAction ? ACTION_QUESTIONS : PURCHASE_QUESTIONS;
  const blockers = isAction ? ACTION_BLOCKERS : PURCHASE_BLOCKERS;

  return (
    <main className="shell shell-home decision-page">
      <button className="back-btn" onClick={onBack}>{ru.wish_back}</button>

      <article className="wish-hero wish-hero-decision">
        <div className="wish-hero-thumb">
          {wish.imageUrl ? <img src={wish.imageUrl} alt="" /> : <span aria-hidden>✦</span>}
        </div>
        <div className="wish-hero-name">{wish.title}</div>
        {wish.price != null && (
          <div className="wish-hero-price">{wish.price.toLocaleString('ru-RU')} {wish.currency}</div>
        )}
        {wish.sourceUrl && (
          <a className="source-link" href={wish.sourceUrl} target="_blank" rel="noreferrer">посмотреть товар ↗</a>
        )}
      </article>

      {isAllowed ? (
        <section className="allowed-card">
          <div className="allowed-mark" aria-hidden>✓</div>
          <div>
            <div className="overline">решение принято</div>
            <h1>Тебе можно.</h1>
            <p>Не потому что приложение разрешило. Потому что ты проверил(а) опоры и выбрал(а) сам(а).</p>
          </div>
          <button className="btn-primary" onClick={complete} disabled={working}>
            {working ? 'сохраняю…' : isAction ? 'я сделал(а) это' : 'я купил(а) это'}
          </button>
          <button className="btn-ghost-link" onClick={onBack}>
            {isAction ? 'ещё не сделал(а) — вернусь позже' : 'ещё не купил(а) — вернусь позже'}
          </button>
        </section>
      ) : (
        <>
          <section className="decision-intro">
            <div className="overline">быстрая проверка</div>
            <h1>{isAction ? 'Можно ли выбрать это — без чувства вины?' : 'Можно ли сейчас — без вреда себе?'}</h1>
            <p>
              {isAction
                ? 'Это не экзамен на продуктивность. Просто три опоры перед твоим решением.'
                : 'Это не экзамен и не разрешение от приложения. Просто три опоры перед твоим решением.'}
            </p>
          </section>

          <section className="decision-questions">
            {questions.map((question, index) => (
              <article className="decision-question" key={question.key}>
                <div className="decision-question-number">{index + 1}</div>
                <div className="decision-question-copy">
                  <h2>{question.title}</h2>
                  <p>{question.hint}</p>
                </div>
                <div className="decision-toggle" aria-label={question.title}>
                  <button
                    type="button"
                    aria-pressed={answers[question.key] === true}
                    className={answers[question.key] === true ? 'active yes' : ''}
                    onClick={() => answer(question.key, true)}
                  >да</button>
                  <button
                    type="button"
                    aria-pressed={answers[question.key] === false}
                    className={answers[question.key] === false ? 'active no' : ''}
                    onClick={() => answer(question.key, false)}
                  >нет</button>
                </div>
              </article>
            ))}
          </section>

          <section className="blocker-card">
            <div className="overline">что сильнее всего мешает?</div>
            <div className="blocker-chips">
              {blockers.map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={blocker === item}
                  className={blocker === item ? 'active' : ''}
                  onClick={() => setBlocker(blocker === item ? null : item)}
                >{item}</button>
              ))}
            </div>
          </section>

          {allAnswered && (
            <section className={`decision-result ${supportsAreSafe ? 'safe' : 'pause'}`}>
              <div className="decision-result-icon" aria-hidden>{supportsAreSafe ? '✓' : '‖'}</div>
              <div className="overline">
                {supportsAreSafe ? (isAction ? 'пространство есть' : 'деньги выдерживают') : 'опоры просят паузу'}
              </div>
              <h2>
                {supportsAreSafe
                  ? desireIsClear
                    ? isAction ? 'Похоже, дело уже не в ограничениях.' : 'Похоже, вопрос уже не в деньгах.'
                    : isAction ? 'Пространство есть. Желанию можно дать время.' : 'Деньги в порядке. Желанию можно дать время.'
                  : 'Отложить сейчас — не значит запретить навсегда.'}
              </h2>
              <p>
                {supportsAreSafe
                  ? blocker
                    ? `Ты назвал(а), что мешает: «${blocker}». Это чувство реально — но оно не обязано принимать решение вместо тебя.`
                    : isAction
                      ? 'Реальные ограничения не мешают. Осталось только твоё собственное «да» или спокойное «не сейчас».'
                      : 'Финансовые опоры на месте. Осталось только твоё собственное «да» или спокойное «не сейчас».'
                  : 'Сохранить желание и вернуться к нему позже — тоже решение в свою пользу, без стыда и наказания.'}
              </p>

              {supportsAreSafe && desireIsClear ? (
                <>
                  <button className="btn-primary decision-primary" onClick={allow} disabled={working}>
                    {working ? 'сохраняю…' : 'я разрешаю себе это'}
                  </button>
                  <button className="btn-ghost-link" onClick={postpone} disabled={working}>
                    не сейчас — оставлю в списке
                  </button>
                </>
              ) : (
                <>
                  <button className="btn-primary decision-primary pause-btn" onClick={postpone} disabled={working}>
                    {working ? 'сохраняю…' : 'сохранить и вернуться позже'}
                  </button>
                  <button className="btn-ghost-link" onClick={allow} disabled={working}>
                    я всё обдумал(а) и всё равно выбираю это
                  </button>
                </>
              )}
            </section>
          )}

          <button className="already-bought-link" onClick={complete} disabled={working}>
            {isAction
              ? 'уже сделал(а)? отметить без дополнительных условий'
              : 'уже купил(а)? отметить без дополнительных условий'}
          </button>
        </>
      )}

      {error && <div className="form-error" role="alert">{error}</div>}

      {mozhno && (
        <Mozhno
          wish={wish}
          belowThreshold={mozhno.selfDirected}
          subtitleOverride="решение твоё. без очков, без домашних заданий, без чужого разрешения."
          onShare={share}
          onContinue={() => {
            const closeToHome = mozhno.closeToHome;
            setMozhno(null);
            if (closeToHome) setCheckInOpen(true);
          }}
        />
      )}

      {checkInOpen && (
        <CheckInSheet
          wishId={wish.id}
          onDone={() => {
            setCheckInOpen(false);
            onBack();
          }}
        />
      )}
    </main>
  );
}
