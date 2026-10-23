import nextEnv from '@next/env';
import pg from 'pg';
import Stripe from 'stripe';
import { matchesStripePrice } from '../src/lib/billing-validation.ts';
import { stripeKeyEnvironment } from '../src/lib/stripe-key.ts';

// Explicit synchronization only: routine migrations never overwrite catalog prices.
// Example: npm run stripe:configure -- --480p-price=price_... --480p-product=prod_... --720p-price=price_... --720p-product=prod_...
nextEnv.loadEnvConfig(process.cwd());
const args = Object.fromEntries(process.argv.slice(2).map(arg => {
  const at = arg.indexOf('=');
  if (!arg.startsWith('--') || at < 0) throw new Error('Use --name=value arguments');
  return [arg.slice(2, at), arg.slice(at + 1)];
}));
const templateId = args.template ?? "zombie-couple";
if (!["zombie-couple", "tiptoeing-in-my-jordans"].includes(templateId)) throw new Error("Unknown --template value");
let client;
try {
  const secret = process.env.STRIPE_SECRET_KEY?.trim();
  const environment = stripeKeyEnvironment(secret);
  if (!environment) throw new Error('A valid Stripe standard or restricted secret key is required');
  const stripe = new Stripe(secret, { timeout: 20000, maxNetworkRetries: 2 });
  const entries = [];
  for (const [resolution, defaultAmount] of [['480p', 599], ['720p', 899]]) {
    const priceId = args[`${resolution}-price`];
    const productId = args[`${resolution}-product`];
    const amount = Number(args[`${resolution}-amount`] ?? defaultAmount);
    if (!/^price_\w+$/.test(priceId ?? '') || !/^prod_\w+$/.test(productId ?? '')) {
      throw new Error(`Supply --${resolution}-price=price_... and --${resolution}-product=prod_...`);
    }
    if (!Number.isSafeInteger(amount) || amount <= 0 || amount > 100000) throw new Error('Amount must be cents between 1 and 100000');
    const price = await stripe.prices.retrieve(priceId, { expand: ['product'] });
    const expected = { stripe_price_id: priceId, stripe_product_id: productId, amount_minor: amount, currency: 'USD', environment };
    if (!matchesStripePrice(expected, price)) throw new Error(`${resolution}: Stripe product/price, amount, currency or environment mismatch; database unchanged`);
    entries.push({ resolution, ...expected });
  }
  const raw = process.env.DIRECT_PRO_URL || process.env.DATABASE_PRO_URL;
  if (!raw) throw new Error('Database configuration is required');
  const url = new URL(raw);
  const tls = url.searchParams.get('sslmode') === 'require';
  if (tls) { url.searchParams.delete('sslmode'); url.searchParams.delete('uselibpqcompat'); }
  client = new pg.Client({ connectionString: url.toString(), ...(tls ? { ssl: { rejectUnauthorized: false } } : {}), connectionTimeoutMillis: 15000 });
  await client.connect();
  await client.query('BEGIN');
  for (const entry of entries) {
    const result = await client.query(`UPDATE zombievideolab_pro.product_prices
      SET amount_minor=$2, currency='USD', updated_at=now() WHERE resolution=$1 AND product_id=$3 AND is_active RETURNING id`, [entry.resolution, entry.amount_minor, templateId]);
    if (result.rowCount !== 1) throw new Error(`Expected exactly one active ${templateId} / ${entry.resolution} price; run db:migrate first`);
    await client.query(`INSERT INTO zombievideolab_pro.stripe_price_mappings
      (price_id,environment,stripe_product_id,stripe_price_id) VALUES($1,$2,$3,$4)
      ON CONFLICT(price_id,environment) DO UPDATE SET stripe_product_id=EXCLUDED.stripe_product_id,
      stripe_price_id=EXCLUDED.stripe_price_id,updated_at=now()`,
    [result.rows[0].id, environment, entry.stripe_product_id, entry.stripe_price_id]);
  }
  await client.query('COMMIT');
  console.log(`Configured ${templateId} / ${environment} Stripe products. Existing orders were not changed.`);
  console.table(entries);
} catch (error) {
  await client?.query('ROLLBACK').catch(() => {});
  console.error(error instanceof Error ? error.message : 'Stripe configuration failed');
  process.exitCode = 1;
} finally { await client?.end(); }
