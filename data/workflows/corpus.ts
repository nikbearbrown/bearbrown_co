// GENERATED FILE - DO NOT EDIT BY HAND.
// Written by scripts/gen-workflow-corpus.py from the parsed artifacts.
// Every number on /criteria/workflows reads from here, so the page cannot
// drift from the corpus the way hardcoded literals on /criteria did.
//
// Regenerate:
//   python3 scripts/gen-workflow-corpus.py CLEAN_TREE HEAD_TREE \
//     > data/workflows/corpus.ts

export type DedupLevel = {
  level: string
  key: string
  distinct: number
  pct: number
  of?: number
}

export type WorkflowCorpus = {
  generated: string
  source: {
    repo: string
    commit: string
    commitDate: string
    why: string
    mirror: string
    headCommit: string
    headDate: string
  }
  corpus: {
    files: number
    wired: number
    noConnections: number
    edgeRefs: number
    edgesDangling: number
    nodes: number
    nodesAnnotation: number
    annotationPct: number
  }
  head: {
    files: number
    wired: number
    edgeRefs: number
    edgesDangling: number
    langchainNodes: number
  }
  dedup: DedupLevel[]
  agentic: {
    found: number
    belowEdgeFloor: number
    minEdges: number
    files: number
    wirings: number
    recipes: number
    recipeCollapsePct: number
    wiringCollapsePct: number
    byKind: Record<string, number>
    recipesByKind: Record<string, number>
    unnamed: number
    models: [string, number][]
    stores: [string, number][]
    tools: [string, number][]
    toolEgress: number
    toolCode: number
  }
  langchainNodesClean: number
}

export const CORPUS: WorkflowCorpus = {
  "generated": "2026-08-21",
  "source": {
    "repo": "Zie619/n8n-workflows",
    "commit": "c4885eee",
    "commitDate": "2025-08-05",
    "why": "last commit where the connection graph resolves",
    "mirror": "Danitilahun/n8n-workflow-templates",
    "headCommit": "94007c1",
    "headDate": "2026-06-24"
  },
  "corpus": {
    "files": 2055,
    "wired": 2000,
    "noConnections": 53,
    "edgeRefs": 21557,
    "edgesDangling": 69,
    "nodes": 29518,
    "nodesAnnotation": 7449,
    "annotationPct": 25.2
  },
  "head": {
    "files": 2061,
    "wired": 4,
    "edgeRefs": 27544,
    "edgesDangling": 27525,
    "langchainNodes": 1
  },
  "dedup": [
    {
      "level": "file",
      "key": "sha256 of bytes",
      "distinct": 1999,
      "pct": 2.7
    },
    {
      "level": "canonical",
      "key": "strip id, position, webhookId, credentials, timestamps; sort keys",
      "distinct": 1981,
      "pct": 3.6
    },
    {
      "level": "wiring",
      "key": "node-type multiset + edge set, annotation nodes removed",
      "distinct": 1694,
      "pct": 15.3,
      "of": 2000
    }
  ],
  "agentic": {
    "found": 612,
    "belowEdgeFloor": 3,
    "minEdges": 3,
    "files": 609,
    "wirings": 458,
    "recipes": 299,
    "recipeCollapsePct": 50.9,
    "wiringCollapsePct": 24.8,
    "byKind": {
      "chain": 205,
      "tool agent": 144,
      "chat agent": 174,
      "RAG agent": 86
    },
    "recipesByKind": {
      "RAG agent": 59,
      "chain": 83,
      "tool agent": 75,
      "chat agent": 82
    },
    "unnamed": 268,
    "models": [
      [
        "lmChatOpenAi",
        432
      ],
      [
        "lmChatGoogleGemini",
        111
      ],
      [
        "openAi",
        70
      ],
      [
        "lmChatOpenRouter",
        23
      ],
      [
        "lmChatAnthropic",
        20
      ],
      [
        "lmChatOllama",
        17
      ],
      [
        "lmChatGroq",
        12
      ],
      [
        "lmChatMistralCloud",
        8
      ]
    ],
    "stores": [
      [
        "vectorStoreQdrant",
        43
      ],
      [
        "vectorStorePinecone",
        19
      ],
      [
        "vectorStoreSupabase",
        11
      ],
      [
        "vectorStoreInMemory",
        5
      ],
      [
        "vectorStoreMilvus",
        4
      ],
      [
        "vectorStorePGVector",
        3
      ],
      [
        "vectorStoreMongoDBAtlas",
        1
      ]
    ],
    "tools": [
      [
        "toolWorkflow",
        89
      ],
      [
        "toolHttpRequest",
        45
      ],
      [
        "toolVectorStore",
        27
      ],
      [
        "toolWikipedia",
        21
      ],
      [
        "toolCalculator",
        18
      ],
      [
        "toolSerpApi",
        11
      ],
      [
        "toolCode",
        9
      ],
      [
        "toolThink",
        5
      ]
    ],
    "toolEgress": 45,
    "toolCode": 9
  },
  "langchainNodesClean": 3957
}
