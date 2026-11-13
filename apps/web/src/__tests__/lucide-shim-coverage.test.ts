// Every `lucide-react` import in Study Buddy is served by src/lib/icons/lucide-shim.tsx (next.config aliases it). A name the shim does not
// export is `undefined` at run time and crashes the page ("Element type is invalid"), which TypeScript cannot see because the types come from
// the real package. Found 13 Nov 2026: the photo-answer screen's gallery icon (Images) took down the answer page. This test reads the
// imports and the shim as text, so it needs no browser.

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const WEB_SRC = join(__dirname, '..')
const CORE_SRC = join(__dirname, '../../../../packages/core/src')
const SHIM = join(WEB_SRC, 'lib/icons/lucide-shim.tsx')

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    if (name === 'node_modules' || name === '__tests__') return []
    return statSync(p).isDirectory() ? files(p) : /\.tsx?$/.test(name) ? [p] : []
  })
}

function shimExports(): Set<string> {
  const s = readFileSync(SHIM, 'utf8')
  const names = new Set([...s.matchAll(/export const (\w+)/g)].map((m) => m[1]))
  for (const m of s.matchAll(/export \{([^}]*)\} from/g)) {
    for (const part of m[1].split(',')) { const n = part.trim().split(/\s+as\s+/).pop(); if (n) names.add(n) }
  }
  return names
}

describe('lucide shim', () => {
  it('exports every icon the app imports from lucide-react', () => {
    const exported = shimExports()
    const missing: string[] = []
    for (const f of [...files(WEB_SRC), ...files(CORE_SRC)]) {
      if (f === SHIM) continue
      const src = readFileSync(f, 'utf8')
      for (const m of src.matchAll(/import\s*\{([^}]*)\}\s*from\s*'lucide-react'/g)) {
        for (const part of m[1].split(',')) {
          const name = part.trim().split(/\s+as\s+/)[0]?.trim()
          if (!name || name.startsWith('type ') || name === 'LucideIcon' || name === 'LucideProps') continue
          if (!exported.has(name)) missing.push(`${name} (${relative(WEB_SRC, f)})`)
        }
      }
      // `import type { ... } from 'lucide-react'` is types only and needs nothing from the shim
    }
    expect(missing).toEqual([])
  })
})
