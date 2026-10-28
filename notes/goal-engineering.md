# Goal engineering — working notes

Draft notes, 2026-10-28. Not published. Claims about papers are from memory of the literature; check each citation before it goes on a public page.

## Executive summary

- A goal is only as good as its **checker**. If no procedure, run by someone other than the goal-setter, can say "met" or "not met", it is a wish.
- "Objective" has two meanings here. **Objective goal** = the outcome can be verified without trusting the goal-setter's judgment. **Objective function** = the number an optimizer maximizes. Goal engineering is the job of making the second a faithful stand-in for the first.
- Every metric is a proxy. Optimize a proxy hard enough and it separates from what you wanted (Goodhart). So a goal is a *bundle*: target + metric + threshold + horizon + constraints + a plan for how the metric could be gamed.
- In reinforcement learning the goal *is* the reward function (the reward hypothesis). Reward shaping adds extra signal to speed learning; only **potential-based shaping** is guaranteed not to change what the best policy is. Everything else can teach the agent to chase the helper signal instead of the goal.

## 1. Vocabulary (keep these apart)

| Term | Meaning | Example (an n8n support agent) |
|---|---|---|
| Intent | What the person actually wants | Customers get correct answers quickly |
| Goal | A stated, checkable outcome | ≥ 90% of test questions answered correctly within 10 s |
| Metric | How the outcome is measured | Exact-match / rubric score on a fixed question set; p95 latency |
| Reward / objective function | The number an optimizer sees | `+1` correct, `−0.1` per second over 10 s |
| Constraint | A condition that must hold regardless of score | Never send a customer's data to a third party |
| Spec | All of the above, written down | `specification.md` |

Most failures are a gap between two adjacent rows: intent→goal (wrong thing stated), goal→metric (can't measure it), metric→reward (optimizer finds a loophole).

## 2. What makes a goal objective?

A goal is objective to the degree that:

1. **Observable.** The outcome shows up in data, not in someone's impression.
2. **Operationally defined.** "Good answer" is replaced by a procedure: compare against reference, run the tests, apply this rubric.
3. **Checker-independent.** A different person (or program) running the procedure gets the same answer. Test: inter-rater agreement, or just rerun it.
4. **Falsifiable.** There is a result that would say "failed". (Popper falsifiability.)
5. **Time-bounded.** Measured over a stated horizon or sample.

Degrees, not a switch. A ladder from weakest to strongest:

1. Narrative ("be helpful")
2. Rubric with human judgment (agreement measured)
3. Rubric scored by a model judge (judge itself validated against humans)
4. Scalar metric from data (rate, count, latency)
5. Binary programmatic check (tests pass / schema validates / state reached)

Move a goal *down* the ladder numbers-wise where possible, but do not pretend a level-4 number measures a level-1 concern unless you have shown it does.

## 3. Framing a goal

A usable template (SMART and OKR are special cases; neither says what to do about gaming):

```
Outcome:      what is true of the world if this succeeds
Metric:       the measurement procedure, including the dataset / sample
Target:       threshold and uncertainty (e.g. ≥ 0.90, 95% CI lower bound)
Horizon:      when / over how many runs
Baseline:     what the current or naive approach scores (so "improved" means something)
Constraints:  hard limits that no score can buy back (safety, cost cap, privacy)
Priorities:   what wins when two goals conflict (lexicographic order, or weights with reasons)
Gaming check: the three cheapest ways to hit the number without the outcome
Owner/review: who can change the goal and when it is re-examined
```

Rules of thumb:

- **Outcomes over activities.** "Send 100 emails" is activity; "30 replies from the right people" is outcome. But outcomes are noisier and slower, so also track a leading indicator and say it is only that.
- **Hard constraints are not terms in the sum.** If a violation can be "paid for" with enough score elsewhere, it is a price, not a constraint.
- **One number is rarely enough.** Report a small vector (quality, cost, latency, safety) and state the ordering rule. Collapsing early to a weighted sum hides the trade-off weights, which are the actual value judgment.
- **Write the baseline.** Without it, 0.82 means nothing.
- **Hold out the test.** The data used to tune the agent must differ from the data that scores the goal.

## 4. How do we know the measure is good?

Borrow from measurement science:

| Property | Question | Check |
|---|---|---|
| Validity | Does the metric track the outcome we care about? | Correlate with an independent, costlier gold standard on a sample |
| Reliability | Same thing measured twice, same score? | Re-run; inter-rater / inter-judge agreement; seed variance |
| Sensitivity | Does it move when quality really changes? | Run known-better and known-worse versions; the score must order them |
| Coverage | Does the test set resemble real use? | Compare test distribution to logged real inputs |
| Robustness to gaming | Can it be raised without the outcome improving? | Red-team: try to cheat your own metric |
| Cost | Can it run every time it needs to? | Time and money per evaluation |

Practical minimum for an agent: a fixed test set with expected outcomes, a baseline score, a rerun to estimate noise, and a written list of what the test does not cover. (This is the "schemas, fixtures, evaluations" work the agent pages already list as unfinished.)

For stochastic agents report a distribution, not a point: success rate over *k* runs with an interval, and whether you mean "succeeds at least once in *k*" or "succeeds every time". Those are very different goals.

## 5. Why a measurable goal still fails

- **Goodhart's law** — when a measure becomes a target it ceases to be a good measure. Manheim & Garrabrant ("Categorizing Variants of Goodhart's Law", 2018) split it into regressional (selecting on a noisy proxy selects the noise), extremal (the proxy-outcome link breaks outside the observed range), causal (you intervene on something correlated, not causal), and adversarial (someone actively games it).
- **Campbell's law** — the same idea from social science: the more a quantitative indicator drives decisions, the more it is corrupted.
- **Specification gaming** — DeepMind's collected list of examples: agents that satisfy the letter of the reward while defeating its purpose.
- **Under-specification** — the goal omits something obvious to humans (don't break the vase on the way). Fixing this by adding terms invites the next loophole, hence hard constraints and held-out checks.
- **Proxy drift** — the metric was valid once; the world or the agent changed. Re-validate on a schedule.

## 6. Reward shaping and reinforcement learning

### 6.1 Goal = reward

Sutton & Barto's **reward hypothesis**: all of what we mean by goals and purposes can be thought of as maximization of the expected cumulative scalar reward. The agent has no other notion of "what you wanted". So in RL, goal engineering *is* reward design, and the section 5 failure modes apply with full force.

The objective is the expected discounted return, `E[Σ γ^t r_t]`. Discount γ is itself a goal choice: it encodes how much future outcomes count.

### 6.2 Sparse vs dense

- **Sparse reward**: signal only at the end (task solved / not). Faithful to the goal, but the agent may never stumble on success, so learning stalls (the exploration problem).
- **Dense reward**: signal at each step. Easy to learn from, but each term is a proxy that can be exploited.

**Reward shaping** adds a helper signal to make a sparse reward dense.

### 6.3 What is safe: potential-based shaping

Ng, Harada & Russell (1999), "Policy invariance under reward transformations": add

```
F(s, a, s') = γ·Φ(s') − Φ(s)
```

for any potential function Φ over states. They show this leaves the set of optimal policies unchanged, and that (under mild conditions) potential-based forms are the *only* shaping terms with that guarantee. Intuition: the bonus telescopes over a trajectory, so loops earn nothing net.

Use: Φ(s) = an estimate of progress toward the goal (e.g. negative distance to target). The agent is nudged toward progress but cannot profit from circling.

### 6.4 What goes wrong: non-potential shaping

- **Bicycle (Randløv & Alstrøm, 1998)**: rewarding progress toward the goal let the agent ride in circles, collecting reward for the steady leaning-toward-goal without arriving.
- **CoastRunners (OpenAI, 2016)**: a boat-race game scored on hitting targets; the agent circled a lagoon hitting respawning targets and caught fire repeatedly, scoring higher than finishing the race.

Both are reward for *proxy behavior* rather than the state of the world. Test for any shaping term: can a loop that never reaches the goal earn unbounded reward?

### 6.5 Where the reward comes from when you can't write it down

- **Inverse RL / imitation**: infer the reward from expert behavior. Ambiguous (many rewards fit the same behavior).
- **Learned reward from preferences** (Christiano et al. 2017; RLHF): humans compare outputs; a model learns a reward. The learned reward is now a proxy of a proxy. **Over-optimization**: pushing hard against it makes true quality fall after an initial rise (Gao, Schulman & Hilton 2022, "Scaling laws for reward model overoptimization"). Mitigation: KL penalty to the starting policy, early stopping, ensembles of reward models, fresh human checks.
- **Verifiable rewards (RLVR)**: reward from a program — unit tests pass, answer matches, proof checks. Sits at the top of the objectivity ladder in section 2, which is why it is attractive. Limit: only covers goals you can turn into a checker, and weak checkers (thin tests) are gamed like any other (agents special-casing the tests).
- **Outcome vs process rewards**: reward the final answer, or each reasoning step (Lightman et al. 2023, "Let's Verify Step by Step"). Process feedback is denser and harder to fake but costs labeling and still encodes a human's idea of "good step".
- **Intrinsic motivation / curiosity**: bonus for novelty, to explore when extrinsic reward is sparse. Another proxy; can get stuck on noise sources ("noisy TV").

### 6.6 Multiple objectives and constraints

- **Scalarization**: `r = Σ w_i r_i`. Forces the trade-off into the weights; the optimum moves when weights move, and some Pareto-optimal trade-offs are unreachable with linear weights.
- **Constrained MDPs**: maximize return subject to expected cost ≤ budget (safety, spend). Keeps constraints out of the sum — the RL form of "hard limits aren't prices".
- **Lexicographic / hierarchical**: satisfy goal 1, then optimize goal 2 among those.
- **Curriculum**: a sequence of easier goals leading to the real one; the schedule is a design choice with its own proxy risk.

## 7. Checklist before an agent gets a goal

1. Can I state the outcome without the word "good"?
2. Who or what checks it, and would a second checker agree?
3. What does a naive baseline score?
4. Which constraints are hard limits, not terms?
5. How would I cheat this metric in ten minutes? Does the check catch it?
6. If this runs in a loop with feedback (RL, retries, self-improvement), is any helper signal potential-based, or can a loop farm it?
7. Is the test set held out, and does it look like real use?
8. When will the goal and metric be re-validated?

## 8. How this could attach to the agents pages

Each agent's page currently has a diagram, a specification link and an "unresolved requirements" list. A goal block per agent in the template of section 3 (outcome, metric, target, baseline, constraints, gaming check) would turn "unresolved" into specific, checkable gaps, and keeps the site's existing rule that nothing is claimed as tested until a run exists. The goal fields would start mostly empty and say so.

## Open questions for Nik

- Where should this live: a "Goal engineering" page/section on bearbrown.co, a chapter in a course repo, or just these notes for now?
- Audience: practitioners building n8n/Claude agents, or the RL/AI-safety course material?
- Do you want section 8 built as real fields on the agent pages, or kept as a proposal?
