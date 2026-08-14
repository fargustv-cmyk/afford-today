# afford.today — project guide for Claude Code

afford.today is a **Telegram Mini App** that helps people decide whether they can afford a purchase
or take time for themselves, and notice when the real blocker is guilt rather than money or time.
The audience: people who HAVE money but can't let themselves buy things — from socks to a MacBook —
because of an internal "you must earn it / you don't deserve it" block.

The app catches the moment of wanting, selects a purchase or action check, lets the person make the
decision, and accumulates proof that they can trust their own judgement.

> Full product + mechanics spec lives in `SPEC.md`. Read it before implementing a feature.

---

## ⛔ Non-negotiable product rules (never violate)

1. **The user makes the decision.** The product gives a compact financial/emotional check, never a
   verdict. "Мне можно" and "Отложить" are both valid outcomes.
2. **Never make permission earnable.** No points, chores, challenges, streaks, or productivity gates
   in the core journey. Permission is not a reward for being useful.
3. **Zero shame.** No streak guilt, no red warning states, no nagging. A pause is neutral.
4. **Psychology stays under the hood.** The product is built on awareness / self-support ideas, but the
   UI NEVER shows clinical or "wound" language (no "травма", "критик", "дефицит", "терапия"). Surface
   tone is light and playful.
5. **Tone of voice = calm, direct, supportive friend.** Clear before clever; never a coach or therapist.
6. **Privacy.** Only PII stored is the Telegram user id. `check_ins.note` and feelings are private —
   never shared, never used in marketing or share cards.
7. **No dark patterns in paywalls.** No fake timers, no pre-checked consents, no "auto-agree".

If a requested change conflicts with these rules, flag it instead of implementing silently.

---

## Stack (current)

- **Frontend:** React + `@telegram-apps/sdk`, Telegram Mini App. Animations via `framer-motion`.
- **Backend:** Node.js + Fastify.
- **DB:** Upstash Redis via its REST API.
- **Bot:** Telegram Bot API webhook handled by the Fastify service.
- **Share images:** server-side SVG→PNG (`satori` + `@resvg/resvg-js`).

---

## Suggested repo structure

```
/app        Telegram Mini App (React frontend)
/api        Backend (REST/JSON), validates Telegram initData
/bot        Telegram bot (notifications, deep-links)
/shared     Types/enums shared across app+api
SPEC.md     Product + mechanics spec (source of truth)
schema.sql  Database schema
```

---

## Domain rules

- New wishes start as `active`. "Мне можно" changes the wish to `unlocked`; "Уже купил(а)" changes it
  to `purchased`.
- `intentKind = purchase | action` controls the complete journey: fields, questions, blockers and
  completion copy. Legacy records without it are purchases. Never show purchase language for actions.
- "Отложить" keeps the wish `active` and writes `postponedAt`; the card must acknowledge the pause
  instead of pretending no decision happened. A later "мне можно" remains available.
- Write exactly one `permission_events` row per wish. Allowing creates it; purchasing later enriches
  the same row with the price.
- The Freedom screen measures decisions and evidence of self-trust, not money spent.
- Legacy points/steps fields remain in storage only for backward compatibility and must not drive UI.
- Auth: validate `initData` HMAC and freshness server-side. State is server-authoritative; Telegram
  CloudStorage is for non-sensitive cache only.
- Aggregate funnel counters are available only through `/api/admin/product-metrics` with the
  `CRON_SECRET` bearer token. Never add titles, prices, notes, or Telegram ids to these counters.

---

## Conventions

- **UI copy: Russian.** Code, comments, identifiers, commit messages: **English**.
- Keep all user-facing strings in one place (an i18n map) so tone can be tuned without hunting.
- Cold start is a feature: first screen must render instantly; onboarding stays light.
- Put the most polish into the **"Можно!" unlock screen** — it's the emotional core and the viral driver.

---

## MVP scope

**In:** one desire list · purchase/action intent · link parsing for purchases · adaptive three-question ritual · optional blocker naming ·
"Можно!" moment · share landing · post-purchase reaction · evidence screen · initData auth · aggregate
funnel analytics.

**Out:** subscriptions · points/challenges in the core flow · multiple lists · themes · wrapped recap ·
gifted tokens · pattern detection from check-ins.
