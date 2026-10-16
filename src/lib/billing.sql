-- Additive migration; never resets existing videos or operator-edited prices.
CREATE SCHEMA IF NOT EXISTS zombievideolab_pro;
CREATE TABLE IF NOT EXISTS zombievideolab_pro.products (
 id text PRIMARY KEY, code text NOT NULL UNIQUE, name text NOT NULL, description text NOT NULL,
 product_type text NOT NULL DEFAULT 'one_time' CHECK (product_type='one_time'),
 is_active boolean NOT NULL DEFAULT true, sort_order integer NOT NULL DEFAULT 0,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS zombievideolab_pro.product_prices (
 id text PRIMARY KEY, product_id text NOT NULL REFERENCES zombievideolab_pro.products(id), code text NOT NULL UNIQUE,
 resolution text NOT NULL CHECK (resolution IN ('480p','720p')), amount_minor integer NOT NULL CHECK (amount_minor>0 AND amount_minor<=100000),
 currency text NOT NULL DEFAULT 'USD' CHECK (currency='USD'), duration_seconds integer NOT NULL DEFAULT 8 CHECK(duration_seconds=8),
 is_active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS product_prices_active_resolution_idx ON zombievideolab_pro.product_prices(resolution) WHERE is_active;
CREATE TABLE IF NOT EXISTS zombievideolab_pro.billing_orders (
 id text PRIMARY KEY, code varchar(32) NOT NULL UNIQUE CHECK(code ~ '^[A-F0-9]{32}$'), visitor_hash varchar(64) NOT NULL,
 product_id text NOT NULL REFERENCES zombievideolab_pro.products(id), price_id text NOT NULL REFERENCES zombievideolab_pro.product_prices(id),
 product_name text NOT NULL, amount_minor integer NOT NULL CHECK(amount_minor>0), currency text NOT NULL CHECK(currency='USD'),
 resolution text NOT NULL CHECK(resolution IN ('480p','720p')), aspect_ratio text NOT NULL CHECK(aspect_ratio IN ('9:16','16:9')),
 video_provider text NOT NULL CHECK(video_provider IN ('poyo','yir')), provider text NOT NULL DEFAULT 'stripe',
 environment text NOT NULL CHECK(environment IN ('test','live')),
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','paid','expired','failed','refunded','disputed')),
 generation_status text NOT NULL DEFAULT 'waiting' CHECK(generation_status IN ('waiting','ready','preparing','submitting','running','finished','failed','unknown')),
 provider_payment_id text UNIQUE, paid_at timestamptz, refunded_at timestamptz, refund_amount_minor integer NOT NULL DEFAULT 0,
 input_photos jsonb NOT NULL DEFAULT '[]', input_expires_at timestamptz NOT NULL, error text,
 attempts integer NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
-- Nullable for legacy orders; assigned from server-side moderation, then reused on retries.
ALTER TABLE zombievideolab_pro.billing_orders ADD COLUMN IF NOT EXISTS prompt_scenario text
 CHECK(prompt_scenario IN ('female_infected','male_infected','gender_neutral'));
CREATE INDEX IF NOT EXISTS billing_orders_visitor_idx ON zombievideolab_pro.billing_orders(visitor_hash,created_at DESC);
CREATE INDEX IF NOT EXISTS billing_orders_worker_idx ON zombievideolab_pro.billing_orders(status,generation_status,updated_at);
CREATE TABLE IF NOT EXISTS zombievideolab_pro.billing_checkouts (
 id text PRIMARY KEY, order_id text NOT NULL UNIQUE REFERENCES zombievideolab_pro.billing_orders(id), provider text NOT NULL DEFAULT 'stripe',
 environment text NOT NULL CHECK(environment IN ('test','live')), provider_checkout_id text UNIQUE, checkout_url text,
 status text NOT NULL DEFAULT 'creating' CHECK(status IN ('creating','open','complete','expired','failed')),
 expires_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS zombievideolab_pro.billing_webhook_events (
 provider text NOT NULL, provider_event_id text NOT NULL, event_type text NOT NULL, environment text NOT NULL,
 status text NOT NULL DEFAULT 'processed', created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(provider,provider_event_id)
 -- No raw webhook payload: avoids duplicating customer/email/payment PII.
);
CREATE TABLE IF NOT EXISTS zombievideolab_pro.video_generation_attempts (
 id text PRIMARY KEY, order_id text NOT NULL REFERENCES zombievideolab_pro.billing_orders(id), attempt_number integer NOT NULL,
 status text NOT NULL CHECK(status IN ('preparing','submitting','running','finished','failed','unknown')),
 provider_task_id text, error text, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(order_id,attempt_number)
);
CREATE TABLE IF NOT EXISTS zombievideolab_pro.request_limits (
 scope text NOT NULL, subject text NOT NULL, window_start timestamptz NOT NULL, count integer NOT NULL DEFAULT 1,
 PRIMARY KEY(scope,subject,window_start)
);
INSERT INTO zombievideolab_pro.products(id,code,name,description) VALUES
 ('zombie-couple','zombie-couple','Zombie Couple Video','One fictional, non-graphic 8-second zombie love story from two approved adult photos.') ON CONFLICT DO NOTHING;
INSERT INTO zombievideolab_pro.product_prices(id,product_id,code,resolution,amount_minor,currency) VALUES
 ('zombie-couple-480p','zombie-couple','zombie-couple-480p','480p',599,'USD'),
 ('zombie-couple-720p','zombie-couple','zombie-couple-720p','720p',99,'USD') ON CONFLICT DO NOTHING;

-- Revocation tombstones handle refund/dispute webhooks arriving before checkout.completed.
CREATE TABLE IF NOT EXISTS zombievideolab_pro.billing_payment_blocks (
 payment_id text NOT NULL, environment text NOT NULL, status text NOT NULL CHECK(status IN ('refunded','disputed')),
 created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(payment_id,environment)
);

ALTER TABLE zombievideolab_pro.video_jobs ADD COLUMN IF NOT EXISTS delivery_lease text;
ALTER TABLE zombievideolab_pro.video_jobs ADD COLUMN IF NOT EXISTS delivery_locked_until timestamptz;

-- Keep sandbox and live product mappings separate. Orders retain immutable snapshots.
CREATE TABLE IF NOT EXISTS zombievideolab_pro.stripe_price_mappings (
 price_id text NOT NULL REFERENCES zombievideolab_pro.product_prices(id),
 environment text NOT NULL CHECK(environment IN ('test','live')),
 stripe_product_id text NOT NULL CHECK(stripe_product_id LIKE 'prod_%'),
 stripe_price_id text NOT NULL CHECK(stripe_price_id LIKE 'price_%'),
 updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(price_id,environment), UNIQUE(environment,stripe_price_id)
);
ALTER TABLE zombievideolab_pro.billing_orders ADD COLUMN IF NOT EXISTS stripe_product_id text;
ALTER TABLE zombievideolab_pro.billing_orders ADD COLUMN IF NOT EXISTS stripe_price_id text;
