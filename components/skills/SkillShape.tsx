// A skill's weight distribution: one segment per top-level section of the text, width = share of words.
// Decorative: every number it shows is also printed as text beside it.
export default function SkillShape({ bars, tall = false }: { bars: number[]; tall?: boolean }) {
  if (!bars.length) return <div aria-hidden="true" style={{ height: tall ? 22 : 10, borderRadius: 3, background: 'var(--p-border)' }} />
  return <div aria-hidden="true" className="flex" style={{ gap: 2, height: tall ? 22 : 10 }}>
    {bars.map((b, i) => <span key={i} style={{ flex: b, minWidth: 3, background: 'var(--p-ink)', opacity: 0.35 + 0.65 * ((i % 3) / 2), borderRadius: 1 }} />)}
  </div>
}
