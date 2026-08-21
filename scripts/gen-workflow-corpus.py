#!/usr/bin/env python3
"""
Regenerate data/workflows/corpus.ts from the parsed workflow artifacts.

Every number on /criteria/workflows reads from that file, so the page cannot
drift from the corpus the way the hardcoded literals on /criteria did.

Usage:
    python3 scripts/gen-workflow-corpus.py CLEAN_TREE HEAD_TREE > data/workflows/corpus.ts

CLEAN_TREE  a checkout of the corpus at the commit whose wiring resolves
HEAD_TREE   a checkout at upstream HEAD, for the comparison block

Both arguments are directories containing workflows/**/*.json.
"""
import json
import os
import re
import sys
import glob
import hashlib
from collections import Counter, defaultdict

ANNOTATION = {"stickyNote", "noOp"}
NOISE_KEYS = {
    "webhookId", "position", "createdAt", "updatedAt", "versionId", "credentials",
    "notes", "notesInFlow", "color", "disabled", "continueOnFail", "alwaysOutputData",
    "executeOnce", "retryOnFail", "maxTries", "waitBetweenTries", "onError", "pinData",
    "meta", "staticData", "tags", "instanceId", "typeVersion", "id",
}
TRIGGER = re.compile(r"(trigger|webhook|cron|schedule|interval)$", re.I)
MODEL = re.compile(r"^lc\.lmChat|^lc\.lm[A-Z]|^lc\.openAi$")
MEMORY = re.compile(r"^lc\.memory")
TOOL = re.compile(r"^lc\.tool")
VECTOR = re.compile(r"^lc\.vectorStore")
EMBED = re.compile(r"^lc\.embeddings")
CHAIN = re.compile(
    r"^lc\.chain|^lc\.informationExtractor|^lc\.sentimentAnalysis|^lc\.textClassifier"
)


def norm_type(t):
    t = t or ""
    return t.replace("n8n-nodes-base.", "").replace("@n8n/n8n-nodes-langchain.", "lc.")


def canonical(o):
    if isinstance(o, dict):
        return {k: canonical(v) for k, v in sorted(o.items()) if k not in NOISE_KEYS}
    if isinstance(o, list):
        return [canonical(x) for x in o]
    return o


def parse(path):
    """Parse one workflow file into the shape every downstream check reads."""
    raw = open(path, "rb").read()
    try:
        doc = json.loads(raw)
    except Exception:
        return None
    if not isinstance(doc, dict):
        return None
    nodes = [n for n in (doc.get("nodes") or []) if isinstance(n, dict)]
    types = [norm_type(n.get("type")) for n in nodes]

    # This corpus keys `connections` by node id, not node name. Resolve id first,
    # fall back to name; anything that resolves to neither is a dangling edge.
    index = {}
    for i, n in enumerate(nodes):
        if n.get("id") is not None:
            index.setdefault(n["id"], i)
    for i, n in enumerate(nodes):
        if n.get("name") is not None:
            index.setdefault(n["name"], i)

    edges, refs, dangling = set(), 0, 0
    conns = doc.get("connections")
    has_conn = isinstance(conns, dict) and len(conns) > 0
    if has_conn:
        for src, outs in conns.items():
            if not isinstance(outs, dict):
                continue
            si = index.get(src)
            for _, branches in outs.items():
                if not isinstance(branches, list):
                    continue
                for branch in branches:
                    if not isinstance(branch, list):
                        continue
                    for ref in branch:
                        if not isinstance(ref, dict):
                            continue
                        refs += 1
                        ti = index.get(ref.get("node"))
                        if si is None or ti is None:
                            dangling += 1
                        else:
                            edges.add((si, ti))

    keep = [i for i, t in enumerate(types) if t not in ANNOTATION]
    remap = {o: i for i, o in enumerate(keep)}
    return {
        "name": doc.get("name") or "",
        "l0": hashlib.sha256(raw).hexdigest()[:20],
        "l1": hashlib.sha256(
            json.dumps(canonical(doc), sort_keys=True, separators=(",", ":")).encode()
        ).hexdigest()[:20],
        "types": types,
        "n": len(types),
        "hasConn": has_conn,
        "refs": refs,
        "dangling": dangling,
        "edges": sorted(edges),
        "xt": [types[i] for i in keep],
        "xe": sorted({(remap[a], remap[b]) for a, b in edges if a in remap and b in remap}),
    }


def wl_hash(types, edges, rounds=3):
    """Weisfeiler-Lehman hash over the node-type-labeled graph."""
    labels = list(types)
    out_adj, in_adj = defaultdict(list), defaultdict(list)
    for a, b in edges:
        out_adj[a].append(b)
        in_adj[b].append(a)
    for _ in range(rounds):
        labels = [
            hashlib.md5(
                repr((
                    labels[i],
                    tuple(sorted(labels[j] for j in out_adj[i])),
                    tuple(sorted(labels[j] for j in in_adj[i])),
                )).encode()
            ).hexdigest()[:12]
            for i in range(len(labels))
        ]
    return hashlib.sha256(repr(sorted(Counter(labels).items())).encode()).hexdigest()[:20]


def anatomy(row):
    xt = row["xt"]
    return {
        "agents": sum(1 for t in xt if t == "lc.agent"),
        "models": sorted({t[3:] for t in xt if MODEL.match(t)}),
        "memory": sorted({t[3:] for t in xt if MEMORY.match(t)}),
        "tools": sorted({t[3:] for t in xt if TOOL.match(t)}),
        "vector": sorted({t[3:] for t in xt if VECTOR.match(t)}),
        "embed": sorted({t[3:] for t in xt if EMBED.match(t)}),
        "chains": sorted({t[3:] for t in xt if CHAIN.match(t)}),
    }


def kind_of(a):
    if a["vector"]:
        return "RAG agent"
    if a["tools"]:
        return "tool agent"
    if a["agents"]:
        return "chat agent"
    return "chain"


def load(tree):
    rows = []
    for p in sorted(glob.glob(os.path.join(tree, "workflows", "**", "*.json"), recursive=True)):
        r = parse(p)
        if r:
            rows.append(r)
    return rows


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    clean, head = load(sys.argv[1]), load(sys.argv[2])
    n = len(clean)
    wired = [r for r in clean if r["xe"]]

    for r in clean:
        r["h"] = wl_hash(r["xt"], r["xe"]) if r["xt"] else "empty"

    MIN_EDGES = 3  # a listable card needs a graph, not a stub
    agentic, thin = [], 0
    for r in clean:
        if not r["xe"]:
            continue
        a = anatomy(r)
        if not (a["agents"] or a["chains"]):
            continue
        r["anat"] = a
        r["kind"] = kind_of(a)
        r["trigger"] = next((t for t in r["xt"] if TRIGGER.search(t)), "manual")
        r["wiring"] = hashlib.sha256(
            repr(sorted(Counter(r["xt"]).items()) + [tuple(e) for e in r["xe"]]).encode()
        ).hexdigest()[:16]
        r["recipe"] = hashlib.sha256(
            json.dumps(
                [r["kind"], a["models"], a["memory"], a["tools"], a["vector"], a["embed"],
                 a["chains"], r["trigger"]],
                sort_keys=True,
            ).encode()
        ).hexdigest()[:16]
        if len(r["xe"]) < MIN_EDGES:
            thin += 1
            continue
        agentic.append(r)

    nodes = sum(r["n"] for r in clean)
    annot = sum(1 for r in clean for t in r["types"] if t in ANNOTATION)
    lc_clean = sum(1 for r in clean for t in r["types"] if t.startswith("lc."))
    lc_head = sum(1 for r in head for t in r["types"] if t.startswith("lc."))

    def pct(collapsed, total):
        return round(100 * collapsed / total, 1) if total else 0.0

    dedup = [
        {
            "level": "file",
            "key": "sha256 of bytes",
            "distinct": len({r["l0"] for r in clean}),
            "pct": pct(n - len({r["l0"] for r in clean}), n),
        },
        {
            "level": "canonical",
            "key": "strip id, position, webhookId, credentials, timestamps; sort keys",
            "distinct": len({r["l1"] for r in clean}),
            "pct": pct(n - len({r["l1"] for r in clean}), n),
        },
        {
            "level": "wiring",
            "key": "node-type multiset + edge set, annotation nodes removed",
            "distinct": len({r["h"] for r in wired}),
            "pct": pct(len(wired) - len({r["h"] for r in wired}), len(wired)),
            "of": len(wired),
        },
    ]

    data = {
        "generated": os.environ.get("CORPUS_DATE", ""),
        "source": {
            "repo": os.environ.get("CORPUS_REPO", ""),
            "commit": os.environ.get("CORPUS_COMMIT", ""),
            "commitDate": os.environ.get("CORPUS_COMMIT_DATE", ""),
            "why": "last commit where the connection graph resolves",
            "mirror": os.environ.get("CORPUS_MIRROR", ""),
            "headCommit": os.environ.get("CORPUS_HEAD_COMMIT", ""),
            "headDate": os.environ.get("CORPUS_HEAD_DATE", ""),
        },
        "corpus": {
            "files": n,
            "wired": len(wired),
            "noConnections": sum(1 for r in clean if not r["hasConn"]),
            "edgeRefs": sum(r["refs"] for r in clean),
            "edgesDangling": sum(r["dangling"] for r in clean),
            "nodes": nodes,
            "nodesAnnotation": annot,
            "annotationPct": pct(annot, nodes),
        },
        "head": {
            "files": len(head),
            "wired": sum(1 for r in head if r["xe"]),
            "edgeRefs": sum(r["refs"] for r in head),
            "edgesDangling": sum(r["dangling"] for r in head),
            "langchainNodes": lc_head,
        },
        "dedup": dedup,
        "agentic": {
            "found": len(agentic) + thin,
            "belowEdgeFloor": thin,
            "minEdges": MIN_EDGES,
            "files": len(agentic),
            "wirings": len({r["wiring"] for r in agentic}),
            "recipes": len({r["recipe"] for r in agentic}),
            "recipeCollapsePct": pct(
                len(agentic) - len({r["recipe"] for r in agentic}), len(agentic)
            ),
            "wiringCollapsePct": pct(
                len(agentic) - len({r["wiring"] for r in agentic}), len(agentic)
            ),
            "byKind": dict(Counter(r["kind"] for r in agentic)),
            "recipesByKind": dict(
                Counter(
                    next(x["kind"] for x in agentic if x["recipe"] == k)
                    for k in {r["recipe"] for r in agentic}
                )
            ),
            "unnamed": sum(1 for r in agentic if not r["name"].strip()),
            "models": Counter(m for r in agentic for m in r["anat"]["models"]).most_common(8),
            "stores": Counter(m for r in agentic for m in r["anat"]["vector"]).most_common(8),
            "tools": Counter(m for r in agentic for m in r["anat"]["tools"]).most_common(8),
            "toolEgress": sum(1 for r in agentic if "toolHttpRequest" in r["anat"]["tools"]),
            "toolCode": sum(1 for r in agentic if "toolCode" in r["anat"]["tools"]),
        },
        "langchainNodesClean": lc_clean,
    }

    header = (
        "// GENERATED FILE - DO NOT EDIT BY HAND.\n"
        "// Written by scripts/gen-workflow-corpus.py from the parsed artifacts.\n"
        "// Every number on /criteria/workflows reads from here, so the page cannot\n"
        "// drift from the corpus the way hardcoded literals on /criteria did.\n"
        "//\n"
        "// Regenerate:\n"
        "//   python3 scripts/gen-workflow-corpus.py CLEAN_TREE HEAD_TREE \\\n"
        "//     > data/workflows/corpus.ts\n\n"
    )
    types_block = open(
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "corpus-types.ts")
    ).read() if os.path.exists(
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "corpus-types.ts")
    ) else TYPES
    body = "export const CORPUS: WorkflowCorpus = " + json.dumps(data, indent=2) + "\n"
    sys.stdout.write(header + types_block + "\n" + body)


TYPES = """export type DedupLevel = {
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
"""

if __name__ == "__main__":
    main()
