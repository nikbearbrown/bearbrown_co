import type { Metadata } from 'next'
import Link from 'next/link'
import { CORPUS } from '@/data/workflows/corpus'

export const metadata: Metadata = {
  title: 'Workflow Listing Criteria — Bear Brown',
  description:
    'How agentic workflow starters are checked and listed: wiring integrity, anatomy classification, recipe deduplication, and what is deliberately not assessed. Every number on this page is regenerated from the artifacts.',
}

const sans: React.CSSProperties = { fontFamily: 'var(--font-sans)' }
const mono: React.CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ padding: '34px 0', borderBottom: '1px solid var(--p-border)' }}>
      <h2
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '26px',
          fontWeight: 600,
          margin: '0 0 6px',
          color: 'var(--p-ink)',
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        ...sans,
        fontSize: '15px',
        lineHeight: 1.65,
        color: 'var(--p-ink-soft)',
        margin: '0 0 12px',
      }}
    >
      {children}
    </p>
  )
}

function Rule({
  result,
  children,
}: {
  result: 'pass' | 'fail' | 'note'
  children: React.ReactNode
}) {
  const colors = { pass: '#3F7D5A', note: '#B07A1E', fail: '#B0472F' }
  const icons = { pass: '✓', note: '→', fail: '✗' }
  return (
    <div
      style={{
        ...sans,
        fontSize: '14px',
        margin: '6px 0',
        paddingLeft: '22px',
        position: 'relative',
        color: 'var(--p-ink-soft)',
      }}
    >
      <span
        aria-hidden="true"
        style={{ position: 'absolute', left: 0, fontWeight: 700, color: colors[result] }}
      >
        {icons[result]}
      </span>
      {children}
    </div>
  )
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        ...sans,
        fontSize: '14px',
        lineHeight: 1.6,
        color: 'var(--p-ink)',
        background: 'var(--p-bg-alt, rgba(0,0,0,0.03))',
        border: '1px solid var(--p-border)',
        borderLeft: '3px solid var(--p-ink)',
        padding: '14px 16px',
        margin: '14px 0',
      }}
    >
      {children}
    </div>
  )
}

function Table({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div style={{ overflowX: 'auto', margin: '14px 0' }}>
      <table
        style={{
          ...sans,
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '14px',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        <thead>
          <tr>
            {head.map((h) => (
              <th
                key={h}
                style={{
                  textAlign: 'left',
                  padding: '8px 10px 8px 0',
                  borderBottom: '1px solid var(--p-border-strong)',
                  color: 'var(--p-ink-muted)',
                  fontSize: '11px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td
                  key={j}
                  style={{
                    padding: '8px 10px 8px 0',
                    borderBottom: '1px solid var(--p-border)',
                    color: j === 0 ? 'var(--p-ink)' : 'var(--p-ink-soft)',
                    verticalAlign: 'top',
                  }}
                >
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code
      style={{
        ...mono,
        fontSize: '0.92em',
        background: 'var(--p-bg-card)',
        border: '1px solid var(--p-border)',
        borderRadius: '2px',
        padding: '1px 5px',
      }}
    >
      {children}
    </code>
  )
}

const C = CORPUS
const A = C.agentic

const gates = [
  {
    title: 'Check 1 — Parse and identify.',
    body:
      'Read the file, identify which tool wrote it, and record the adapter and version that read it. A file no adapter claims is recorded as unread rather than guessed at. Nothing is executed at any point; the artifact is read, never run.',
  },
  {
    title: 'Check 2 — Wiring integrity.',
    body:
      'Resolve both endpoints of every declared connection against the node table and record how many resolve. This is the check that decides whether a listing is possible, and it is the one nothing else in this ecosystem performs.',
  },
  {
    title: 'Check 3 — Anatomy.',
    body:
      'Classify the resolved graph by what it actually contains: model, memory, tool set, vector store, embeddings, output parser, and the ordinary services it touches. The kind — retrieval agent, tool agent, chat agent, chain — falls out of that classification rather than being asserted.',
  },
  {
    title: 'Check 4 — Recipe assignment.',
    body:
      'Hash the artifact four ways — raw bytes, canonical form, wiring, recipe — and place it in the directory relative to what is already listed. New recipe, new card. Everything else attaches to an existing one.',
  },
]

const verdicts = [
  {
    key: 'LISTED',
    desc:
      'The graph resolves, the anatomy classifies, and the recipe is new to the directory. It gets a card, and the card names the file it was derived from.',
  },
  {
    key: 'VARIANT',
    desc:
      'The graph resolves but the recipe already exists. It attaches to that card and contributes to its file count, its wiring count, and its variance summary. It is not discarded, because what differs between members of a recipe is frequently the most useful thing about them.',
  },
  {
    key: 'NOT-ASSESSED',
    desc:
      'The file parses but the graph does not resolve — connections absent, or endpoints that name nodes the file does not contain. Never listed, never counted as a pass, never silently dropped. The reason is recorded.',
  },
  {
    key: 'EXCLUDED',
    desc:
      'A byte-identical or canonically identical copy of something already read. Discarded before any further check runs.',
  },
]

export default function WorkflowCriteriaPage() {
  return (
    <main style={{ maxWidth: '760px', margin: '0 auto', padding: '0 24px 80px' }}>
      <header style={{ padding: '56px 0 8px' }}>
        <div
          style={{
            ...sans,
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--p-terra)',
            marginBottom: '14px',
          }}
        >
          Listing criteria — agentic workflows
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(34px, 5vw, 46px)',
            fontWeight: 600,
            lineHeight: 1.1,
            letterSpacing: '-0.015em',
            margin: '0 0 18px',
            color: 'var(--p-ink)',
            textWrap: 'balance' as React.CSSProperties['textWrap'],
          }}
        >
          What earns a workflow a card
        </h1>
        <p
          style={{
            ...sans,
            fontSize: '17px',
            lineHeight: 1.6,
            color: 'var(--p-ink-soft)',
            margin: 0,
          }}
        >
          A picture of an agentic workflow is a good place to start adapting one to your own
          needs. So a listing here has one job — show you the shape, honestly. Every word on a
          card is computed from the artifact. None of it is taken from what the file, its
          repository, or its published index says about itself.
        </p>
        <p
          style={{
            ...sans,
            fontSize: '13px',
            lineHeight: 1.6,
            color: 'var(--p-ink-muted)',
            margin: '18px 0 0',
          }}
        >
          Sibling page:{' '}
          <Link href="/criteria" style={{ color: 'var(--p-blue)' }}>
            plugin and skill listing criteria
          </Link>
          . Different artifacts, different checks, same floor.
        </p>
      </header>

      <Section title="A listing is a recipe, not a file">
        <Body>
          {A.files.toLocaleString()} agentic workflows survive the checks below. They do not
          make {A.files.toLocaleString()} cards. They make{' '}
          <strong style={{ color: 'var(--p-ink)' }}>{A.recipes}</strong> — because{' '}
          {A.recipeCollapsePct}% of them are the same idea drawn differently.
        </Body>
        <Body>
          A recipe is the tuple of things that determine what a workflow <em>is</em>: its kind,
          its model, its memory, its tool set, its vector store, its embeddings, its chains,
          and its trigger. Two workflows with the same recipe are two people solving the same
          problem with the same parts. Sixteen of them, in one case — laid out sixteen
          different ways, under sixteen different names, {A.unnamed} of the{' '}
          {A.files.toLocaleString()} carrying no name at all.
        </Body>
        <Callout>
          Not one file in this corpus is a byte-for-byte copy of another, and canonical hashing
          removes only {C.dedup[1].pct}%. The {A.recipeCollapsePct}% collapse appears at the
          recipe layer and nowhere else. These are duplicates of an <em>idea</em>, not of an{' '}
          <em>artifact</em>. No file hash will ever see them.
        </Callout>
      </Section>

      <Section title="The four checks">
        {gates.map((g) => (
          <Body key={g.title}>
            <strong style={{ color: 'var(--p-ink)' }}>{g.title}</strong> {g.body}
          </Body>
        ))}
        <Callout>
          <strong>Check 2 is the one that matters, and it is why this page exists.</strong> The
          corpus these listings come from parses perfectly — every file is valid JSON with a
          valid node array. At its current published HEAD, {C.head.edgesDangling.toLocaleString()}{' '}
          of {C.head.edgeRefs.toLocaleString()} connection endpoints name nodes that are not in
          the file, leaving {C.head.wired} of {C.head.files.toLocaleString()} workflows with a
          graph anyone could read. Every tool that has looked at that repository — its own
          search API, its published index, its README — reports it as healthy, because none of
          them resolves an edge.
        </Callout>
      </Section>

      <Section title="What gets in">
        <Body>
          Each candidate runs the ladder below, cheapest test first, and stops at the first
          hit.
        </Body>
        <Rule result="fail">
          <strong>Raw hash seen before</strong> — excluded. An exact copy.
        </Rule>
        <Rule result="fail">
          <strong>Canonical hash seen before</strong> — excluded. The same workflow re-exported
          from another instance: node ids, canvas coordinates, webhook ids and timestamps
          stripped, keys sorted.
        </Rule>
        <Rule result="note">
          <strong>Graph does not resolve</strong> — not-assessed. Never listed, and the reason
          is recorded rather than the file being quietly dropped.
        </Rule>
        <Rule result="note">
          <strong>Fewer than {A.minEdges} resolved edges</strong> — held back as a stub. A card
          has to show a shape. {A.belowEdgeFloor} of the {A.found} agentic workflows found sit
          below this floor.
        </Rule>
        <Rule result="note">
          <strong>Wiring hash seen before</strong> — attaches to that card as another wiring of
          the same recipe.
        </Rule>
        <Rule result="note">
          <strong>Recipe seen before</strong> — attaches to that card as another file.
        </Rule>
        <Rule result="pass">
          <strong>Otherwise</strong> — admitted, with its own card.
        </Rule>
        <Body>
          The two hash steps do almost nothing inside a single repository that has already been
          deduplicated upstream — {C.dedup[0].pct}% and {C.dedup[1].pct}% here. Across mirrors
          they do the heavy lifting, because a canonical hash survives a reformat between forks
          where a raw file hash does not.
        </Body>
      </Section>

      <Section title="Verdicts">
        <Table
          head={['Verdict', 'What it means']}
          rows={verdicts.map((v) => [
            <span key={v.key} style={{ ...mono, fontSize: '12.5px', fontWeight: 600 }}>
              {v.key}
            </span>,
            v.desc,
          ])}
        />
        <Body>
          <strong style={{ color: 'var(--p-ink)' }}>Variants attach; they are not thrown
          away.</strong> If fifteen members of a recipe handle a failure branch and one does
          not, collapsing to a single representative and discarding the rest erases the only
          interesting thing in the group. The card keeps the summary of what differs — how many
          distinct wirings, what range of node counts, which services appear across members —
          and drops only the duplicate payloads.
        </Body>
      </Section>

      <Section title="What a card is allowed to say">
        <Body>
          Everything above the rule on a card is computed from the graph: the pattern string,
          the kind, the model, the memory, the tool set, the store, the node counts. Everything
          below it is quoted, attributed, and marked unverified.
        </Body>
        <Rule result="pass">
          <strong>Derived.</strong> Node types and resolved edges, read from the artifact.
        </Rule>
        <Rule result="note">
          <strong>Claimed.</strong> The name the file gives itself, shown under a rule and
          labelled <em>upstream name — unverified</em>. It is displayed because it is sometimes
          informative and never because it is trusted.
        </Rule>
        <Rule result="fail">
          <strong>Never used.</strong> Repository README text, a published index&rsquo;s
          description, a badge, a star count, or a category assigned by anything other than the
          artifact.
        </Rule>
        <Callout>
          That last line is not caution for its own sake. On this corpus the published index
          describes workflows as orchestrating models that are not present in the file, and{' '}
          {A.unnamed} of {A.files.toLocaleString()} agentic workflows self-report no name at
          all. An index, a README and a file&rsquo;s own <Code>name</Code> field are three
          claims about an artifact. This directory reads the artifact.
        </Callout>
      </Section>

      <Section title="What is not assessed">
        <Body>
          A card tells you the shape of a workflow. It does not tell you whether the workflow
          is any good, and nothing here should be read as saying so.
        </Body>
        <Rule result="note">
          <strong>Whether it runs.</strong> Nothing is imported, installed, or executed. A
          resolvable graph is a readable graph, not a working one.
        </Rule>
        <Rule result="note">
          <strong>Whether the output is correct or useful.</strong> No workflow here has been
          run against real input and no result has been judged.
        </Rule>
        <Rule result="note">
          <strong>Credential safety.</strong> Credentials live outside these files by design,
          so their absence is expected and proves nothing about how the original was operated.
        </Rule>
        <Rule result="note">
          <strong>What the agent&rsquo;s tools can reach.</strong> {A.toolEgress} of the{' '}
          {A.files.toLocaleString()} carry an arbitrary HTTP tool and {A.toolCode} carry a code
          tool — network and execution surface handed to a model rather than to a developer.
          Those are recorded and displayed. They are not yet audited.
        </Rule>
        <Body>
          The behavioural gate that would close the last two has not been built. Until it is,
          the fields it would fill stay absent rather than being filled with a default that
          reads like a finding.
        </Body>
      </Section>

      <Section title="What you can take away">
        <Body>
          Each card offers a canonical JSON description of the workflow — its steps, its edges,
          and a provenance block naming the file it came from, the executable-versus-annotation
          split, and the unverified name claim — alongside a prompt written to hand that shape
          to a coding agent.
        </Body>
        <Body>
          The canonical form is deliberately not an n8n file. n8n is a good notation for an
          agentic workflow and a poor runtime for one, and the point of a starter is the shape,
          not the vendor. Converters back out to specific tools are intended and{' '}
          <strong style={{ color: 'var(--p-ink)' }}>do not exist yet</strong>. When one ships it
          will be named here, and until then this sentence is the whole status.
        </Body>
      </Section>

      <Section title="Where the listings come from">
        <Body>
          Everything currently listed is read from{' '}
          <Code>{C.source.repo}</Code> at commit <Code>{C.source.commit}</Code> (
          {C.source.commitDate}) — {C.source.why} — and cross-checked against an uncorrupted
          public mirror, <Code>{C.source.mirror}</Code>. The comparison with that
          repository&rsquo;s current HEAD is the reason the wiring check exists at all.
        </Body>
        <Table
          head={['', `at ${C.source.commit}`, `at HEAD (${C.source.headDate})`]}
          rows={[
            [
              'workflows with a readable graph',
              `${C.corpus.wired.toLocaleString()} of ${C.corpus.files.toLocaleString()}`,
              `${C.head.wired} of ${C.head.files.toLocaleString()}`,
            ],
            [
              'connection endpoints that resolve',
              `${(C.corpus.edgeRefs - C.corpus.edgesDangling).toLocaleString()} of ${C.corpus.edgeRefs.toLocaleString()}`,
              `${(C.head.edgeRefs - C.head.edgesDangling).toLocaleString()} of ${C.head.edgeRefs.toLocaleString()}`,
            ],
            [
              'LLM and agent nodes present',
              C.langchainNodesClean.toLocaleString(),
              C.head.langchainNodes.toLocaleString(),
            ],
          ]}
        />
        <Body>
          Two further properties of this corpus are worth stating because they bear on what any
          listing built from it can honestly claim.{' '}
          {C.corpus.noConnections.toLocaleString()} files ship a node array and no connections
          object whatsoever — those are not workflows and are recorded as not-assessed. And{' '}
          {C.corpus.annotationPct}% of all nodes in the corpus are sticky notes and no-ops,
          which is why node counts on a card separate executable nodes from annotation rather
          than reporting one number that flatters the artifact.
        </Body>
      </Section>

      <Section title="The numbers, and where they come from">
        <Table
          head={['Level', 'Key', 'Distinct', 'Collapsed']}
          rows={C.dedup.map((d) => [
            <span key={d.level} style={{ ...mono, fontSize: '12.5px' }}>
              {d.level}
            </span>,
            <span key={d.level + 'k'} style={{ fontSize: '13px' }}>
              {d.key}
            </span>,
            d.distinct.toLocaleString(),
            `${d.pct}%${d.of ? ` of ${d.of.toLocaleString()}` : ''}`,
          ])}
        />
        <Table
          head={['Kind', 'Workflows', 'Recipes']}
          rows={Object.keys(A.byKind)
            .sort((a, b) => A.byKind[b] - A.byKind[a])
            .map((k) => [k, A.byKind[k].toLocaleString(), (A.recipesByKind[k] ?? 0).toLocaleString()])}
        />
        <Callout>
          Every figure on this page is read at build time from{' '}
          <Code>data/workflows/corpus.ts</Code>, which is regenerated from the artifacts by{' '}
          <Code>scripts/gen-workflow-corpus.py</Code>. None of them is typed into this file by
          hand. A page whose entire argument is &ldquo;we publish what the artifacts show&rdquo;
          should read the artifacts, and the counts on it should go stale only when the corpus
          does.
        </Callout>
        <Body>
          Corpus generated {C.generated}. A number here that a re-read of the artifacts does not
          reproduce is a defect — report it and it gets corrected in public, with the
          correction kept.
        </Body>
      </Section>
    </main>
  )
}
