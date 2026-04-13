/**
 * Single deploy: marketing site into dist/, then EventHub / Mesh / Pointy into dist/products/*.
 * Run from repo root (volnux-site). Vite --outDir is absolute so nested apps do not wipe dist/.
 */
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function run(cmd, opts = {}) {
  execSync(cmd, { cwd: root, stdio: 'inherit', ...opts })
}

// 1) Marketing + docs (default outDir: dist/)
run('npm run build')

const productBuilds = [
  {
    workspace: '@volnux/eventhub-app',
    base: '/products/eventhub/',
    outDir: join(root, 'dist', 'products', 'eventhub'),
  },
  {
    workspace: '@volnux/mesh-runtime-app',
    base: '/products/mesh-runtime/',
    outDir: join(root, 'dist', 'products', 'mesh-runtime'),
  },
  {
    workspace: '@volnux/pointy-app',
    base: '/products/pointy-lang/',
    outDir: join(root, 'dist', 'products', 'pointy-lang'),
  },
]

for (const p of productBuilds) {
  const out = JSON.stringify(p.outDir)
  const base = JSON.stringify(p.base)
  run(`npm run build -w ${p.workspace} -- --base ${base} --outDir ${out}`)
}
