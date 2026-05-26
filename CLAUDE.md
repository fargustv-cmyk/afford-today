# afford.today — project guide for Claude Code

afford.today is a **Telegram Mini App** that gives people *permission to spend money on themselves*.
The audience: people who HAVE money but can't let themselves buy things — from socks to a MacBook —
because of an internal "you must earn it / you don't deserve it" block.

The app catches the moment of wanting, helps them reach an unlock ("Можно!"), and accumulates proof of
how much they've allowed themselves over time (the Map / "счёт свободы").

> Full product + mechanics spec lives in `SPEC.md`. Read it before implementing a feature.

---

## ⛔ Non-negotiable product rules (never violate)

1. **Never block a purchase.** A "Уже купил(а)" action is always available on any wish. Bypassing the
   points bar is NOT cheating — it is celebrated (it's the goal).
2. **Zero shame.** No broken-streak guilt, no red warning states, no nagging. A missed day is neutral.
   The internal name "streak" is surfaced to users as "дни на своей стороне".
3. **Essentials are never gated.** `type = 'essential'` (food, meds, hygiene) ⇒ `points_required = 0`,
   unlocked immediately.
4. **Psychology stays under the hood.** The product is built on awareness / self-support ideas, but the
   UI NEVER shows clinical or "wound" language (no "травма", "критик", "дефицит", "терапия"). Surface
   tone is light and playful.
5. **Tone of voice = cheeky supportive friend.** "Да заслужил уже, бери", not a coach or therapist.
6. **Privacy.** Only PII stored is the Telegram user id. `check_ins.note` and feelings are private —
   never shared, never used in marketing or share cards.
7. **No dark patterns in paywalls.** No fake timers, no pre-checked consents, no "auto-agree".

If a requested change conflicts with these rules, flag it instead of implementing silently.

---

## Stack (current)

- **Frontend:** React + `@telegram-apps/sdk`, Telegram Mini App. Animations via `framer-motion`.
- **Backend:** <Node (Fastify) | Python (FastAPI)> — pick one, keep it consistent.
- **DB:** PostgreSQL (schema in `schema.sql`).
- **Bot:** <grammY (Node) | aiogram (Python)> — match backend language.
- **Share images:** server-side SVG→PNG (`satori` + `@resvg/resvg-js`).

> Decisions still open: backend language, default price brackets `T1/T2` per main currency (see SPEC §4).

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

## Domain rules (don't reinvent — see SPEC §4 for full table)

- Step points: small = 10, medium = 25 (default), large = 50. Micro-permission = 15.
- Threshold: `essential` = 0, `need` = 20, `want` = 100 / 300 / 800 by price bracket.
- On unlock or "Уже купил": set status, write a `permission_events` row. If `points_earned <
  points_required` at that moment ⇒ `below_threshold = true` (the self-support metric).
- Auth: validate `initData` HMAC server-side. State is server-authoritative; never trust the client
  for points/unlock. Telegram CloudStorage is for non-sensitive cache only.

---

## Conventions

- **UI copy: Russian.** Code, comments, identifiers, commit messages: **English**.
- Keep all user-facing strings in one place (an i18n map) so tone can be tuned without hunting.
- Cold start is a feature: first screen must render instantly; onboarding stays light.
- Put the most polish into the **"Можно!" unlock screen** — it's the emotional core and the viral driver.

---

## MVP scope

**In:** wishlist (+ link parsing) · essential/need/want types · steps + points (fixed tiers) ·
"Можно!" screen + share card · post-purchase reaction · basic Map (count + freedom score + domains) ·
daily bot nudge · initData auth.

**Out (fields exist, don't build yet):** Stars payments/subscription · melting threshold
(`self_permission_factor`) · wrapped recap · gifted tokens · pattern detection from check-ins.
