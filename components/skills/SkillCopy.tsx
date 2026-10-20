'use client'

import { useState } from 'react'

export default function SkillCopy({ text, label = 'Copy', primary = false }: { text: string; label?: string; primary?: boolean }) {
  const [done, setDone] = useState(false)
  return <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1800) } catch { /* clipboard blocked */ } }}
    className="rounded px-4 py-2.5 text-sm font-medium"
    style={primary ? { background: 'var(--p-ink)', color: 'var(--p-bg)' } : { border: '1px solid var(--p-border-strong)', color: 'var(--p-ink)' }}>
    <span aria-live="polite">{done ? 'Copied' : label}</span>
  </button>
}
