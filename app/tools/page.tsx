import Link from 'next/link'
import type { Metadata } from 'next'
import { sql } from '@/lib/db'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Tools - Bear Brown',
  description: 'AI tools directory curated by Nik Bear Brown.',
}

interface Tool {
  id: string
  name: string
  slug: string
  description: string | null
  tool_type: 'link' | 'artifact'
  claude_url: string | null
  tags: string[]
}

async function getTools(): Promise<Tool[]> {
  try {
    return await sql`SELECT * FROM tools ORDER BY created_at DESC`
  } catch (err) {
    console.error('[tools/page] Failed to fetch tools:', err)
    return []
  }
}

export default async function ToolsPage() {
  const tools = await getTools()

  return (
    <div className="container px-4 md:px-6 mx-auto py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tighter mb-4">Tools</h1>
        <p className="text-muted-foreground mb-8">
          A curated directory of AI tools for educators, students, and professionals.
        </p>

        {tools.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Tools directory coming soon.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {tools.map((tool) => {
              const isArtifact = tool.tool_type === 'artifact'
              const href = isArtifact ? `/tools/${tool.slug}` : tool.claude_url

              const cardContent = (
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {tool.name}
                      {isArtifact && (
                        <Badge variant="default" className="text-xs">
                          Artifact
                        </Badge>
                      )}
                    </CardTitle>
                    {tool.description && (
                      <CardDescription>{tool.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    {tool.tags && tool.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {tool.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )

              if (isArtifact) {
                return (
                  <Link key={tool.id} href={href!}>
                    {cardContent}
                  </Link>
                )
              }

              return (
                <a
                  key={tool.id}
                  href={href || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {cardContent}
                </a>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
