import Link from 'next/link'
import { notFound } from 'next/navigation'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  try {
    const rows = await sql`SELECT name, description FROM tools WHERE slug = ${slug}`
    if (rows.length > 0) {
      return {
        title: `${rows[0].name} - Bear Brown Tools`,
        description: rows[0].description || `${rows[0].name} — AI tool by Bear Brown`,
      }
    }
  } catch {}

  return {
    title: 'Tool - Bear Brown',
  }
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const rows = await sql`SELECT * FROM tools WHERE slug = ${slug}`

  if (rows.length === 0) notFound()
  const tool = rows[0]

  // Build iframe src
  let iframeSrc = ''
  let useRawEmbed = false

  if (tool.artifact_embed_code) {
    useRawEmbed = true
  } else if (tool.artifact_id) {
    iframeSrc = `https://claude.site/artifacts/${tool.artifact_id}`
  }

  return (
    <div className="flex flex-col w-full" style={{ minHeight: 'calc(100vh - 4rem)' }}>
      {/* Title Bar */}
      <div className="w-full border-b bg-background">
        <div className="container px-4 md:px-6 mx-auto py-4 flex items-center justify-between">
          <div>
            <Link
              href="/tools"
              className="text-sm text-muted-foreground hover:text-foreground mb-1 inline-block"
            >
              ← Back to Tools
            </Link>
            <h1 className="text-2xl font-bold tracking-tighter">{tool.name}</h1>
            {tool.description && (
              <p className="text-sm text-muted-foreground mt-1">{tool.description}</p>
            )}
          </div>
          {tool.url && (
            <a
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center justify-center rounded-md px-6 text-sm font-medium bg-black text-white shadow hover:bg-gray-800 dark:border dark:border-input dark:bg-background dark:text-foreground dark:shadow-sm dark:hover:bg-accent dark:hover:text-accent-foreground"
            >
              Open External
            </a>
          )}
        </div>
      </div>

      {/* Iframe */}
      <div className="flex-1 w-full">
        {useRawEmbed ? (
          <div
            className="w-full h-full"
            style={{ minHeight: 'calc(100vh - 12rem)' }}
            dangerouslySetInnerHTML={{
              __html: tool.artifact_embed_code.replace(
                /height="[^"]*"/,
                'height="100%" style="min-height:calc(100vh - 12rem);width:100%;border:none;"',
              ),
            }}
          />
        ) : iframeSrc ? (
          <iframe
            src={iframeSrc}
            title={tool.name}
            className="w-full border-none"
            style={{ minHeight: 'calc(100vh - 12rem)' }}
            allow="clipboard-write"
            allowFullScreen
          />
        ) : (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p>No artifact configured for this tool.</p>
          </div>
        )}
      </div>
    </div>
  )
}
