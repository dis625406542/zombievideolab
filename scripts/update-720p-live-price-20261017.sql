-- Explicit, one-time production catalog update authorized on 2026-10-17.
-- Run against the configured production database; routine migrations do not apply this file.
-- Only the active 720p catalog amount and its live Stripe mapping are changed.
-- Existing orders retain their original amounts and Stripe Price IDs. 480p is unchanged.
-- The shared catalog amount also appears in local test mode; its test Stripe mapping is not changed.
BEGIN;
DO $$
DECLARE
  active_price_id text;
  current_amount integer;
  current_product text;
  current_stripe_price text;
BEGIN
  SELECT id, amount_minor INTO STRICT active_price_id, current_amount
  FROM zombievideolab_pro.product_prices
  WHERE resolution = '720p' AND is_active AND currency = 'USD'
  FOR UPDATE;

  SELECT stripe_product_id, stripe_price_id INTO STRICT current_product, current_stripe_price
  FROM zombievideolab_pro.stripe_price_mappings
  WHERE price_id = active_price_id AND environment = 'live'
  FOR UPDATE;

  IF current_product <> 'prod_VS1fHFYOCvvI7M' THEN
    RAISE EXCEPTION 'Unexpected 720p live Stripe product; no changes made';
  END IF;
  IF current_amount NOT IN (99, 899)
    OR current_stripe_price NOT IN ('price_1URCtPLzNDgCYzhl3m7A3dA8', 'price_1URDwELzNDgCYzhlmIxki9Bo') THEN
    RAISE EXCEPTION 'Unexpected 720p catalog state; no changes made';
  END IF;

  UPDATE zombievideolab_pro.product_prices
  SET amount_minor = 899, updated_at = now()
  WHERE id = active_price_id AND amount_minor <> 899;

  UPDATE zombievideolab_pro.stripe_price_mappings
  SET stripe_price_id = 'price_1URDwELzNDgCYzhlmIxki9Bo', updated_at = now()
  WHERE price_id = active_price_id AND environment = 'live'
    AND stripe_price_id <> 'price_1URDwELzNDgCYzhlmIxki9Bo';
END $$;
COMMIT;
