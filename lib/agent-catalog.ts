import catalog from '@/data/agents/catalog.json'
import details from '@/data/agents/details.json'
import { formatN8nLabel } from './n8n-labels'
import type { WorkflowEntry } from './n8n-catalog'
export type AgentImplementation = { id: string; label: string; status: string; path: string; files?: string[]; evidence?: string }
export type AgentDetail = {
  purpose: string; overview: string; specification_status: string; entry_nodes: string[]; terminal_nodes: string[]; unresolved: string[]
  implementations: AgentImplementation[]; prompts: { id: string; label: string; path: string; status: string }[]; mermaid: string
}
export const agents: WorkflowEntry[] = catalog.map(e => ({ ...e, title: formatN8nLabel(e.title), description: formatN8nLabel(e.description), integrations: e.integrations.map(formatN8nLabel) }))
const bySlug = new Map(agents.map(e => [e.slug, e]))
export function getAgent(slug: string) { return bySlug.get(slug) }
export function getAgentDetail(slug: string): AgentDetail | undefined { return (details as Record<string, AgentDetail>)[slug] }
export const repositoryUrl = 'https://github.com/nikbearbrown/Agents'
export function implementationStatus(status: string) {
  return ({ planned: 'Planned · no code yet', 'source-available': 'Source available · not runtime-tested', 'reported-fixture-tested': 'Prior fixture reports · review scope', 'fixture-tested': 'Fixture-tested', 'live-tested': 'Live-tested · review scope' } as Record<string, string>)[status] || status
}
