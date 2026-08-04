export type Tier = 'excellent' | 'strong' | 'promising'
export type InstallResult = 'pass' | 'fail'
export type RiskResult = 'clean' | 'flagged'
export type PluginKind = 'code-backed' | 'prompt-only'

export interface Audit {
  sha: string            // full HEAD commit sha at time of audit
  date: string           // ISO date YYYY-MM-DD
  installs: InstallResult
  installNote?: string   // if fail, explain why
  riskScan: RiskResult
  riskNote?: string      // if flagged, what was found
  kind: PluginKind
  proseLines: number     // total lines in .md + .txt files
  codeLines: number      // total lines in .ts + .js + .py + .sh files
  proseToCodeRatio: number
}

export interface VideoRef {
  youtubeId: string
  title: string
}

export interface CatalogEntry {
  slug: string
  name: string
  repoUrl: string
  description: string   // one sentence
  audit: Audit
  tier: Tier            // derived from audit; never hand-waved
  dupes?: {
    clusterNote: string // e.g. "3 near-duplicates exist; this is best-maintained"
  }
  video: VideoRef | null  // null until teardown ships
  verdict: string         // 2-4 sentences of plain prose
  tags: string[]
  installCommand: string  // the command users run to install
}
