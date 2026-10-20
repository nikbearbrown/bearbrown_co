import { getSkill, skills } from '@/lib/skill-catalog'
import { getSkillText } from '@/lib/skill-text'

export const dynamicParams = false
export function generateStaticParams() { return skills.map(s => ({ slug: s.slug })) }

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const text = getSkill(slug) ? getSkillText(slug) : null
  if (!text) return new Response('Not found', { status: 404 })
  return new Response(text, { headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'Content-Disposition': 'inline; filename="SKILL.md"' } })
}
