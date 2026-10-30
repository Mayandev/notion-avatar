const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { test } = require('node:test');
const { PGlite } = require('@electric-sql/pglite');

const root = path.join(__dirname, '..');
const migrationName = fs
  .readdirSync(path.join(root, 'supabase/migrations'))
  .find((name) => name.endsWith('_reserve_avatar_generation.sql'));

async function database() {
  const db = new PGlite();
  await db.exec(`CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY);
    CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
    GRANT USAGE ON SCHEMA public,auth TO service_role;`);
  const base = fs.readFileSync(
    path.join(root, 'supabase/migrations/001_create_tables.sql'),
    'utf8',
  );
  for (const table of [
    'subscriptions',
    'credit_packages',
    'daily_usage',
    'usage_records',
  ]) {
    const ddl = base.match(
      new RegExp(
        `CREATE TABLE IF NOT EXISTS public\\.${table} \\([\\s\\S]+?\\n\\);`,
      ),
    );
    assert.ok(ddl, table);
    await db.exec(ddl[0]);
  }
  await db.exec(`ALTER TABLE public.usage_records ADD COLUMN image_path text;
    GRANT SELECT,INSERT,UPDATE ON ALL TABLES IN SCHEMA public TO service_role;`);
  await db.exec(
    fs.readFileSync(
      path.join(root, 'supabase/migrations', migrationName),
      'utf8',
    ),
  );
  const user = randomUUID();
  await db.query('INSERT INTO auth.users(id) VALUES ($1)', [user]);
  return { db, user };
}
async function reserve(db, user, request = randomUUID()) {
  const result = await db.query(
    'SELECT public.reserve_avatar_generation($1,$2,1) AS value',
    [user, request],
  );
  return result.rows[0].value;
}
async function finish(db, user, reservation, success) {
  const result = await db.query(
    "SELECT public.finish_avatar_generation($1,$2,$3,'text2avatar',NULL) AS value",
    [user, reservation.id, success],
  );
  return result.rows[0].value;
}

test('Postgres reserves before generation and duplicate requests never consume another allowance', async () => {
  const { db, user } = await database();
  try {
    await db.exec('SET ROLE service_role');
    const key = randomUUID();
    const [first, second] = await Promise.all([
      reserve(db, user, key),
      reserve(db, user, key),
    ]);
    assert.equal(first.status, 'reserved');
    assert.equal(second.status, 'duplicate');
    assert.equal((await reserve(db, user)).status, 'busy');
    assert.equal((await finish(db, user, first, true)).status, 'completed');
    await finish(db, user, first, true);
    await finish(db, user, first, false); // A late refund cannot undo success.
    assert.equal((await reserve(db, user)).status, 'limit');
    const rows = await db.query(
      'SELECT (SELECT count FROM public.daily_usage) AS used, (SELECT count(*)::int FROM public.usage_records) AS recorded',
    );
    assert.deepEqual(rows.rows[0], { used: 1, recorded: 1 });
  } finally {
    await db.close();
  }
});

test('failed work refunds free allowance and credits exactly once; oldest credit is consumed first', async () => {
  const { db, user } = await database();
  try {
    await db.exec('SET ROLE service_role');
    const free = await reserve(db, user);
    await finish(db, user, free, false);
    await finish(db, user, free, false);
    assert.equal(
      (await db.query('SELECT count FROM public.daily_usage')).rows[0].count,
      0,
    );
    const retry = await reserve(db, user);
    await finish(db, user, retry, true);
    const oldId = randomUUID(),
      newId = randomUUID();
    await db.query(
      "INSERT INTO public.credit_packages(id,user_id,credits_remaining,purchased_at) VALUES ($1,$3,1,now()-interval '1 day'),($2,$3,2,now())",
      [oldId, newId, user],
    );
    const paid = await reserve(db, user);
    assert.equal(paid.isPaid, true);
    assert.equal(
      (
        await db.query(
          'SELECT credits_remaining FROM public.credit_packages WHERE id=$1',
          [oldId],
        )
      ).rows[0].credits_remaining,
      0,
    );
    await finish(db, user, paid, false);
    await finish(db, user, paid, false);
    assert.equal(
      (
        await db.query(
          'SELECT credits_remaining FROM public.credit_packages WHERE id=$1',
          [oldId],
        )
      ).rows[0].credits_remaining,
      1,
    );
    assert.equal((await reserve(db, user)).status, 'reserved');
  } finally {
    await db.close();
  }
});

test('expired reservations recover, and active yearly subscribers do not spend free allowance', async () => {
  const { db, user } = await database();
  try {
    const abandoned = await reserve(db, user);
    await db.query(
      "UPDATE public.avatar_generation_requests SET expires_at=now()-interval '1 minute' WHERE id=$1",
      [abandoned.id],
    );
    const recovered = await reserve(db, user);
    assert.equal(recovered.status, 'reserved');
    assert.equal(
      (await db.query('SELECT count FROM public.daily_usage')).rows[0].count,
      1,
    );
    await finish(db, user, recovered, true);
    await db.query(
      "INSERT INTO public.subscriptions(user_id,status,plan_type,current_period_end) VALUES ($1,'active','yearly',now()+interval '1 day')",
      [user],
    );
    const pro = await reserve(db, user);
    assert.equal(pro.isPaid, true);
    await finish(db, user, pro, true);
    assert.equal(
      (await db.query('SELECT count FROM public.daily_usage')).rows[0].count,
      1,
    );
  } finally {
    await db.close();
  }
});

test('anon/authenticated cannot reserve, refund or read internal reservations', async () => {
  const { db, user } = await database();
  try {
    const reservation = await reserve(db, user);
    for (const role of ['anon', 'authenticated']) {
      await db.exec(`SET ROLE ${role}`);
      await assert.rejects(reserve(db, user), /permission denied/);
      await assert.rejects(
        finish(db, user, reservation, false),
        /permission denied/,
      );
      await assert.rejects(
        db.query('SELECT * FROM public.avatar_generation_requests'),
        /permission denied/,
      );
      await db.exec('RESET ROLE');
    }
    const otherUser = randomUUID();
    await db.query('INSERT INTO auth.users VALUES ($1)', [otherUser]);
    await assert.rejects(
      finish(db, otherUser, reservation, false),
      /Unknown generation reservation/,
    );
  } finally {
    await db.close();
  }
});
