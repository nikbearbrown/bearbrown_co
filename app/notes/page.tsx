import { join } from 'path'
import type { Metadata } from 'next'
import { scanHtmlSubdirs } from '@/lib/html-meta'
import NotesBrowser from './NotesBrowser'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Notes - Bear Brown',
  description: 'Notes, documentation, and reference materials.',
}

export default function NotesPage() {
  const groups = scanHtmlSubdirs(join(process.cwd(), 'public', 'notes'))

  return (
    <div className="container px-4 md:px-6 mx-auto py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tighter mb-4">Notes</h1>
        <p className="text-muted-foreground mb-10">
          Notes, documentation, and reference materials.
        </p>
        <NotesBrowser groups={groups} />
      </div>
    </div>
  )
}
