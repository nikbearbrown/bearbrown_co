import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tools - Bear Brown',
  description: 'AI tools directory curated by Nik Bear Brown.',
}

export default function ToolsPage() {
  return (
    <div className="container px-4 md:px-6 mx-auto py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tighter mb-4">Tools</h1>
        <p className="text-muted-foreground mb-8">
          A curated directory of AI tools for educators, students, and professionals.
        </p>
        <p className="text-sm text-muted-foreground">
          Tools directory coming soon.
        </p>
      </div>
    </div>
  )
}
