const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const { spawnSync } = require('node:child_process');
const ts = require('typescript');

Module._extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText, filename);
const originalLoad = Module._load;
Module._load = function (name, ...args) { return name === 'server-only' ? {} : originalLoad.call(this, name, ...args); };
const { stripeConfigured, stripeEnvironment, stripeClient } = require('../src/lib/stripe.ts');
const key = prefix => prefix + 'a'.repeat(32);

function withConfig(run) {
  const names = ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'STRIPE_ENABLED'];
  const saved = Object.fromEntries(names.map(name => [name, process.env[name]]));
  Object.assign(process.env, { STRIPE_ENABLED: 'true', STRIPE_WEBHOOK_SECRET: key('whsec_') });
  try { run(); } finally {
    for (const name of names) if (saved[name] === undefined) delete process.env[name]; else process.env[name] = saved[name];
  }
}

test('standard and restricted keys select the correct environment and construct an offline SDK client', () => withConfig(() => {
  for (const [prefix, environment] of [['rk_live_', 'live'], ['rk_test_', 'test'], ['sk_live_', 'live'], ['sk_test_', 'test']]) {
    process.env.STRIPE_SECRET_KEY = ` ${key(prefix)} `;
    assert.equal(stripeConfigured(), true, prefix);
    assert.equal(stripeEnvironment(), environment, prefix);
    assert.ok(stripeClient()); // Constructor only: no Stripe requests or payments.
  }
}));

test('invalid keys fail closed rather than falling back to test mode, and existing payment gates remain', () => withConfig(() => {
  for (const invalid of ['', key('pk_live_'), 'rk_live_short', key('rk_live_') + '\nextra', key('sk_unknown_')]) {
    process.env.STRIPE_SECRET_KEY = invalid;
    assert.equal(stripeConfigured(), false);
    assert.throws(() => stripeEnvironment(), /Stripe.*configur/i);
    assert.throws(() => stripeClient(), /Stripe.*configur/i);
  }
  process.env.STRIPE_SECRET_KEY = key('rk_live_');
  process.env.STRIPE_ENABLED = 'false';
  assert.equal(stripeConfigured(), false);
  process.env.STRIPE_ENABLED = 'true';
  process.env.STRIPE_WEBHOOK_SECRET = '';
  assert.equal(stripeConfigured(), false);
}));

test('catalog configuration accepts all four server key types before validating arguments, without network or database writes', () => {
  for (const prefix of ['rk_live_', 'rk_test_', 'sk_live_', 'sk_test_']) {
    const result = spawnSync(process.execPath, ['scripts/configure-stripe-products.mjs'], {
      cwd: path.resolve(__dirname, '..'),
      env: { ...process.env, STRIPE_SECRET_KEY: key(prefix) },
      encoding: 'utf8', timeout: 20000,
    });
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /Supply --480p-price=/, prefix);
    assert.doesNotMatch(result.stderr, /A Stripe secret key is required/, prefix);
  }
});

test('the public billing endpoint stays readable when Stripe is not configured', async () => {
  const stubs = {
    'next/server': { NextResponse: { json: (body, init) => Response.json(body, init) } },
    '@/lib/billing-catalog': { catalog: async () => [], consumeLimit: async () => false },
    '@/lib/billing-orders': { ordersFor: async () => [] },
    '@/lib/video-visitor': { visitorFrom: () => null, newVisitor: () => {} },
    '@/lib/billing-ready': { checkoutReady: () => false },
    '@/lib/stripe': { stripeConfigured: () => false, stripeEnvironment: () => { throw new Error('Stripe is not configured'); } },
  };
  const load = Module._load;
  let GET;
  Module._load = function (name, ...args) { return Object.hasOwn(stubs, name) ? stubs[name] : load.call(this, name, ...args); };
  try { ({ GET } = require('../src/app/api/billing/route.ts')); } finally { Module._load = load; }
  const response = await GET(new Request('https://example.com/api/billing'));
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.enabled, false);
  assert.equal(body.testMode, false);
  assert.deepEqual(body.prices, []);
});
