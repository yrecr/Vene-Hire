import { readFileSync } from 'fs';
import { resolve } from 'path';

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf-8')
    .split('\n')
    .filter(l => l.trim() && !l.startsWith('#'))
    .map(l => l.split('=', 2).map(s => s.trim()))
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

const migrations = [
  '20260422152500_alter_profiles_role_constraint.sql',
  '20260422152600_fix_rls_recursion.sql',
];

async function run() {
  for (const file of migrations) {
    const sql = readFileSync(resolve('supabase/migrations', file), 'utf-8');
    console.log(`→ ${file}...`);
    const res = await fetch(`${url}/rest/v1/_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': key,
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({ query: sql }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error(`  FAILED (${res.status}): ${text}`);
    } else {
      console.log(`  OK`);
    }
  }
}

run().catch(console.error);
