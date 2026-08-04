'use client'

import { useState } from 'react'

interface Props {
  command: string
}

export default function InstallCommand({ command }: Props) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div style={{
      background: 'var(--p-ink)',
      borderRadius: '6px',
      padding: '0',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '12px',
        padding: '16px 20px',
      }}>
        <pre style={{
          fontFamily: 'monospace',
          fontSize: '13px',
          lineHeight: 1.6,
          color: '#F0E6D0',
          margin: 0,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          flex: 1,
        }}>
          {command}
        </pre>
        <button
          onClick={copy}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            padding: '4px 12px',
            borderRadius: '3px',
            border: copied ? '1px solid #D97757' : '1px solid rgba(240,230,208,0.3)',
            background: copied ? '#D97757' : 'transparent',
            color: copied ? '#fff' : '#F0E6D0',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.2s',
          }}
          aria-label="Copy install command"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  )
}
