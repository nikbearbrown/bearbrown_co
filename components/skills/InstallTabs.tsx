'use client'

import { useState } from 'react'
import InstallCommand from '@/components/InstallCommand/InstallCommand'

// Install steps are the ones in the bear-brown-tools and skills READMEs; nothing here is invented.
export default function InstallTabs({ slug, canonical = false }: { slug: string; canonical?: boolean }) {
  const clone = canonical ? `git clone https://github.com/nikbearbrown/skills\ncp -R skills/skills/${slug} ~/.claude/skills/` : `git clone https://github.com/nikbearbrown/bear-brown-tools\ncp -R bear-brown-tools/skills/${slug} ~/.claude/skills/`
  const tabs = ['Claude Code', 'Claude.ai', 'Any other chat']
  const [t, setT] = useState(0)
  return <div>
    <div role="tablist" aria-label="Where to use this skill" className="mb-4 flex flex-wrap gap-1 border-b" style={{ borderColor: 'var(--p-border-strong)' }}>
      {tabs.map((n, i) => <button key={n} role="tab" id={`tab-${i}`} aria-selected={t === i} aria-controls={`panel-${i}`} onClick={() => setT(i)}
        className="-mb-px px-4 py-2.5 text-sm" style={{ color: t === i ? 'var(--p-ink)' : 'var(--p-ink-soft)', fontWeight: t === i ? 600 : 400, borderBottom: `3px solid ${t === i ? 'var(--p-ink)' : 'transparent'}` }}>{n}</button>)}
    </div>
    <div role="tabpanel" id="panel-0" aria-labelledby="tab-0" hidden={t !== 0} className="space-y-3 text-sm leading-relaxed">
      <p>Copy the folder into your skills directory, then ask for the job or type its start command.</p>
      <InstallCommand command={clone} />
    </div>
    <div role="tabpanel" id="panel-1" aria-labelledby="tab-1" hidden={t !== 1} className="space-y-3 text-sm leading-relaxed">
      <ol className="list-decimal space-y-2 pl-5"><li>Download <code>SKILL.md</code> with the button above, and put it in a folder named <code>{slug}</code>.</li><li>Zip the folder.</li><li>In Claude, open Settings → Skills and upload the zip.</li></ol>
    </div>
    <div role="tabpanel" id="panel-2" aria-labelledby="tab-2" hidden={t !== 2} className="space-y-3 text-sm leading-relaxed">
      <p><code>SKILL.md</code> is plain Markdown. Copy the text and paste it as the system prompt or the first message. It will not trigger by itself there; you start it.</p>
    </div>
  </div>
}
