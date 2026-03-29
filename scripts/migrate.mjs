/**
 * scripts/migrate.mjs
 * Pushes all SQL files in supabase/migrations/ to your remote Supabase project.
 *
 * Requires in .env.local:
 *   VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ...   (Settings → API → service_role)
 *
 * Run:
 *   node scripts/migrate.mjs
 */

import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dir = dirname(fileURLToPath(import.meta.url))
const root  = join(__dir, '..')

// ── Load .env.local ───────────────────────────────────────────────────────────
function loadEnv() {
  const env = { ...process.env }
  try {
    for (const line of readFileSync(join(root, '.env.local'), 'utf8').split('\n')) {
      const m = line.match(/^([^#=\s][^=]*)=(.*)$/)
      if (m) env[m[1].trim()] = m[2].trim()
    }
  } catch { /* no .env.local */ }
  return env
}

const env = loadEnv()
const SUPABASE_URL      = env.VITE_SUPABASE_URL?.replace(/\/$/, '')
const SERVICE_ROLE_KEY  = env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL)     { console.error('\n❌  VITE_SUPABASE_URL missing in .env.local\n');      process.exit(1) }
if (!SERVICE_ROLE_KEY || SERVICE_ROLE_KEY === 'your-service-role-key-here') {
  console.error('\n❌  Add SUPABASE_SERVICE_ROLE_KEY to .env.local')
  console.error('    Found at: Supabase Dashboard → Settings → API → service_role secret\n')
  process.exit(1)
}

// ── Parse project ref from URL ────────────────────────────────────────────────
const ref = SUPABASE_URL.match(/https?:\/\/([^.]+)\.supabase\.co/)?.[1]
if (!ref) { console.error('❌  Cannot parse project ref from VITE_SUPABASE_URL'); process.exit(1) }

// ── Execute SQL via Supabase Management API ───────────────────────────────────
async function execSQL(sql, label) {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${ref}/database/query`,
    {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    }
  )

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`"${label}" → HTTP ${res.status}: ${body}`)
  }

  return res.json()
}

// ── Main ──────────────────────────────────────────────────────────────────────
const migrationsDir = join(root, 'supabase', 'migrations')
const files = readdirSync(migrationsDir)
  .filter(f => f.endsWith('.sql'))
  .sort()

console.log(`\n🚀  Running ${files.length} migration(s) → ${SUPABASE_URL}\n`)
let ok = 0
for (const file of files) {
  try {
    const sql = readFileSync(join(migrationsDir, file), 'utf8')
    await execSQL(sql, file)
    console.log(`  ✅  ${file}`)
    ok++
  } catch (err) {
    console.error(`  ❌  ${file}\n     ${err.message}`)
  }
}
console.log(`\n${ok === files.length ? '✅  All' : `⚠️   ${ok}/${files.length}`} migrations complete.\n`)
