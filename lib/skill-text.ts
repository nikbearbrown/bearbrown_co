// Server-only: the skill text exactly as the site publishes it.
import fs from 'fs'
import path from 'path'

export function getSkillText(slug: string): string | null {
  if (!/^[a-z0-9-]+$/.test(slug)) return null
  try { return fs.readFileSync(path.join(process.cwd(), 'content', 'skills', slug, 'SKILL.md'), 'utf8') } catch { return null }
}
