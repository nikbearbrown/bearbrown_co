import catalog from '@/data/n8n/catalog.json'
import { formatN8nLabel } from './n8n-labels'
import details from '@/data/n8n/details.json'

export type WorkflowEntry = {
  slug: string; title: string; description: string; nodeCount: number
  integrations: string[]; category: string; license: string; file: string
  implementations?: { id: string; label: string; status: string }[]
}
export type WorkflowNode = { id: string; name: string; type: string; position: number[]; note: string; sticky: boolean; operation: string }
export type WorkflowDetail = {
  nodes: WorkflowNode[]; edges: { from: string; to: string; kind: string; output: number }[]
  credentials: string[]; sourceUrl: string | null; licenseNotice: string; sourceHash: string; publicationHash: string
  configurationChanges: number; snapshotCount: number; findings: string
}
export const workflows: WorkflowEntry[] = catalog.map(entry => ({ ...entry, title: formatN8nLabel(entry.title), description: formatN8nLabel(entry.description), integrations: entry.integrations.map(formatN8nLabel) }))
const bySlug = new Map(workflows.map(entry => [entry.slug, entry]))
export function getWorkflow(slug: string) { return bySlug.get(slug) }
export function getWorkflowDetail(slug: string): WorkflowDetail | undefined {
  if (!bySlug.has(slug)) return undefined
  const detail = (details as Record<string, WorkflowDetail>)[slug]
  return { ...detail, nodes: detail.nodes.map(node => ({ ...node, type: formatN8nLabel(node.type) })) }
}
export const repositoryUrl = 'https://github.com/nikbearbrown/Agents'
