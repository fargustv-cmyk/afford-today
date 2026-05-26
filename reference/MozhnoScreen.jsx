// afford.today — "Можно!" unlock screen
// =====================================================================================
// The emotional core of the app: the moment permission is granted. Built to be shared.
//
// PROPS (see <MozhnoScreen /> below):
//   item:           { title: string, imageUrl?: string, price?: number, currency?: string }
//   belowThreshold: boolean  // true when the user bought BEFORE filling the bar -> proud "no-grind" variant
//   onShare:        () => void   // wire to Telegram share / prepared-message API
//   onContinue:     () => void   // close screen / go to check-in
//
// PRODUCTION NOTES (Telegram Mini App):
//   - This preview uses canvas confetti + CSS animations so it renders here. In the repo you can
//     swap to framer-motion if you prefer; keep the staggered reveal + the single confetti burst.
//   - Theme: read Telegram.WebApp.themeParams for light/dark; the warm palette below is the brand layer.
//   - Copy: move all strings into your i18n map (UI copy is Russian per CLAUDE.md).
//   - onShare: generate the share card server-side (satori + resvg) and hand it to Telegram.
//   - Respect prefers-reduced-motion (handled below).
// =====================================================================================

import { useState, useEffect, useRef } from "react";
import { Share2, Check, ArrowRight, Headphones } from "lucide-react";

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@500;700;800&family=Onest:wght@400;500;600&display=swap');

.afd-root{
  --cream:#FBF3E7; --ink:#2B2017; --ink-soft:#7A6450;
  --coral:#E0533A; --amber:#E79A33; --rose:#D98368; --teal:#2F9C8B;
  --card:#FFFDF8;
  position:relative; width:100%; min-height:560px; overflow:hidden;
  display:flex; align-items:center; justify-content:center;
  font-family:'Onest',ui-sans-serif,system-ui,sans-serif; color:var(--ink);
  background:radial-gradient(120% 120% at 50% -10%, #FFF8EC 0%, #F6E3C5 55%, #EFD3AC 100%);
  border-radius:20px;
}
.afd-grain{position:absolute; inset:0; opacity:.05; mix-blend-mode:multiply; pointer-events:none;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");}
.afd-canvas{position:absolute; inset:0; width:100%; height:100%; pointer-events:none;}
.afd-col{position:relative; z-index:2; display:flex; flex-direction:column; align-items:center;
  text-align:center; padding:40px 26px; max-width:420px;}
.afd-reveal{opacity:0; animation:afd-rise .7s cubic-bezier(.2,.8,.2,1) forwards;}
@keyframes afd-rise{from{opacity:0; transform:translateY(18px)} to{opacity:1; transform:none}}
@keyframes afd-pop{0%{opacity:0; transform:scale(.5)} 65%{transform:scale(1.1)} 100%{opacity:1; transform:scale(1)}}
@keyframes afd-spin{to{transform:rotate(360deg)}}

.afd-seal{width:104px; height:104px; animation:afd-pop .8s cubic-bezier(.2,.9,.3,1.2) forwards;}
.afd-seal svg .ring{animation:afd-spin 22s linear infinite; transform-origin:50% 50%;}

.afd-pill{display:inline-block; margin-bottom:14px; padding:6px 14px; border-radius:999px;
  background:rgba(47,156,139,.14); color:#1F7567; font-weight:600; font-size:13px; letter-spacing:.02em;}

.afd-title{font-family:'Unbounded',sans-serif; font-weight:800; letter-spacing:-.01em;
  font-size:clamp(54px,16vw,78px); line-height:.92; margin:14px 0 6px;
  background:linear-gradient(180deg,var(--ink) 0%, #4A3422 100%); -webkit-background-clip:text;
  background-clip:text; color:transparent;}
.afd-sub{font-size:16px; line-height:1.45; color:var(--ink-soft); max-width:300px; margin:0 auto 26px;}

.afd-card{width:100%; background:var(--card); border-radius:24px; padding:16px;
  display:flex; align-items:center; gap:14px; text-align:left;
  box-shadow:0 18px 40px -22px rgba(70,40,15,.55), 0 1px 0 rgba(255,255,255,.7) inset;
  border:1px solid rgba(120,80,40,.08);}
.afd-thumb{width:64px; height:64px; border-radius:16px; flex:none; display:flex; align-items:center;
  justify-content:center; background:linear-gradient(135deg,var(--amber),var(--rose)); color:#fff;}
.afd-thumb img{width:100%; height:100%; object-fit:cover; border-radius:16px;}
.afd-cardtitle{font-weight:600; font-size:16px;}
.afd-cardprice{font-size:14px; color:var(--ink-soft); margin-top:2px;}

.afd-actions{display:flex; flex-direction:column; gap:12px; width:100%; margin-top:24px;}
.afd-btn{display:flex; align-items:center; justify-content:center; gap:9px; width:100%; cursor:pointer;
  border:none; border-radius:16px; padding:16px; font-family:'Onest'; font-weight:600; font-size:16px;
  transition:transform .15s ease, box-shadow .2s ease, background .2s ease;}
.afd-btn-primary{background:var(--coral); color:#fff; box-shadow:0 12px 26px -12px rgba(224,83,58,.85);}
.afd-btn-primary:hover{transform:translateY(-2px); box-shadow:0 18px 30px -12px rgba(224,83,58,.9);}
.afd-btn-ghost{background:transparent; color:var(--ink-soft);}
.afd-btn-ghost:hover{color:var(--ink);}

@media (prefers-reduced-motion: reduce){
  .afd-reveal,.afd-seal{animation:none; opacity:1;}
  .afd-seal svg .ring{animation:none;}
}

/* demo controls only */
.afd-demo-bar{display:flex; gap:10px; justify-content:center; flex-wrap:wrap; margin-top:14px;}
.afd-demo-btn{font-family:'Onest'; font-size:13px; font-weight:600; padding:9px 14px; border-radius:11px;
  border:1px solid rgba(70,40,15,.18); background:#fff; color:#2B2017; cursor:pointer;}
.afd-demo-btn.active{background:#2B2017; color:#fff; border-color:#2B2017;}
`;

function Confetti() {
  const ref = useRef(null);
  useEffect(() => {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
    };
    resize();
    const W = () => canvas.width, H = () => canvas.height;
    const colors = ["#E0533A", "#E79A33", "#D98368", "#2F9C8B", "#FBF3E7"];
    const N = 130;
    const parts = Array.from({ length: N }, () => ({
      x: W() * (0.35 + Math.random() * 0.3),
      y: H() * (0.18 + Math.random() * 0.1),
      vx: (Math.random() - 0.5) * 9 * dpr,
      vy: (Math.random() * -7 - 4) * dpr,
      g: (0.18 + Math.random() * 0.12) * dpr,
      s: (5 + Math.random() * 7) * dpr,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      c: colors[(Math.random() * colors.length) | 0],
      life: 0,
    }));
    let raf, t0 = performance.now();
    const tick = (t) => {
      const dt = Math.min(2, (t - t0) / 16.67); t0 = t;
      ctx.clearRect(0, 0, W(), H());
      let alive = false;
      for (const p of parts) {
        p.life += dt;
        p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
        p.vx *= 0.99;
        const fade = Math.max(0, 1 - p.life / 150);
        if (p.y < H() + 40 && fade > 0) alive = true;
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6);
        ctx.restore();
      }
      if (alive) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="afd-canvas" />;
}

function Seal() {
  return (
    <div className="afd-seal" aria-hidden>
      <svg viewBox="0 0 100 100">
        <g className="ring">
          <defs>
            <path id="afd-circle" d="M50,12 A38,38 0 1,1 49.99,12" />
          </defs>
          <text fontFamily="Unbounded, sans-serif" fontSize="7.2" fontWeight="700"
                fill="#7A6450" letterSpacing="1.2">
            <textPath href="#afd-circle" startOffset="0">
              AFFORD.TODAY ✦ РАЗРЕШЕНО ✦ AFFORD.TODAY ✦ РАЗРЕШЕНО ✦
            </textPath>
          </text>
        </g>
        <circle cx="50" cy="50" r="22" fill="#E0533A" />
        <path d="M40 50 l6.5 6.5 L62 41" fill="none" stroke="#fff" strokeWidth="4.5"
              strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function MozhnoScreen({ item, belowThreshold = false, onShare, onContinue }) {
  const sub = belowThreshold
    ? "Ты позволил(а) себе это без всякого гринда. Вот это и есть рост 🤍"
    : "Ты дошёл(ла) до конца. Официально — можно. Иди забирай.";
  const price =
    item?.price != null
      ? `${item.price.toLocaleString("ru-RU")} ${item.currency || ""}`.trim()
      : null;

  return (
    <div className="afd-root">
      <div className="afd-grain" />
      <Confetti />
      <div className="afd-col">
        <Seal />
        {belowThreshold && (
          <span className="afd-pill afd-reveal" style={{ animationDelay: ".25s" }}>
            без гринда · горжусь
          </span>
        )}
        <h1 className="afd-title afd-reveal" style={{ animationDelay: ".3s" }}>Можно!</h1>
        <p className="afd-sub afd-reveal" style={{ animationDelay: ".42s" }}>{sub}</p>

        <div className="afd-card afd-reveal" style={{ animationDelay: ".54s" }}>
          <div className="afd-thumb">
            {item?.imageUrl ? <img src={item.imageUrl} alt="" /> : <Headphones size={28} />}
          </div>
          <div>
            <div className="afd-cardtitle">{item?.title || "Твоё желание"}</div>
            {price && <div className="afd-cardprice">{price}</div>}
          </div>
        </div>

        <div className="afd-actions afd-reveal" style={{ animationDelay: ".66s" }}>
          <button className="afd-btn afd-btn-primary" onClick={onShare}>
            <Share2 size={19} /> Поделиться
          </button>
          <button className="afd-btn afd-btn-ghost" onClick={onContinue}>
            Готово <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================ demo wrapper (preview only) ============================
export default function Demo() {
  const [runId, setRunId] = useState(0);
  const [below, setBelow] = useState(false);
  const item = { title: "Беспроводные наушники", price: 14990, currency: "₽" };

  return (
    <div style={{ fontFamily: "'Onest', sans-serif", padding: 8 }}>
      <style>{STYLES}</style>
      <MozhnoScreen
        key={`${runId}-${below}`}
        item={item}
        belowThreshold={below}
        onShare={() => {}}
        onContinue={() => {}}
      />
      <div className="afd-demo-bar">
        <button className="afd-demo-btn" onClick={() => setRunId((n) => n + 1)}>↻ Ещё раз</button>
        <button
          className={`afd-demo-btn ${!below ? "active" : ""}`}
          onClick={() => setBelow(false)}
        >Обычный</button>
        <button
          className={`afd-demo-btn ${below ? "active" : ""}`}
          onClick={() => setBelow(true)}
        >Купил без гринда</button>
      </div>
    </div>
  );
}
