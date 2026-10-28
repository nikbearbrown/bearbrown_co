---
name: codebase-design
description: Design deep modules - a lot of behaviour behind a small interface, placed at a clean seam and tested through that interface. Gives a precise shared vocabulary (module, interface, depth, seam, adapter, leverage, locality), the deletion test, rules for when a seam is real, testability patterns, how to deepen a cluster of shallow modules given what it depends on, and how to compare several different interfaces before choosing. Use when designing or reshaping a module's interface, deciding where a seam or boundary goes, making code easier to test or navigate, or when the user says "deep module", "shallow wrapper", "pass-through layer", "where should this boundary go" or "design it twice". Not for hunting refactor targets across a whole codebase (see improve-codebase-architecture), reviewing a diff, or choosing infrastructure.
license: MIT
---

# Codebase design: deep modules

Design **deep modules**: a lot of behaviour behind a small interface, placed at a clean seam, testable through that interface. The payoff is **leverage** for callers, **locality** for maintainers, and testability for everyone.

This skill is advice and design work. It does not change code unless the user asks for the change. Looking at a codebase is not permission to restructure it.

## Vocabulary

Use these words precisely. Consistent language is the point, so do not drift into "component", "service", "API" or "boundary" when the question is about these things. Keep the project's own names for its domain concepts; this vocabulary describes the shape of the code, not what the code is about.

| Term | Meaning | Avoid |
|---|---|---|
| **Module** | Anything with an interface and an implementation, at any scale: a function, class, package, or a slice across tiers | unit, component, service |
| **Interface** | Everything a caller must know to use the module correctly: the type signature, plus invariants, ordering rules, error modes, required configuration and performance behavior | API, signature (both name only the type-level surface) |
| **Implementation** | What is inside the module | |
| **Depth** | Leverage at the interface: how much behaviour a caller (or a test) can exercise per unit of interface they must learn. Deep: much behind a small interface. Shallow: the interface is nearly as complex as the implementation | |
| **Seam** | A place where behaviour can change without editing that place; where a module's interface lives. Where to put it is a design decision separate from what goes behind it | boundary (collides with the domain-driven-design "bounded context") |
| **Adapter** | A concrete thing that satisfies an interface at a seam. It names a role, not a size: a thin adapter can wrap a large implementation, and a large adapter can sit on a small one | |
| **Leverage** | What callers get from depth: one implementation pays back across many call sites and tests | |
| **Locality** | What maintainers get from depth: change, bugs, knowledge and verification concentrate in one place instead of spreading across callers | |

The deep-module idea is John Ousterhout's and the seam is Michael Feathers's. Depth is measured here as leverage, not as a ratio of implementation lines to interface lines, because a line ratio rewards padding the implementation.

## Principles

- **Depth belongs to the interface, not the implementation.** A deep module may be built from small, swappable parts inside. They are not part of its interface. A module can have internal seams, private to the implementation and used by its own tests, as well as the external seam callers use.
- **The deletion test.** Imagine deleting the module. If the complexity vanishes, it was a pass-through. If the complexity reappears across many callers, it was earning its keep.
- **The interface is the test surface.** Callers and tests cross the same seam. If you want to test past the interface, the module is probably the wrong shape.
- **One adapter means a hypothetical seam; two mean a real one.** Add a seam only when something actually varies across it. Typically that is the production implementation and a stand-in for tests. A single implementation can still justify a seam when it fronts an unavailable, slow or costly external dependency, but justify it from observed need, not from habit. Do not invent interchangeable adapters, or widen a production interface, only to satisfy an internal mock.

## Designing for testability

Pseudocode, adapt to the project's language.

1. **Accept dependencies; do not construct them.**
   ```
   process_order(order, payment_gateway)      # testable: the dependency is passed in
   process_order(order): g = new Gateway()    # hard to test: it builds its own
   ```
2. **Return results rather than producing side effects** where the caller can apply them.
   ```
   calculate_discount(cart) -> Discount       # testable: returns a value
   apply_discount(cart): cart.total -= d      # hard to test: mutates in place
   ```
3. **Keep the surface small.** Fewer entry points mean fewer tests; fewer parameters mean simpler setup.

## Design checks

For any interface you are designing or reshaping:

1. Write down the caller-visible behavior and the constraints it must meet.
2. Find the current seam and list what leaks across it: ordering rules, error handling, configuration, policy each caller repeats.
3. Apply the deletion test to the module and to any wrapper around it.
4. Reduce what callers must carry: fewer methods, simpler parameters, less ordering knowledge, less configuration.
5. Hide policy and orchestration behind the interface while keeping behavior observable. A small interface should hide real complexity, not hide guarantees callers need.
6. Check that tests and callers cross the same seam.
7. Add an adapter only where something truly varies.
8. When the decision is consequential, compare at least two materially different interfaces (below).
9. Test through the interface where behavior is observable, and prefer the smallest cohesive design that meets current requirements. Preserve earlier decisions unless there is evidence to reopen them.

## Deepening a cluster of shallow modules

When several small modules are really one concept, merge them behind one interface. What you do at the seam depends on what the cluster depends on:

| Dependency | Treatment |
|---|---|
| **In-process** (pure logic, in-memory state) | Merge into the deep module. No seam needed; test through its interface directly. |
| **Local stand-in available** (a database or filesystem that can be run locally or in memory) | Test with the stand-in. Keep it as an internal seam if the module needs one. |
| **Remote but owned** (another service your team controls) | Define the interface at the seam, with a production adapter and an in-memory adapter. This is the two-adapter, real seam. |
| **True external** (a third-party service) | Hide it behind an adapter; fake it in tests at that seam. |

Replace, do not layer, the tests. When shallow modules merge, their old per-module tests mostly describe the removed internals. Cover the same behavior through the new interface, confirm it passes, and then propose removing the redundant old tests, naming each. Remove them only with the user's agreement; tests are the user's work.

## Design it twice

The first interface that comes to mind is rarely the best one. For a consequential interface, produce at least two designs that are radically different, each under a different constraint: for instance, the fewest possible entry points; the most flexibility for varied callers; optimized for the single most common caller; or a ports-and-adapters shape around the dependencies. Make each design independent, with its own sketch of a caller using it. If you can delegate to parallel workers, give each one constraint, and keep them from seeing each other's output. Otherwise write the designs one after another without building on the earlier ones.

Then compare them on depth, locality and seam placement, and on what each does to the tests. Recommend one, or a deliberate hybrid, and say what you would give up.

## Output

```
Module:
Current interface and seam:
Leaked complexity:
Proposed interface:
Hidden implementation:
Adapters:
Depth / leverage / locality:
Test surface:
Compatibility and migration:
Open decisions for the user:
```

Leave decisions that change scope, public contracts or persistence to the user. If a design choice is hard to reverse, surprising and a real trade-off, suggest recording it as a decision record, and write it only if the user agrees.
