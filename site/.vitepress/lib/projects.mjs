// Reads data/projects.yaml, validates it and returns normalised project objects.
// Any data error throws, which fails `vitepress build` (and the CI deploy).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { load } from 'js-yaml'

const here = path.dirname(fileURLToPath(import.meta.url))
export const ROOT = path.resolve(here, '../../..')
export const DATA_FILE = path.join(ROOT, 'data/projects.yaml')
const PUBLIC_DIR = path.join(ROOT, 'site/public')

export const STATUSES = ['active', 'maintained', 'paused', 'archived']
const REQUIRED = ['slug', 'name', 'one_line', 'category', 'status', 'stack', 'repo', 'created']
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const URL_RE = /^https?:\/\/\S+$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

// YAML may hand us a Date or a string; normalise to YYYY-MM-DD.
function toIsoDate(v) {
  if (v instanceof Date && !Number.isNaN(v.getTime())) return v.toISOString().slice(0, 10)
  const s = String(v ?? '').trim()
  if (!DATE_RE.test(s)) return null
  const d = new Date(`${s}T00:00:00Z`)
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== s ? null : s
}

export function loadProjects() {
  const raw = load(fs.readFileSync(DATA_FILE, 'utf8')) ?? []
  if (!Array.isArray(raw)) throw new Error(`${DATA_FILE}: top level must be a list`)

  const errors = []
  const seen = new Set()

  const projects = raw.map((p, i) => {
    const where = `projects.yaml entry #${i + 1}${p?.slug ? ` (${p.slug})` : ''}`
    if (!p || typeof p !== 'object') {
      errors.push(`${where}: not a mapping`)
      return null
    }
    for (const key of REQUIRED) {
      const v = p[key]
      if (v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)) {
        errors.push(`${where}: missing "${key}"`)
      }
    }
    if (p.slug && !SLUG_RE.test(p.slug)) errors.push(`${where}: slug must be kebab-case`)
    if (p.slug && seen.has(p.slug)) errors.push(`${where}: duplicate slug`)
    seen.add(p.slug)
    if (p.status && !STATUSES.includes(p.status)) {
      errors.push(`${where}: status "${p.status}" must be one of ${STATUSES.join(', ')}`)
    }
    if (p.stack && !Array.isArray(p.stack)) errors.push(`${where}: stack must be a list`)
    for (const key of ['repo', 'site']) {
      if (p[key] && !URL_RE.test(p[key])) errors.push(`${where}: ${key} must be an http(s) URL`)
    }

    const created = toIsoDate(p.created)
    if (p.created && !created) errors.push(`${where}: created must be a valid date (YYYY-MM-DD)`)

    // Preview: explicit path must exist; otherwise use previews/<slug>.svg if present.
    let preview = null
    if (p.preview) {
      const rel = String(p.preview).replace(/^\/+/, '')
      if (!fs.existsSync(path.join(PUBLIC_DIR, rel))) {
        errors.push(`${where}: preview "${p.preview}" not found in site/public/`)
      }
      preview = '/' + rel
    } else if (p.slug && fs.existsSync(path.join(PUBLIC_DIR, 'previews', `${p.slug}.svg`))) {
      preview = `/previews/${p.slug}.svg`
    }

    return {
      slug: p.slug,
      name: p.name,
      one_line: p.one_line,
      category: p.category,
      status: p.status,
      featured: p.featured === true,
      stack: Array.isArray(p.stack) ? p.stack.map(String) : [],
      repo: p.repo,
      site: p.site || null,
      link: p.site || p.repo,
      preview,
      created
    }
  })

  if (errors.length) {
    throw new Error(`Invalid data/projects.yaml:\n  - ${errors.join('\n  - ')}`)
  }

  const rank = Object.fromEntries(STATUSES.map((s, i) => [s, i]))
  return projects.sort(
    (a, b) => rank[a.status] - rank[b.status] || a.name.localeCompare(b.name)
  )
}
