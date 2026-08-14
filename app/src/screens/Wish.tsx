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

const QUESTIONS: Array<{ key: AnswerKey; title: string; hint: string }> = [
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

const BLOCKERS = [
  'жалко денег на себя',
  'кажется, что не заслужил(а)',
  'боюсь потом пожалеть',
  'сначала надо быть полезным'
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

  const markBought = async () => {
    if (!wish || working) return;
    const wasAlreadyAllowed = wish.status === 'unlocked';
    setWorking(true);
    setError(null);
    try {
      const result = await a().markBought(wish.id);
      setWish(result.wish);
      if (result.justPurchased) {
        if (wasAlreadyAllowed) setCheckInOpen(true);
        else setMozhno({ closeToHome: true, selfDirected: result.belowThreshold });
      }
    } catch {
      setError('не получилось отметить покупку. попробуй ещё раз.');
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
  const moneyIsSafe = answers.obligations === true && answers.debt === true;
  const desireIsClear = answers.desire === true;
  const isAllowed = wish.status === 'unlocked';

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
          <button className="btn-primary" onClick={markBought} disabled={working}>
            {working ? 'сохраняю…' : 'я купил(а) это'}
          </button>
          <button className="btn-ghost-link" onClick={onBack}>ещё не купил(а) — вернусь позже</button>
        </section>
      ) : (
        <>
          <section className="decision-intro">
            <div className="overline">быстрая проверка</div>
            <h1>Можно ли сейчас — без вреда себе?</h1>
            <p>Это не экзамен и не разрешение от приложения. Просто три опоры перед твоим решением.</p>
          </section>

          <section className="decision-questions">
            {QUESTIONS.map((question, index) => (
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
              {BLOCKERS.map((item) => (
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
            <section className={`decision-result ${moneyIsSafe ? 'safe' : 'pause'}`}>
              <div className="decision-result-icon" aria-hidden>{moneyIsSafe ? '✓' : '‖'}</div>
              <div className="overline">{moneyIsSafe ? 'деньги выдерживают' : 'опоры просят паузу'}</div>
              <h2>
                {moneyIsSafe
                  ? desireIsClear ? 'Похоже, вопрос уже не в деньгах.' : 'Деньги в порядке. Желанию можно дать время.'
                  : 'Отложить сейчас — не значит запретить навсегда.'}
              </h2>
              <p>
                {moneyIsSafe
                  ? blocker
                    ? `Ты назвал(а), что мешает: «${blocker}». Это чувство реально — но оно не обязано принимать решение вместо тебя.`
                    : 'Финансовые опоры на месте. Осталось только твоё собственное «да» или спокойное «не сейчас».'
                  : 'Сохранить желание и вернуться к нему позже — тоже решение в свою пользу, без стыда и наказания.'}
              </p>

              {moneyIsSafe && desireIsClear ? (
                <>
                  <button className="btn-primary decision-primary" onClick={allow} disabled={working}>
                    {working ? 'сохраняю…' : 'я разрешаю себе это'}
                  </button>
                  <button className="btn-ghost-link" onClick={onBack}>не сейчас — оставлю в списке</button>
                </>
              ) : (
                <>
                  <button className="btn-primary decision-primary pause-btn" onClick={onBack}>
                    сохранить и вернуться позже
                  </button>
                  <button className="btn-ghost-link" onClick={allow} disabled={working}>
                    я всё обдумал(а) и всё равно выбираю это
                  </button>
                </>
              )}
            </section>
          )}

          <button className="already-bought-link" onClick={markBought} disabled={working}>
            уже купил(а)? отметить без дополнительных условий
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
