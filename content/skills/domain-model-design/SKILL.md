---
name: domain-model-design
description: Design the entities, relationships and rules of a system so the model itself forbids invalid states - name things in the domain's own words, state each entity's invariant, decide what owns what, separate entities from value objects, draw aggregate boundaries around what must change together, and make forbidden states unrepresentable or flag them as runtime-guarded. Use before writing a schema, migrations, ORM models or core types, and when the user says "design the schema", "model this domain", "what entities do we need", "entity or value object", "where does the aggregate boundary go" or "make illegal states unrepresentable". Not for choosing a database engine or deployment architecture, not for naming terms and writing a glossary (see domain-modeling), and not for thin CRUD with only field-level validation.
license: MIT
---

# Domain model design

A model that permits a state the business forbids is a bug you will keep patching in application code. The model's job is to make illegal states impossible, not merely unlikely. Name the rules before you name the columns or classes.

This skill produces a model: entities, relationships, invariants, ownership and forbidden states. It does not produce migrations and it does not touch an existing database.

## First, is a rich model warranted?

Apply this skill's full vocabulary only if at least one of these is true:

- Business rules span several fields or objects and must hold together (an order's total equals the sum of its lines).
- Some objects must change together to keep a rule true (an aggregate candidate).
- The same word means different things to different teams or features.
- A multi-step process moves things through states.

If none is true, the domain is thin. Say so, keep plain records with field-level validation, and stop. Tactical patterns are overhead where there are no invariants to protect.

## The steps

Work through these in order. Do not present a model until each step has an answer.

### 1. Name things in the domain's own words

List the core entities using the words a domain expert would use. If you are inventing names nobody in the business would recognize, you are modeling your first guess at the solution, not the domain. Go back to the domain's vocabulary. (If the vocabulary itself is disputed, settle it first; see domain-modeling.)

### 2. State each entity's invariant

For every entity, write at least one rule that must always be true, as a sentence you could turn into a test: "an order's total equals the sum of its line items", "a copy on loan has exactly one borrower". An entity with no invariant is a bag of fields. Question whether it is really an entity or just attributes of another one.

### 3. Entity or value object

| Question | Entity | Value object |
|---|---|---|
| Has identity that persists as its data changes? | Yes | No |
| Compared by | its identity | all of its values |
| Mutable? | Yes, through rules it enforces | No; replace it, do not edit it |
| Validates itself? | On every state change | On construction |

Money, an address, a date range and a discount rate are usually values. A customer, a loan and an order are usually entities. When several value variants share one idea (different kinds of discount), give them the same interface, so callers never branch on the variant's type and a new variant needs no caller changes.

### 4. Ownership and cardinality

For every relationship, say which side **owns the lifecycle** (creates and deletes the other) and which only references it, and state the cardinality (1:1, 1:N, N:M). A foreign key says "references", not "owns". Unowned or doubly-owned relationships are where orphan rows and surprise cascade deletes come from.

### 5. Aggregate boundaries

An aggregate is a group of objects that must be consistent together, entered through one root. Let boundaries emerge from use cases rather than designing them in advance:

1. Start from an operation a user needs to perform.
2. Find the rule that must hold for it to succeed.
3. Find the smallest set of objects needed to enforce that rule.
4. Choose the root: the one entry point for every change.
5. Reference other aggregates by identifier only, never by direct object reference.

If two objects must change together to keep a rule true, they belong in one aggregate. If they can change independently, keep them separate and link them by id.

| Sign | Aggregate too large | Aggregate too small |
|---|---|---|
| Load and contention | Loading is slow, locks collide | Rules break because the data is split |
| Transactions | Long ones | Need coordination across parts |
| Change | Unrelated changes conflict | Related changes need choreography |

### 6. Copy or reference

When one aggregate uses data owned by another, decide whether it needs the **current** value or the value **at the time of the action**. Reference by id for current data (the order's customer). Copy as a value object for historical truth (the shipping address and unit price at the time of purchase), and never update that copy when the source changes. Use copies for anything that would corrupt a past record if it changed retroactively: prices, addresses, terms.

### 7. Forbidden states

List the states the domain forbids: "a copy lent to two members at once", "a hold on a copy that is available". For each, check the model: does it still allow that state? If yes, change the model so the state cannot be expressed: a required field, a unique constraint, a variant type, a moved relationship. If it truly cannot be prevented structurally, mark it **runtime-guarded**, name where the guard lives, and say why. Choose this deliberately for each state. "We can validate that in the app layer" is not a default.

### 8. Lifecycle and events

For anything with states, write the allowed transitions (state, event, next state). When other parts of the system must react to a change, name the event in the past tense (`OrderPlaced`), make it immutable, and include everything a listener needs and the time it happened.

### 9. Context boundaries

The same real-world thing can legitimately be different models in different places: a customer in sales has preferences, a recipient in shipping has an address, a payer in billing has a payment method. Do not force one model to serve all of them. Translate at the edge where one context calls another, so a third-party or neighboring model does not leak into yours.

## Report

Present the model as a short list, not a table dump:

```
Model: <system>
Entities: <entity: its invariants, one line each>
Value objects: <name: what it holds and validates>
Relationships: <A to B, cardinality, which side owns the lifecycle>
Aggregates: <root: what it keeps consistent; what it references by id>
Forbidden states: <state: how the model prevents it, or "runtime-guarded: where, why">
Open questions: <anything unresolved that changes the shape>
```

Say which rules rest only on runtime guards. If core invariants are unclear or ownership is contested, say the model is not ready to build on and resolve that first.

## Worked example: library lending

| Step | Result |
|---|---|
| Entities | Member, Title, Copy, Loan, Hold (a librarian would use these words) |
| Invariants | A copy has at most one active loan. A hold exists only for a title with no available copy. |
| Ownership | A Title owns its Copies. A Loan references one Member and one Copy and is owned by neither; it is created by the lending operation. |
| Forbidden: copy lent twice | Prevent structurally: a uniqueness rule over active loans per copy. |
| Forbidden: hold on an available copy | Cannot be fully expressed in the structure. Runtime-guarded in the operation that places a hold; reason stated. |
| Copy or reference | The loan stores the due date at checkout (a copy); it references the member by id. |

## Red flags

| Thought | Why it is wrong |
|---|---|
| "I'll just add the obvious fields" | Fields without rules encode nothing; invalid states leak into every query. State the rule first. |
| "Ownership is obvious from the foreign key" | A foreign key shows reference, not who deletes whom. |
| "It's a simple domain" | Simple domains still forbid states. Name three and check them. |
| "The app layer will catch it" | Sometimes true. Decide it per state, on purpose. |

## Changing an existing model

When the model already exists and holds data, tightening a rule (a new unique constraint, a required field, a removed state) can fail or lose data. Check whether existing rows already violate the new rule before proposing the change, and propose the change as a plan for the user. Run migrations or alter stored data only when the user asks. If you are splitting one large model into contexts, go in small steps: put context-specific interfaces in front of the old model first, extract the simplest context first, and keep each step independently testable and releasable. If a step needs a big-bang cutover, the boundary is probably in the wrong place.
