import type { TranscriptParagraph } from '@/lib/video-articles'
import { formatTimestamp } from '@/lib/video-articles'

export default function TranscriptSection({ videoId, paragraphs }: { videoId: string; paragraphs: TranscriptParagraph[] }) {
  if (!paragraphs.length) return null
  return (
    <details className="mt-12 rounded-lg border border-silver/40 bg-muted/40 p-5 open:bg-background">
      <summary className="cursor-pointer text-lg font-semibold tracking-tight">
        Full transcript
        <span className="ml-2 text-sm font-normal text-muted-foreground">(auto-generated, with timestamps)</span>
      </summary>
      <div className="mt-5 space-y-4 text-[16px] leading-[1.75]">
        {paragraphs.map((p, i) => (
          <div key={i}>
            {p.title && <h3 className="mb-1 mt-6 text-base font-semibold">{p.title}</h3>}
            <p>
              {p.t !== null && p.t !== undefined && (
                <a
                  href={`https://www.youtube.com/watch?v=${videoId}&t=${Math.floor(p.t)}s`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mr-2 font-mono text-xs text-muted-foreground hover:text-foreground"
                  title="Open this moment on YouTube"
                >
                  [{formatTimestamp(p.t)}]
                </a>
              )}
              {p.text}
            </p>
          </div>
        ))}
      </div>
    </details>
  )
}
