const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { randomUUID } = require('node:crypto');
const { test } = require('node:test');
const ts = require('typescript');

function load(file, imports = {}, globals = {}) {
  const code = ts.transpileModule(
    fs.readFileSync(path.join(__dirname, '..', file), 'utf8'),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        jsx: ts.JsxEmit.ReactJSX,
      },
    },
  ).outputText;
  const module = { exports: {} };
  vm.runInNewContext(code, {
    module,
    exports: module.exports,
    process: { env: {} },
    console: { error() {} },
    require(name) {
      if (!(name in imports)) throw Error(`Unexpected import ${name}`);
      return imports[name];
    },
    ...globals,
  });
  return module.exports;
}
function response() {
  return {
    statusCode: 0,
    headers: {},
    setHeader(key, value) {
      this.headers[key] = value;
    },
    status(n) {
      this.statusCode = n;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}
function generation({
  fails = false,
  reservationError = false,
  isPaid = false,
} = {}) {
  let held = false,
    modelCalls = 0,
    refunded = 0,
    completed = 0;
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  const service = {
    rpc: async (name, args) => {
      if (name === 'reserve_avatar_generation') {
        if (reservationError) return { error: Error('migration missing') };
        if (held) return { data: { status: 'busy' } };
        held = true;
        return {
          data: { status: 'reserved', id: randomUUID(), isPaid },
        };
      }
      if (args.p_success) completed++;
      else {
        refunded++;
        held = false;
      }
      return { data: { status: args.p_success ? 'completed' : 'failed' } };
    },
  };
  const { default: handler } = load('src/pages/api/ai/generate-avatar.ts', {
    crypto: { randomUUID },
    '@/lib/gemini': {
      generateAvatar: async () => {
        modelCalls++;
        await gate;
        if (fails) throw Error('upstream unavailable');
        return 'mock-image';
      },
    },
    '@/lib/supabase/server': {
      createClient: () => ({
        auth: { getUser: async () => ({ data: { user: { id: 'user' } } }) },
      }),
      createServiceClient: () => service,
      base64ToBuffer: (image) => image,
      uploadImageToStorage: async () => 'user/test.jpg',
    },
    '@/lib/date': { FREE_DAILY_LIMIT: 1 },
    '@/lib/watermark': {
      addWatermark: async (image) => `${image}-watermarked`,
    },
  });
  const request = () => ({
    method: 'POST',
    headers: { 'idempotency-key': randomUUID() },
    body: { mode: 'text2avatar', description: 'offline test' },
  });
  return {
    handler,
    request,
    release,
    stats: () => ({ modelCalls, refunded, completed }),
  };
}
test('parallel API requests start only one model call after a successful reservation', async () => {
  const g = generation(),
    one = response(),
    two = response();
  const requests = Promise.all([
    g.handler(g.request(), one),
    g.handler(g.request(), two),
  ]);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(g.stats().modelCalls, 1);
  g.release();
  await requests;
  assert.deepEqual([one.statusCode, two.statusCode].sort(), [200, 409]);
  assert.deepEqual(g.stats(), { modelCalls: 1, completed: 1, refunded: 0 });
});
test('upstream failure refunds the reservation and missing migration never starts a model call', async () => {
  const failing = generation({ fails: true }),
    failed = response();
  failing.release();
  await failing.handler(failing.request(), failed);
  assert.equal(failed.statusCode, 500);
  assert.equal(failing.stats().refunded, 1);
  const missing = generation({ reservationError: true }),
    blocked = response();
  await missing.handler(missing.request(), blocked);
  assert.equal(blocked.statusCode, 503);
  assert.equal(missing.stats().modelCalls, 0);
});
test('generation response identifies the entitlement actually used for this image', async () => {
  for (const isPaid of [false, true]) {
    const g = generation({ isPaid });
    const res = response();
    g.release();
    await g.handler(g.request(), res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.isPaid, isPaid);
    assert.equal(
      res.body.image,
      isPaid ? 'mock-image' : 'mock-image-watermarked',
    );
  }
});

// Exercise the page's real event handlers with local state and mocked I/O.
// The balance refresh runs between the API result and the next render.
function generationPage({ isPaid, before, after }) {
  const React = require('react');
  const translation = { useTranslation: () => ({ t: (key) => key }) };
  const Result = load('src/components/AIGenerator/GeneratedResult.tsx', {
    'react/jsx-runtime': require('react/jsx-runtime'),
    'next-i18next': translation,
  }).default;
  const state = [];
  let cursor = 0,
    usage = before,
    downloads = 0;
  const imports = {
    react: {
      ...React,
      useState(initial) {
        const index = cursor++;
        if (!(index in state))
          state[index] = typeof initial === 'function' ? initial() : initial;
        return [
          state[index],
          (value) => {
            state[index] =
              typeof value === 'function' ? value(state[index]) : value;
          },
        ];
      },
      useEffect() {},
      useMemo: (factory) => factory(),
    },
    'react/jsx-runtime': require('react/jsx-runtime'),
    'next/router': { useRouter: () => ({ locale: 'en', query: {} }) },
    'next-i18next': translation,
    'next-i18next/serverSideTranslations': {
      serverSideTranslations: async () => ({}),
    },
    'react-hot-toast': {
      default: { success() {}, error() {} },
      Toaster: 'Toaster',
    },
    'next/dynamic': { default: () => 'LazyComponent' },
    '@/contexts/AuthContext': {
      useAuth: () => ({ user: { id: 'test-user' }, isLoading: false }),
    },
    '@/hooks/useAIUsage': {
      useAIUsage: () => ({
        usageState: usage,
        checkUsage: async () => {},
        incrementUsage: async () => {
          usage = after;
        },
      }),
    },
    '@/components/AIGenerator/GeneratedResult': { default: Result },
  };
  for (const name of [
    'next/head',
    'next/legacy/image',
    '@/components/Header',
    '@/components/Footer',
    '@/components/AIGenerator/ModeSelector',
    '@/components/AIGenerator/ImageUploader',
    '@/components/AIGenerator/TextInput',
    '@/components/AIGenerator/GeneratingStatus',
    '@/components/AIGenerator/DownloadUpgradePrompt',
    '@/components/AIGenerator/DailyLimitBanner',
    '@/components/ProductHuntBanner',
  ])
    imports[name] = { default: name.split('/').pop() };
  const Page = load('src/pages/ai-generator.tsx', imports, {
    crypto: { randomUUID },
    fetch: async (url) => {
      assert.equal(url, '/api/ai/generate-avatar');
      return {
        status: 200,
        json: async () => ({
          success: true,
          image: 'data:image/png;base64,b2ZmbGluZQ==',
          isPaid,
        }),
      };
    },
    document: {
      createElement: () => ({
        click() {
          downloads++;
        },
      }),
      body: { appendChild() {}, removeChild() {} },
    },
  }).default;
  function elements(node) {
    if (Array.isArray(node)) return node.flatMap(elements);
    if (!node || typeof node !== 'object') return [];
    return [node, ...elements(node.props?.children)];
  }
  function render() {
    cursor = 0;
    return Page({});
  }
  function find(tree, type) {
    return elements(tree).find((node) => node.type === type);
  }
  return {
    Result,
    render,
    find,
    async generate() {
      find(render(), 'ModeSelector').props.onModeChange('text2avatar');
      find(render(), 'TextInput').props.onChange('Offline regression test');
      const button = elements(render()).find(
        (node) =>
          node.type === 'button' && node.props.children === 'ai.generate',
      );
      assert.ok(button, 'generation action exists');
      await button.props.onClick();
      return find(render(), Result);
    },
    downloads: () => downloads,
  };
}

test('last credit keeps its image paid after balance refresh and bypasses the upgrade prompt', async () => {
  const page = generationPage({
    isPaid: true,
    before: {
      remaining: 1,
      total: 1,
      freeRemaining: 0,
      paidCredits: 1,
      isUnlimited: false,
    },
    after: {
      remaining: 0,
      total: 1,
      freeRemaining: 0,
      paidCredits: 0,
      isUnlimited: false,
    },
  });
  const result = await page.generate();
  assert.equal(result.props.isPaidGeneration, true);
  const html = require('react-dom/server').renderToString(
    require('react').createElement(page.Result, result.props),
  );
  assert.doesNotMatch(html, /ai\.watermarkHint/);
  result.props.onDownload();
  assert.equal(page.downloads(), 1);
  assert.equal(
    page.find(page.render(), 'DownloadUpgradePrompt').props.isOpen,
    false,
  );
  result.props.onReset();
  assert.equal(page.find(page.render(), page.Result), undefined);
});

test('a free image retains the watermark hint and download prompt even when credits remain', async () => {
  const page = generationPage({
    isPaid: false,
    before: {
      remaining: 2,
      total: 1,
      freeRemaining: 1,
      paidCredits: 1,
      isUnlimited: false,
    },
    after: {
      remaining: 1,
      total: 1,
      freeRemaining: 0,
      paidCredits: 1,
      isUnlimited: false,
    },
  });
  const result = await page.generate();
  assert.equal(result.props.isPaidGeneration, false);
  const html = require('react-dom/server').renderToString(
    require('react').createElement(page.Result, result.props),
  );
  assert.match(html, /ai\.watermarkHint/);
  result.props.onDownload();
  assert.equal(page.downloads(), 0);
  assert.equal(
    page.find(page.render(), 'DownloadUpgradePrompt').props.isOpen,
    true,
  );
});

test('one account request returns session, subscription, credits and daily usage after validated authentication', async () => {
  let authCalls = 0,
    accountCalls = 0;
  const { default: handler } = load('src/pages/api/auth/session.ts', {
    '@/lib/supabase/server': {
      createClient: () => ({
        auth: {
          getUser: async () => {
            authCalls++;
            return { data: { user: { id: 'u' } } };
          },
        },
      }),
    },
    '@/lib/account': {
      getAccountState: async (_client, user) => {
        accountCalls++;
        return {
          user,
          subscription: null,
          credits: 2,
          usage: { remaining: 3 },
        };
      },
    },
    '@/types/account': {
      EMPTY_ACCOUNT: {
        user: null,
        subscription: null,
        credits: 0,
        usage: null,
      },
    },
  });
  const res = response();
  await handler({ method: 'GET' }, res);
  assert.equal(authCalls, 1);
  assert.equal(accountCalls, 1);
  assert.equal(res.body.usage.remaining, 3);
  assert.equal(res.headers['Cache-Control'], 'private, no-store');
});
test('anonymous account requests do not query subscription, credits or usage', async () => {
  const empty = { user: null, subscription: null, credits: 0, usage: null };
  const { default: handler } = load('src/pages/api/auth/session.ts', {
    '@/lib/supabase/server': {
      createClient: () => ({
        auth: {
          getUser: async () => ({
            data: { user: null },
            error: { name: 'AuthSessionMissingError' },
          }),
        },
      }),
    },
    '@/lib/account': {
      getAccountState: () => {
        throw Error('should not read account');
      },
    },
    '@/types/account': { EMPTY_ACCOUNT: empty },
  });
  const res = response();
  await handler({ method: 'GET' }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body, empty);
});
test('PWA caches public assets on demand and never caches private APIs, navigation or SSR JSON', () => {
  const rules = require('../pwa-cache');
  global.self = { location: { origin: 'https://example.test' } };
  function strategy(path, mode = 'cors') {
    const args = {
      url: new URL(path, 'https://example.test'),
      request: { mode },
    };
    return rules.find((rule) => rule.urlPattern(args))?.handler;
  }
  for (const route of [
    '/api/auth/session',
    '/api/usage/history?limit=10',
    '/api/user/subscription',
    '/_next/data/build/en/account.json',
  ])
    assert.equal(strategy(route), 'NetworkOnly');
  assert.equal(strategy('/zh/account', 'navigate'), 'NetworkOnly');
  assert.equal(
    strategy(
      '/_next/image?url=' +
        encodeURIComponent(
          'https://uclqvnpqvartezdtmgpn.supabase.co/storage/v1/object/sign/generated-avatars/private.jpg?token=x',
        ),
    ),
    'NetworkOnly',
  );
  assert.equal(strategy('/avatar/part/hair/hair-1.svg'), 'CacheFirst');
  assert.equal(
    strategy('/_next/image?url=%2Flogo.gif&w=64&q=75'),
    'CacheFirst',
  );
  assert.equal(
    strategy(
      'https://uclqvnpqvartezdtmgpn.supabase.co/storage/v1/object/sign/generated-avatars/private.jpg?token=secret',
    ),
    undefined,
  );
  delete global.self;
});

test('SSR hydration serves the account and history without a second browser fetch, isolated by user', () => {
  const React = require('react');
  const query = require('@tanstack/react-query');
  const { renderToString } = require('react-dom/server');
  const account = {
    user: { id: 'alice' },
    subscription: null,
    credits: 2,
    usage: { date: '2026-10-30', remaining: 3, total: 1, isUnlimited: false },
  };
  const types = {
    EMPTY_ACCOUNT: { user: null, subscription: null, credits: 0, usage: null },
  };
  const auth = load('src/contexts/AuthContext.tsx', {
    react: React,
    'react/jsx-runtime': require('react/jsx-runtime'),
    '@tanstack/react-query': query,
    '@/types/account': types,
  });
  const hooks = load('src/hooks/useAccountData.ts', {
    react: React,
    '@tanstack/react-query': query,
    '@/contexts/AuthContext': auth,
  });
  const serverCache = new query.QueryClient();
  serverCache.setQueryData(['accountState'], account);
  serverCache.setQueryData(
    ['usageHistory', 'alice', 10],
    [{ id: 'alice-image' }],
  );
  serverCache.setQueryData(['purchasedPacks', 'alice'], ['design-pack']);
  serverCache.setQueryData(['usageHistory', 'bob', 10], [{ id: 'bob-image' }]);
  const clientCache = new query.QueryClient();
  let snapshot;
  function Probe() {
    const accountData = auth.useAuth();
    const history = hooks.useUsageHistory(10, true);
    const packs = hooks.usePurchasedPacks();
    snapshot = {
      user: accountData.user.id,
      credits: accountData.credits,
      history: history.data,
      packs: packs.data,
    };
    return React.createElement('p', null, 'Account ready');
  }
  const html = renderToString(
    React.createElement(
      query.QueryClientProvider,
      { client: clientCache },
      React.createElement(
        query.HydrationBoundary,
        { state: query.dehydrate(serverCache) },
        React.createElement(
          auth.AuthProvider,
          null,
          React.createElement(Probe),
        ),
      ),
    ),
  );
  assert.match(html, /Account ready/);
  assert.deepEqual(snapshot, {
    user: 'alice',
    credits: 2,
    history: [{ id: 'alice-image' }],
    packs: ['design-pack'],
  });
  clientCache.clear();
  serverCache.clear();
});

test('session refresh preserves all cookie chunks and clears expired cookies in the same request', () => {
  let options;
  const mod = load('src/lib/supabase/server.ts', {
    '@supabase/ssr': {
      createServerClient: (_url, _key, opts) => {
        options = opts;
        return {};
      },
      serializeCookieHeader: require('@supabase/ssr').serializeCookieHeader,
    },
    '@supabase/supabase-js': { createClient: () => ({}) },
  });
  const req = { cookies: { old: 'old-session' } };
  const headers = { 'Set-Cookie': ['other=value; Path=/'] };
  const res = {
    getHeader: (key) => headers[key],
    setHeader: (key, value) => {
      headers[key] = value;
    },
  };
  mod.createClient(req, res);
  options.cookies.setAll([
    {
      name: 'token.0',
      value: 'part-one',
      options: { path: '/', httpOnly: true },
    },
    { name: 'token.1', value: 'part-two', options: { path: '/' } },
    { name: 'old', value: '', options: { maxAge: 0 } },
  ]);
  assert.equal(headers['Set-Cookie'].length, 4);
  assert.match(headers['Set-Cookie'][3], /Max-Age=0/);
  assert.deepEqual(
    Array.from(options.cookies.getAll(), (item) => item.name).sort(),
    ['token.0', 'token.1'],
  );
  assert.equal(headers['Cache-Control'], 'private, no-store');
});

test('quota days use UTC across client, server and database timezones', () => {
  const { getToday } = load('src/lib/date.ts');
  assert.equal(getToday(new Date('2026-10-31T00:15:00+08:00')), '2026-10-30');
  assert.equal(getToday(new Date('2026-10-30T17:15:00-07:00')), '2026-10-31');
});
