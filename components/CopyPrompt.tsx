'use client'

import { useState } from 'react'

export default function CopyPrompt({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
      style={{
        fontFamily: 'var(--font-sans)', fontSize: '12px', letterSpacing: '0.06em',
        textTransform: 'uppercase', color: 'var(--p-bg-card)',
        background: copied ? 'var(--p-blue)' : 'var(--p-ink)',
        border: 'none', borderRadius: '4px', padding: '10px 18px', cursor: 'pointer',
      }}
    >
      {copied ? 'Copied' : 'Copy prompt'}
    </button>
  )
}
