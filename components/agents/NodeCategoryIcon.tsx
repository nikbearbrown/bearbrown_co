import { Zap, BrainCircuit, Database, GitBranch, Shuffle, Code2, Globe, Send, FileText, Workflow, Timer, Plug, type LucideProps } from 'lucide-react'
import { NODE_CATEGORIES, getNodeCategory, type NodeCategory } from '@/lib/n8n-node-categories'

const icons = { zap: Zap, brain: BrainCircuit, database: Database, branch: GitBranch, shuffle: Shuffle, code: Code2, globe: Globe, send: Send, file: FileText, workflow: Workflow, timer: Timer, plug: Plug }
export function NodeCategoryIcon({ category, ...props }: LucideProps & { category: NodeCategory }) {
  const Icon = icons[NODE_CATEGORIES[category].icon]
  return <Icon aria-hidden="true" focusable="false" {...props} />
}
export function NodeCategoryBadge({ type }: { type: string }) {
  const category = getNodeCategory(type), style = NODE_CATEGORIES[category]
  return <span title={style.description} className="inline-flex items-center gap-1.5 whitespace-nowrap rounded px-2 py-1 text-xs" style={{ color: style.color, background: style.background }}><NodeCategoryIcon category={category} size={15} />{style.label}</span>
}
