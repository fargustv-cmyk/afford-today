const BOT_URL = 'https://t.me/afford_today_bot?start=web';

export function Landing() {
  return (
    <main className="landing">
      <nav className="landing-nav">
        <a className="landing-brand" href="#top">afford.today</a>
        <a className="landing-nav-cta" href={BOT_URL}>открыть в Telegram</a>
      </nav>

      <section className="landing-hero" id="top">
        <div className="landing-seal" aria-hidden>✓</div>
        <div className="landing-kicker">не бюджетник и не список дел</div>
        <h1>Ты правда не можешь себе это позволить — или просто не можешь себе разрешить?</h1>
        <p>
          afford.today помогает спокойно проверить деньги, услышать себя и принять решение
          без необходимости что-то заслуживать.
        </p>
        <a className="landing-cta" href={BOT_URL}>попробовать в Telegram</a>
        <div className="landing-note">бесплатно · приватно · без осуждения</div>
      </section>

      <section className="landing-demo" aria-label="как это работает">
        <article>
          <span>1</span>
          <h2>Добавь покупку</h2>
          <p>Вставь ссылку или просто напиши, чего хочется.</p>
        </article>
        <article>
          <span>2</span>
          <h2>Проверь опоры</h2>
          <p>Обязательства закрыты? Долга не будет? Желание всё ещё твоё?</p>
        </article>
        <article>
          <span>3</span>
          <h2>Реши сам</h2>
          <p>Разрешить сейчас или спокойно отложить — оба решения нормальные.</p>
        </article>
      </section>

      <section className="landing-promise">
        <p>Тебе не нужно сначала стать продуктивнее, лучше или полезнее.</p>
        <strong>Если покупка безопасна для твоих денег — право выбрать уже у тебя.</strong>
      </section>

      <footer className="landing-footer">
        <span>afford.today · твоё решение, не чужое разрешение</span>
        <a href={BOT_URL}>открыть бота →</a>
      </footer>
    </main>
  );
}
