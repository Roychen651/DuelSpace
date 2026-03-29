/**
 * scripts/migrate.mjs
 * Pushes all pending migrations to the linked Supabase project.
 * Reads SUPABASE_ACCESS_TOKEN from .env.local automatically.
 *
 * Usage: node scripts/migrate.mjs
 *   or:  npm run migrate
 */
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function loadEnv() {
  const env = {}
  try {
    for (const line of readFileSync(join(root, '.env.local'), 'utf8').split('\n')) {
      const m = line.match(/^([^#=\s][^=]*)=(.*)$/)
      if (m) env[m[1].trim()] = m[2].trim()
    }
  } catch {}
  return env
}

const env = loadEnv()
const token = env.SUPABASE_ACCESS_TOKEN

if (!token) {
  console.error('\n❌  SUPABASE_ACCESS_TOKEN missing in .env.local\n')
  process.exit(1)
}

console.log('\n🚀  Pushing migrations to Supabase …\n')
try {
  execSync('supabase db push --yes', {
    stdio: 'inherit',
    env: { ...process.env, SUPABASE_ACCESS_TOKEN: token },
    cwd: root,
  })
  console.log('\n✅  All migrations applied.\n')
} catch {
  process.exit(1)
}
