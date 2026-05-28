// "Можно!" — emotional core of the app, per SPEC §3.5. Visual reference lives
// in /reference/MozhnoScreen.jsx. This is the production port: same palette,
// same spinning seal, same single-burst confetti, same staggered reveal,
// stripped of demo controls and wired to live props.

import { useEffect, useRef } from 'react';
import type { Wish } from '@afford/shared';
import { ru } from '../i18n/ru';

interface Props {
  wish: Wish;
  belowThreshold: boolean;
  hideShare?: boolean;
  subtitleOverride?: string;
  onShare: () => void;
  onContinue: () => void;
}

export function Mozhno({
  wish,
  belowThreshold,
  hideShare,
  subtitleOverride,
  onShare,
  onContinue
}: Props) {
  return (
    <div className="mozhno-overlay" role="dialog" aria-modal="true">
      <ConfettiCanvas />
      <div className="mozhno-col">
        <Seal />
        {belowThreshold && (
          <span className="mozhno-pill mozhno-reveal" style={{ animationDelay: '.25s' }}>
            {ru.mozhno_pill_below}
          </span>
        )}
        <h1 className="mozhno-title mozhno-reveal" style={{ animationDelay: '.30s' }}>
          {ru.mozhno_title}
        </h1>
        <p className="mozhno-sub mozhno-reveal" style={{ animationDelay: '.42s' }}>
          {subtitleOverride ?? (belowThreshold ? ru.mozhno_sub_below : ru.mozhno_sub_normal)}
        </p>

        <div className="mozhno-card mozhno-reveal" style={{ animationDelay: '.54s' }}>
          <div className="mozhno-thumb">
            {wish.imageUrl ? <img src={wish.imageUrl} alt="" /> : <span aria-hidden>✦</span>}
          </div>
          <div>
            <div className="mozhno-cardtitle">{wish.title}</div>
            {wish.price != null && (
              <div className="mozhno-cardprice">
                {wish.price.toLocaleString('ru-RU')} {wish.currency}
              </div>
            )}
          </div>
        </div>

        <div className="mozhno-actions mozhno-reveal" style={{ animationDelay: '.66s' }}>
          {!hideShare && (
            <button className="mozhno-btn mozhno-btn-primary" onClick={onShare}>
              {ru.mozhno_share}
            </button>
          )}
          <button
            className={`mozhno-btn ${hideShare ? 'mozhno-btn-primary' : 'mozhno-btn-ghost'}`}
            onClick={onContinue}
          >
            {ru.mozhno_continue}
          </button>
        </div>
      </div>
    </div>
  );
}

function Seal() {
  return (
    <div className="mozhno-seal" aria-hidden>
      <svg viewBox="0 0 100 100">
        <defs>
          <path id="mz-ring" d="M50,12 A38,38 0 1,1 49.99,12" />
        </defs>
        <g className="mozhno-seal-ring">
          <text
            fontFamily="Unbounded, sans-serif"
            fontSize="7.2"
            fontWeight={700}
            fill="#7A6450"
            letterSpacing="1.2"
          >
            <textPath href="#mz-ring" startOffset="0">
              AFFORD.TODAY ✦ РАЗРЕШЕНО ✦ AFFORD.TODAY ✦ РАЗРЕШЕНО ✦
            </textPath>
          </text>
        </g>
        <circle cx="50" cy="50" r="22" fill="#E0533A" />
        <path
          d="M40 50 l6.5 6.5 L62 41"
          fill="none"
          stroke="#fff"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function ConfettiCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
    };
    resize();
    const W = () => canvas.width;
    const H = () => canvas.height;
    const colors = ['#E0533A', '#E79A33', '#D98368', '#2F9C8B', '#FBF3E7'];
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
      c: colors[(Math.random() * colors.length) | 0]!,
      life: 0
    }));
    let raf = 0;
    let t0 = performance.now();
    const tick = (t: number) => {
      const dt = Math.min(2, (t - t0) / 16.67);
      t0 = t;
      ctx.clearRect(0, 0, W(), H());
      let alive = false;
      for (const p of parts) {
        p.life += dt;
        p.vy += p.g * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        p.vx *= 0.99;
        const fade = Math.max(0, 1 - p.life / 150);
        if (p.y < H() + 40 && fade > 0) alive = true;
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6);
        ctx.restore();
      }
      if (alive) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={ref} className="mozhno-canvas" />;
}
