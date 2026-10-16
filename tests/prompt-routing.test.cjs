const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const ts = require('typescript');

// Small offline checks only: never invoke a paid video API or the real moderation endpoint.
Module._extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText, filename);
const originalLoad = Module._load;
Module._load = function (name, ...args) { return name === 'server-only' ? {} : originalLoad.call(this, name, ...args); };

test('both providers select just one English template and honor the uploaded roles and aspect ratio', () => {
  const { makeSeedanceInput } = require('../src/lib/poyo.ts');
  const { makeYirRequest } = require('../src/lib/yir.ts');
  const { selectPromptScenario } = require('../src/lib/video-prompt.ts');
  assert.equal(selectPromptScenario([{ appearance: 'female' }, { appearance: 'male' }]), 'female_infected');
  assert.equal(selectPromptScenario([{ appearance: 'male' }, { appearance: 'female' }]), 'male_infected');
  for (const pair of [['unknown', 'male'], ['male', 'male'], ['female', 'female']]) {
    assert.equal(selectPromptScenario(pair.map(appearance => ({ appearance }))), 'gender_neutral');
  }
  const ids = ['file_12345678-1234-4123-8123-123456789abc', 'file_87654321-4321-4321-8321-cba987654321'];
  const oldSubjects = process.env.YIR_REFERENCE_SUBJECTS;
  try {
    for (const subjects of ['true', 'false']) {
      process.env.YIR_REFERENCE_SUBJECTS = subjects;
      for (const scenario of ['female_infected', 'male_infected', 'gender_neutral']) {
        const poyo = makeSeedanceInput(['https://example.com/1.jpg', 'https://example.com/2.jpg'], '480p', '16:9', scenario);
        const yir = makeYirRequest(ids, '720p', '16:9', scenario);
        for (const prompt of [poyo.prompt, yir.input.prompt]) {
          assert.match(prompt, /horizontal 16:9/);
          assert.doesNotMatch(prompt, /vertical 9:16|english[12]:/i);
          assert.match(prompt, /original clothing/i);
          assert.match(prompt, /jewelry/i);
          assert.match(prompt, /first reference image.*infected/i);
          assert.match(prompt, /second reference image.*rescuer/i);
          if (scenario === 'female_infected') {
            assert.match(prompt, /Reference Image 1 is the WOMAN/);
            assert.doesNotMatch(prompt, /Reference Image 1 is the MAN/);
          } else if (scenario === 'male_infected') {
            assert.match(prompt, /Reference Image 1 is the MAN/);
            assert.doesNotMatch(prompt, /Reference Image 1 is the WOMAN/);
          } else assert.doesNotMatch(prompt, /girlfriend|boyfriend|\bwoman\b|\bman\b/i);
        }
        assert.deepEqual(poyo.reference_image_urls, ['https://example.com/1.jpg', 'https://example.com/2.jpg']);
        assert.deepEqual(yir.input.references.map(ref => ref.file_id), ids);
        assert.equal(yir.input.references[0].subject, subjects === 'true' ? 'Image1' : undefined);
      }
    }
  } finally { if (oldSubjects === undefined) delete process.env.YIR_REFERENCE_SUBJECTS; else process.env.YIR_REFERENCE_SUBJECTS = oldSubjects; }
});

test('one non-thinking moderation request returns appearance while safety remains fail-closed', async () => {
  const { moderatePortraits, ImageModerationError } = require('../src/lib/image-moderation.ts');
  const sharp = require('sharp');
  const image = await sharp({ create: { width: 8, height: 8, channels: 3, background: '#cccccc' } }).jpeg().toBuffer();
  const photo = new File([image], 'test.jpg', { type: 'image/jpeg' });
  const savedFetch = global.fetch;
  const env = Object.fromEntries(['ANTHROPIC_AUTH_TOKEN', 'ANTHROPIC_BASE_URL', 'ANTHROPIC_MODEL'].map(k => [k, process.env[k]]));
  Object.assign(process.env, { ANTHROPIC_AUTH_TOKEN: 'offline-test', ANTHROPIC_BASE_URL: 'https://offline.example', ANTHROPIC_MODEL: 'offline-model' });
  let calls = 0, response = [{ decision: 'allow', category: 'none', appearance: 'male' }];
  global.fetch = async (_url, options) => {
    calls++;
    const body = JSON.parse(options.body);
    assert.deepEqual(body.thinking, { type: 'disabled' });
    assert.match(body.system, /appearance/);
    assert.match(body.system, /Do not reject an otherwise adult-looking portrait merely because/i);
    assert.match(body.system, /age uncertainty alone must not block/i);
    assert.doesNotMatch(body.system, /unambiguously adult|age seems possibly under 18/i);
    return Response.json({ stop_reason: 'end_turn', content: [{ type: 'text', text: JSON.stringify({ images: response }) }] });
  };
  try {
    assert.equal((await moderatePortraits([photo]))[0].appearance, 'male');
    assert.equal(calls, 1);
    response = [{ decision: 'allow', category: 'none', appearance: 'invalid' }];
    assert.equal((await moderatePortraits([photo]))[0].appearance, 'unknown');
    response = [{ decision: 'uncertain', category: 'uncertain_age', appearance: 'female', age_assessment: 'uncertain', content_safety: 'clear' }];
    const ageUncertain = await moderatePortraits([photo]);
    assert.equal(ageUncertain[0].decision, 'allow');
    assert.equal(ageUncertain[0].category, 'none');
    assert.equal(ageUncertain[0].appearance, 'female');
    response = [{ decision: 'block', category: 'uncertain_age', appearance: 'female', age_assessment: 'uncertain', content_safety: 'clear' }];
    assert.equal((await moderatePortraits([photo]))[0].decision, 'allow');
    for (const category of ['nudity', 'sexual_content', 'graphic_violence']) {
      for (const decision of ['block', 'uncertain']) {
        response = [{ decision, category, appearance: 'female' }];
        await assert.rejects(moderatePortraits([photo]), error => error instanceof ImageModerationError && error.status === 422);
      }
    }
    response = [{ decision: 'uncertain', category: 'uncertain_age', appearance: 'female', age_assessment: 'uncertain', content_safety: 'uncertain' }];
    await assert.rejects(moderatePortraits([photo]), error => error instanceof ImageModerationError && error.status === 422);
    response = [{ decision: 'uncertain', category: 'uncertain_age', appearance: 'female' }];
    await assert.rejects(moderatePortraits([photo]), error => error instanceof ImageModerationError && error.status === 422);
    response = [{ decision: 'allow', category: 'none', appearance: 'female', age_assessment: 'clear_minor', content_safety: 'clear' }];
    await assert.rejects(moderatePortraits([photo]), error => error instanceof ImageModerationError && error.status === 422);
    response = [{ decision: 'allow', category: 'none', appearance: 'female', age_assessment: 'uncertain', content_safety: 'blocked' }];
    await assert.rejects(moderatePortraits([photo]), error => error instanceof ImageModerationError && error.status === 503);
    response = [{ decision: 'block', category: 'minor', appearance: 'female' }];
    await assert.rejects(moderatePortraits([photo]), error => error instanceof ImageModerationError && error.status === 422);
    response = [{ decision: 'allow', category: 'nudity', appearance: 'female' }];
    await assert.rejects(moderatePortraits([photo]), error => error instanceof ImageModerationError && error.status === 503);
  } finally {
    global.fetch = savedFetch;
    for (const [key, value] of Object.entries(env)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
  }
});

test('paid orders persist the server-selected scenario and keep it on retry, including legacy orders', async () => {
  const vm = require('node:vm');
  const path = require('node:path');
  function load(relative, mocks) {
    const exports = {};
    const output = ts.transpileModule(fs.readFileSync(relative, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    vm.runInNewContext(output, { exports, process, Date, require(name) {
      if (name === 'server-only') return {};
      if (Object.hasOwn(mocks, name)) return mocks[name];
      throw new Error(`Unexpected dependency: ${name}`);
    } }, { filename: path.resolve(relative) });
    return exports;
  }
  const { selectPromptScenario } = require('../src/lib/video-prompt.ts');
  const photos = [{ key: 'first' }, { key: 'second' }];
  let savedScenario;
  const orders = load('src/lib/billing-orders.ts', {
    'node:crypto': { randomBytes: () => Buffer.alloc(16) },
    './db': { pool: () => ({ query: async (sql, params) => {
      assert.match(sql, /input_photos=\$2,prompt_scenario=\$3/);
      savedScenario = params[2];
      return { rowCount: 1 };
    } }) },
    './stripe': {}, './billing-validation': {}, './video-provider': {},
    './r2': { putInputPhoto: async (_id, index) => photos[index], deleteInputPhotos: async () => {} },
  });
  const saved = await orders.saveOrderPhotos({ id: 'order', status: 'pending' }, ['first', 'second'], 'male_infected');
  assert.equal(savedScenario, 'male_infected');
  assert.equal(saved.prompt_scenario, 'male_infected');

  for (const initialScenario of ['male_infected', null]) {
    const order = { id: 'order', code: 'A'.repeat(32), status: 'paid', generation_status: 'failed', attempts: 1,
      input_expires_at: new Date(Date.now() + 60000), input_photos: photos, prompt_scenario: initialScenario,
      resolution: '480p', aspect_ratio: '16:9', video_provider: 'yir' };
    let passedScenario, moderationCalls = 0;
    const query = async (sql, params) => {
      if (sql.includes('FOR UPDATE')) return { rows: [order] };
      if (sql.includes('count(*)')) return { rows: [{ n: 0 }] };
      if (sql.includes("generation_status='preparing'" ) && sql.includes('RETURNING *')) {
        order.attempts++;
        return { rows: [order] };
      }
      if (sql.includes('COALESCE(prompt_scenario,$3)')) {
        assert.equal(params[2], initialScenario ?? 'female_infected');
        order.prompt_scenario ??= params[2];
        return { rowCount: 1, rows: [{ prompt_scenario: order.prompt_scenario }] };
      }
      return { rowCount: 1, rows: [] };
    };
    const generation = load('src/lib/paid-generation.ts', {
      './db': { pool: () => ({ query, connect: async () => ({ query, release() {} }) }) },
      './billing-orders': { randomId: () => 'attempt', orderById: async () => order },
      './r2': { readInputPhotos: async () => ['first', 'second'] },
      './image-moderation': { moderatePortraits: async () => {
        moderationCalls++;
        return [{ appearance: 'female' }, { appearance: 'male' }];
      }, ImageModerationError: class extends Error {} },
      './video-provider': { configured: () => true, submitForProvider: async (...args) => {
        passedScenario = args[5];
        assert.deepEqual(args[1], ['first', 'second']);
        return 'offline-task';
      } },
      './video-prompt': { selectPromptScenario }, './video-access': { enabled: () => true },
    });
    await generation.startPaidOrder('order', true);
    assert.equal(moderationCalls, 1);
    assert.equal(passedScenario, initialScenario ?? 'female_infected');
  }
});
