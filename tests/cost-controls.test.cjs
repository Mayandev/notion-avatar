const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');

function loadSource(relativePath, imports = {}, globals = {}) {
  const file = path.join(__dirname, '..', relativePath);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(code, {
    module,
    exports: module.exports,
    require(name) {
      if (Object.hasOwn(imports, name)) return imports[name];
      throw new Error(`Unexpected import in isolated test: ${name}`);
    },
    process: { env: {} },
    console,
    ...globals,
  }, { filename: file });
  return module.exports;
}

test('history signs a page once, deduplicates paths and preserves partial failures', async () => {
  const { addSignedAvatarUrls } = loadSource('src/lib/avatar-history.ts');
  let calls = 0;
  const client = { storage: { from(bucket) {
    assert.equal(bucket, 'generated-avatars');
    return { async createSignedUrls(paths, expiresIn) {
      calls++;
      assert.deepEqual(Array.from(paths), ['u/a.jpg', 'u/missing.jpg']);
      assert.equal(expiresIn, 3600);
      // Return out of order: mapping must use path, never array position.
      return { data: [
        { path: 'u/missing.jpg', signedUrl: null, error: 'not found' },
        { path: 'u/a.jpg', signedUrl: 'https://example.test/signed/a', error: null },
      ], error: null };
    } };
  } } };
  const input = [
    { id: 1, image_path: 'u/a.jpg' },
    { id: 2, image_path: 'u/missing.jpg' },
    { id: 3, image_path: 'u/a.jpg' },
    { id: 4, image_path: null },
  ];
  const result = await addSignedAvatarUrls(input, client);
  assert.equal(calls, 1);
  assert.equal(result.length, input.length);
  assert.equal(result[0].image_url, 'https://example.test/signed/a');
  assert.equal(result[2].image_url, result[0].image_url);
  assert.equal(result[1], input[1]);
  assert.equal(result[3], input[3]);
  assert.equal(input[0].image_url, undefined);
});

test('empty history avoids storage and a failed batch preserves history', async () => {
  const { addSignedAvatarUrls } = loadSource('src/lib/avatar-history.ts');
  const plain = [{ id: 1 }];
  assert.equal(await addSignedAvatarUrls(plain, {}), plain);
  const records = [{ image_path: 'u/a.jpg' }];
  const client = { storage: { from: () => ({ createSignedUrls: async () => { throw Error('unavailable'); } }) } };
  assert.equal(await addSignedAvatarUrls(records, client), records);
});

function historyHandler({ user = { id: 'test-user' }, records = [] } = {}) {
  const calls = { database: 0, admin: 0, signed: 0, filter: null, range: null };
  const query = {
    select() { return query; },
    eq(column, value) { calls.filter = [column, value]; return query; },
    order() { return query; },
    async range(start, end) { calls.range = [start, end]; return { data: records, count: records.length, error: null }; },
  };
  const client = {
    auth: { getUser: async () => ({ data: { user } }) },
    from(table) { calls.database++; assert.equal(table, 'usage_records'); return query; },
  };
  const mod = loadSource('src/pages/api/usage/history.ts', {
    '@/lib/supabase/server': {
      createClient: () => client,
      createServiceClient: () => { calls.admin++; return {}; },
    },
    '@/lib/avatar-history': {
      addSignedAvatarUrls: async rows => { calls.signed++; return rows; },
    },
  });
  const response = { statusCode: 0, body: null, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
  return { handler: mod.default, response, calls };
}

test('history rejects anonymous callers before accessing records or admin storage', async () => {
  const { handler, response, calls } = historyHandler({ user: null });
  await handler({ method: 'GET', query: {} }, response);
  assert.equal(response.statusCode, 401);
  assert.equal(calls.database + calls.admin + calls.signed, 0);
});

test('history rejects invalid and unbounded pagination before database work', async () => {
  for (const query of [
    { limit: '51' }, { limit: '0' }, { limit: '-1' }, { limit: '1.5' },
    { limit: 'NaN' }, { limit: ['10', '20'] }, { offset: '-1' },
    { offset: 'Infinity' }, { offset: '9007199254740991' },
  ]) {
    const { handler, response, calls } = historyHandler();
    await handler({ method: 'GET', query }, response);
    assert.equal(response.statusCode, 400, JSON.stringify(query));
    assert.equal(calls.database + calls.admin + calls.signed, 0);
  }
});

test('bounded history keeps user isolation and pagination response without requiring storage for empty results', async () => {
  const { handler, response, calls } = historyHandler();
  await handler({ method: 'GET', query: { limit: '10', offset: '20' } }, response);
  assert.equal(response.statusCode, 200);
  assert.deepEqual(calls.filter, ['user_id', 'test-user']);
  assert.deepEqual(calls.range, [20, 29]);
  assert.equal(response.body.limit, 10);
  assert.equal(response.body.offset, 20);
  assert.equal(response.body.total, 0);
  assert.equal(calls.admin, 0);
});

test('analytics is optional and still records events when configured', () => {
  const server = loadSource('src/lib/ga.js');
  assert.doesNotThrow(() => server.event({ action: 'download', params: {} }));
  const disabled = loadSource('src/lib/ga.js', {}, { window: {} });
  assert.doesNotThrow(() => disabled.event({ action: 'download', params: {} }));
  assert.doesNotThrow(() => disabled.pageview('/pricing'));
  const calls = [];
  const enabled = loadSource('src/lib/ga.js', {}, { window: { gtag: (...args) => calls.push(args) } });
  enabled.event({ action: 'download', params: { type: 'png' } });
  assert.deepEqual(calls, [['event', 'download', { type: 'png' }]]);
});
