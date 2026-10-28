export type LoopPattern = {
  id: string
  name: string
  summary: string
  mermaid: string
  iterates: string
  feedback: string
  stops: string
  judge: 'program' | 'model' | 'human' | 'none'
  failure: string
}

// Draft taxonomy (2026-10-28). Derived from reading the literature and the agent diagrams by hand,
// not from a measured count: no prevalence is claimed.
export const LOOP_DIMENSIONS = [
  ['What iterates', 'The unit that repeats: a step, a draft, an item, a subtask, a whole run.'],
  ['What is fed back', 'Observation, error message, critique, human edit, or nothing.'],
  ['What stops it', 'A goal check, a max-iteration cap, a budget, or the input running out.'],
  ['Who judges', 'A program, a model, a human, or nobody (then only the cap stops it).'],
  ['What persists', 'State carried between turns: scratchpad, memory store, files, queue position.'],
] as const

export const LOOP_PATTERNS: LoopPattern[] = [
  { id: 'tool-use', name: 'Think–act–observe (ReAct)', summary: 'The model picks a tool, the tool runs, the result goes back into context, and the model picks again.',
    mermaid: 'flowchart LR\n  A[Model decides] --> B{Tool call?}\n  B -- yes --> C[Run tool]\n  C --> D[Observation]\n  D --> A\n  B -- no --> E[Final answer]',
    iterates: 'One model step', feedback: 'Tool output', stops: 'Model stops calling tools, or an iteration cap', judge: 'model', failure: 'Never stops, or repeats the same failing call.' },
  { id: 'plan-execute', name: 'Plan, then execute steps', summary: 'A plan is written first; a worker loop runs each step; a failure triggers a revised plan.',
    mermaid: 'flowchart LR\n  P[Write plan] --> S[Run next step]\n  S --> C{Step ok?}\n  C -- yes --> M{More steps?}\n  M -- yes --> S\n  M -- no --> Z[Done]\n  C -- no --> R[Replan]\n  R --> S',
    iterates: 'One plan step', feedback: 'Step result; failure triggers replanning', stops: 'Plan exhausted or replan cap', judge: 'model', failure: 'Plan goes stale and is followed anyway.' },
  { id: 'critique-revise', name: 'Generate, critique, revise', summary: 'One pass drafts, another critiques against criteria, the draft is rewritten until the critic passes it.',
    mermaid: 'flowchart LR\n  G[Draft] --> K[Critique]\n  K --> Q{Passes?}\n  Q -- no --> V[Revise]\n  V --> K\n  Q -- yes --> O[Output]',
    iterates: 'A whole draft', feedback: 'Written critique', stops: 'Critic passes it, or round cap', judge: 'model', failure: 'Critic shares the writer\'s blind spots, so it approves flawed work.' },
  { id: 'verify', name: 'Generate, verify with a program', summary: 'Output is checked by something that is not a model (tests, schema, linter, compiler); the error message is fed back.',
    mermaid: 'flowchart LR\n  G[Generate] --> T[Run tests / validator]\n  T --> Q{Pass?}\n  Q -- no --> E[Error output]\n  E --> G\n  Q -- yes --> O[Output]',
    iterates: 'A candidate', feedback: 'Test failures, validator errors', stops: 'Checks pass, or attempt cap', judge: 'program', failure: 'Checks are thin, so the agent satisfies them without solving the task.' },
  { id: 'retry', name: 'Retry with backoff and escalation', summary: 'An operation fails, waits, tries again up to a limit, then hands off to a fallback or a person.',
    mermaid: 'flowchart LR\n  A[Attempt] --> Q{Success?}\n  Q -- yes --> O[Continue]\n  Q -- no --> N{Attempts left?}\n  N -- yes --> W[Wait] --> A\n  N -- no --> F[Fallback or alert]',
    iterates: 'One call', feedback: 'Failure status', stops: 'Success or retry limit', judge: 'program', failure: 'Retrying a call that can never succeed; duplicate side effects on retry.' },
  { id: 'human-gate', name: 'Human approval gate', summary: 'The agent proposes an action, a person approves, edits or rejects, and the run continues from that answer.',
    mermaid: 'flowchart LR\n  A[Agent proposes] --> H{Human review}\n  H -- approve --> X[Execute]\n  H -- edit --> A\n  H -- reject --> Z[Stop]',
    iterates: 'A proposed action', feedback: 'Human edit or rejection', stops: 'Approval or rejection', judge: 'human', failure: 'Reviewer fatigue turns approval into a click-through.' },
  { id: 'batch', name: 'Loop over items (batch / poll)', summary: 'A trigger or schedule fetches a list; the same steps run on each item; results are collected. Typical of n8n workflows.',
    mermaid: 'flowchart LR\n  T[Schedule or webhook] --> F[Fetch items]\n  F --> L{Next item?}\n  L -- yes --> P[Process item]\n  P --> L\n  L -- no --> R[Emit results]',
    iterates: 'One item', feedback: 'Usually none between items', stops: 'Input list exhausted', judge: 'none', failure: 'One bad item stalls or silently skips the rest; no goal check on the whole.' },
  { id: 'orchestrator', name: 'Orchestrator and workers', summary: 'A coordinator splits the task, workers handle pieces in parallel or in turn, and the coordinator merges and may issue more subtasks.',
    mermaid: 'flowchart LR\n  O[Orchestrator splits task] --> W1[Worker A]\n  O --> W2[Worker B]\n  W1 --> M[Merge results]\n  W2 --> M\n  M --> Q{Complete?}\n  Q -- no --> O\n  Q -- yes --> Z[Answer]',
    iterates: 'A subtask round', feedback: 'Worker results', stops: 'Coordinator judges the task complete', judge: 'model', failure: 'Cost multiplies; workers return confident but inconsistent pieces.' },
  { id: 'router', name: 'Classify and route', summary: 'Each turn a router decides which specialist handles the input, and control returns to the router afterwards.',
    mermaid: 'flowchart LR\n  I[Input] --> R{Router}\n  R --> A[Specialist A]\n  R --> B[Specialist B]\n  A --> R2{Done?}\n  B --> R2\n  R2 -- no --> R\n  R2 -- yes --> O[Reply]',
    iterates: 'A conversation turn', feedback: 'Specialist output', stops: 'Router declares done', judge: 'model', failure: 'Misrouting; ping-pong between specialists.' },
  { id: 'memory', name: 'Retrieve, act, write memory', summary: 'Each turn reads stored context, responds, then writes new facts back so the next run starts informed. The Google Sheets chatbot is an example.',
    mermaid: 'flowchart LR\n  M[(Memory store)] --> R[Retrieve context]\n  R --> A[Respond]\n  A --> W[Write update]\n  W --> M',
    iterates: 'A session turn', feedback: 'Stored history', stops: 'Session ends (nothing in the loop decides)', judge: 'none', failure: 'Memory fills with errors that later turns trust.' },
  { id: 'outer-improve', name: 'Outer improvement loop', summary: 'A whole agent run is scored against a goal metric, and the prompt, tools or settings are changed before the next run.',
    mermaid: 'flowchart LR\n  R[Run agent on test set] --> S[Score against goal]\n  S --> Q{Target met?}\n  Q -- no --> C[Change prompt or config]\n  C --> R\n  Q -- yes --> Z[Ship]',
    iterates: 'A complete run', feedback: 'Score on the metric', stops: 'Target met or budget spent', judge: 'program', failure: 'Overfits the test set; the metric is optimized instead of the goal.' },
]
