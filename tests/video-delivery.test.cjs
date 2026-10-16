const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const ts = require('typescript');
Module._extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText, filename);
const code = 'A'.repeat(32);
let job, visitor, paid, available, trusted, updates, signedDownload;
const source = 'https://provider.example/video.mp4';
const backup = 'https://backup.example/video.mp4';
const stubs = {
  'next/server': { after: () => {} },
  '@/lib/video-jobs': { findJob: async () => job, videoAvailable: () => available },
  '@/lib/billing-orders': { orderFor: async () => ({ status: paid ? 'paid' : 'refunded' }) },
  '@/lib/video-visitor': { visitorFrom: () => visitor },
  '@/lib/r2': { getGeneratedVideoUrl: async (_key, download) => { signedDownload = download; return backup; } },
  '@/lib/provider-video': { checkedProviderVideoUrl: async value => { if (!trusted) throw new Error('Untrusted host'); return value; } },
  '@/lib/video-delivery': { archiveVideo: async () => {} },
};
const load = Module._load;
Module._load = function(name, ...args) {
  if (name === 'server-only') return {};
  if (Object.hasOwn(stubs, name)) return stubs[name];
  if (name === './db') return { pool: () => ({ query: async (sql, params) => { updates.push({sql, params}); return {rows:[]}; } }) };
  return load.call(this, name, ...args);
};
const { GET } = require('../src/app/api/video/file/route.ts');
const { saveStoredVideo } = require('../src/lib/video-jobs.ts');
function reset() {
  job = { code, provider: 'yir', status: 'finished', video_url: source, r2_key: `generated/${code}.mp4` };
  visitor = 'visitor'; paid = true; available = true; trusted = true; updates = [];
}
const request = query => new Request(`https://site.example/api/video/file?code=${code}${query || ''}`);

test('playback prefers the provider but downloads use the archived attachment', async () => {
  reset();
  const playback = await GET(request());
  assert.equal(playback.status, 302);
  assert.equal(playback.headers.get('location'), source);
  const download = await GET(request('&download=1'));
  assert.equal(download.status, 302);
  assert.equal(download.headers.get('location'), backup);
  assert.equal(signedDownload, true);
});
test('R2 remains a fallback for browser playback errors, legacy jobs, or an untrusted provider source', async () => {
  reset();
  assert.equal((await GET(request('&source=r2'))).headers.get('location'), backup);
  job.video_url = null;
  assert.equal((await GET(request())).headers.get('location'), backup);
  job.video_url = source; trusted = false;
  assert.equal((await GET(request())).headers.get('location'), backup);
  job.r2_key = null;
  assert.equal((await GET(request())).status, 503);
});
test('provider-first playback still enforces visitor, payment and retention checks', async () => {
  reset(); visitor = null;
  assert.equal((await GET(request())).status, 404);
  reset(); paid = false;
  assert.equal((await GET(request())).status, 404);
  reset(); available = false;
  assert.equal((await GET(request())).status, 404);
});
test('successful R2 archival preserves the provider URL and original completion time', async () => {
  reset();
  await saveStoredVideo(visitor, code, job.r2_key);
  assert.equal(updates.length, 1);
  assert.doesNotMatch(updates[0].sql, /video_url\s*=\s*NULL/i);
  assert.match(updates[0].sql, /completed_at=COALESCE\(completed_at,now\(\)\)/);
  assert.deepEqual(updates[0].params, [code, visitor, job.r2_key]);
});
