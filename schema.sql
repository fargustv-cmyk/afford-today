-- afford.today — database schema (PostgreSQL)
-- MVP-aligned. Fields marked "post-MVP" exist now so you don't need migrations later.
-- Requires: pgcrypto (gen_random_uuid). Run: CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================== ENUM types ==============================
CREATE TYPE subscription_status AS ENUM ('free', 'active', 'expired');
CREATE TYPE wish_type           AS ENUM ('essential', 'need', 'want');
CREATE TYPE life_domain         AS ENUM ('clothes', 'leisure', 'comfort', 'health', 'joy', 'food', 'other');
CREATE TYPE wish_status         AS ENUM ('active', 'unlocked', 'purchased', 'archived');
CREATE TYPE step_kind           AS ENUM ('step', 'micro_permission');
CREATE TYPE feeling             AS ENUM ('zero_guilt', 'joy', 'scared_but_good', 'empty', 'guilt');

-- ============================== users ==============================
CREATE TABLE users (
  id                     BIGINT PRIMARY KEY,                 -- Telegram user id (from validated initData)
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  currency               CHAR(3)     NOT NULL DEFAULT 'USD', -- display only
  locale                 TEXT        NOT NULL DEFAULT 'ru',
  subscription_status    subscription_status NOT NULL DEFAULT 'free',
  subscription_until     TIMESTAMPTZ,                        -- post-MVP (Stars payments)
  gifted_tokens          INTEGER     NOT NULL DEFAULT 0,     -- post-MVP ("подаренные разрешения")
  self_permission_factor NUMERIC(4,3) NOT NULL DEFAULT 1.000 -- "тающий порог" multiplier, floored at 0.400 (post-MVP)
                         CHECK (self_permission_factor BETWEEN 0.400 AND 1.000),
  settings               JSONB       NOT NULL DEFAULT '{}'::jsonb -- {notifications_enabled, nudge_time, theme}
);

-- ============================== wishes ==============================
CREATE TABLE wishes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           TEXT        NOT NULL,
  image_url       TEXT,                                   -- parsed from source_url OG tags
  source_url      TEXT,
  price           NUMERIC(12,2),
  currency        CHAR(3)     NOT NULL DEFAULT 'USD',
  type            wish_type   NOT NULL DEFAULT 'want',
  domain          life_domain NOT NULL DEFAULT 'other',
  points_required INTEGER     NOT NULL DEFAULT 0,          -- computed on create (see SPEC §4)
  points_earned   INTEGER     NOT NULL DEFAULT 0,
  status          wish_status NOT NULL DEFAULT 'active',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  unlocked_at     TIMESTAMPTZ,
  purchased_at    TIMESTAMPTZ,
  CHECK (points_required >= 0 AND points_earned >= 0)
);
CREATE INDEX idx_wishes_user_status ON wishes (user_id, status);

-- ============================== steps ==============================
CREATE TABLE steps (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    BIGINT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wish_id    UUID      REFERENCES wishes(id) ON DELETE CASCADE, -- NULL = standalone micro-permission
  title      TEXT      NOT NULL,
  kind       step_kind NOT NULL DEFAULT 'step',
  points     INTEGER   NOT NULL DEFAULT 25,                     -- small=10 / medium=25 / large=50
  done       BOOLEAN   NOT NULL DEFAULT false,
  done_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (points > 0)
);
CREATE INDEX idx_steps_wish      ON steps (wish_id);
CREATE INDEX idx_steps_user_done ON steps (user_id, done);

-- ============================== check_ins ==============================
-- One per purchase. `note` is private: never shared, never used for marketing.
CREATE TABLE check_ins (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wish_id    UUID    NOT NULL REFERENCES wishes(id) ON DELETE CASCADE,
  feeling    feeling NOT NULL,
  note       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_checkins_wish ON check_ins (wish_id);

-- ============================== permission_events ==============================
-- The source of truth for the Map / "счёт свободы". One row per "I allowed myself" moment.
CREATE TABLE permission_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wish_id         UUID        REFERENCES wishes(id) ON DELETE SET NULL,
  value           NUMERIC(12,2) NOT NULL DEFAULT 0,  -- amount spent on self (0 for non-purchase permissions)
  domain          life_domain NOT NULL DEFAULT 'other',
  below_threshold BOOLEAN     NOT NULL DEFAULT false, -- allowed BEFORE bar filled = self-support "muscle"
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_perm_user_created ON permission_events (user_id, created_at);
CREATE INDEX idx_perm_user_domain  ON permission_events (user_id, domain);

-- ============================== micro_permission_templates ==============================
-- Seeded content library shown when a user's step list is empty.
CREATE TABLE micro_permission_templates (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT        NOT NULL,
  suggested_points INTEGER     NOT NULL DEFAULT 15,
  domain           life_domain NOT NULL DEFAULT 'joy',
  is_premium       BOOLEAN     NOT NULL DEFAULT false  -- post-MVP curated packs
);

-- ---- example seed (RU copy) ----
INSERT INTO micro_permission_templates (title, suggested_points, domain) VALUES
  ('Возьми сегодня кофе навынос',              15, 'joy'),
  ('Поезжай на такси, не жди автобус',         20, 'comfort'),
  ('Закажи то блюдо, что реально хочешь',      15, 'food'),
  ('Купи носки, которые давно откладывал(а)',  10, 'clothes'),
  ('Запишись на то, что приносит удовольствие',25, 'leisure');

-- ============================== helpful views (optional) ==============================
-- Freedom score + counts per user, for the Map screen.
CREATE VIEW user_freedom AS
SELECT
  user_id,
  COUNT(*)                                            AS total_permissions,
  COALESCE(SUM(value), 0)                             AS freedom_score,
  COUNT(*) FILTER (WHERE below_threshold)             AS self_permissions,
  ROUND(
    COUNT(*) FILTER (WHERE below_threshold)::numeric
    / NULLIF(COUNT(*), 0), 3)                         AS self_permission_ratio
FROM permission_events
GROUP BY user_id;
