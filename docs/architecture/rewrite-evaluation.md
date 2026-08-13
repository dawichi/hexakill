# Rewrite Framework Evaluation

**Status:** Framework decision accepted in [ADR-0001](../adr/0001-angular-rewrite.md); deployment decision remains open.

## Decision context

The user-provided direction is to prepare documentation for a future rewrite rather than continue patching the old application. The rewrite is justified by the accumulated age of the code, incomplete store behavior, untested rules, unresolved dependency/tooling state, and weak boundaries between UI, state, and domain logic.

The core workload is not a content website. It is a continuously interactive, single-player game loop with random outcomes, timers, keyboard input, audio, mutable session state, local persistence, and a future need for deterministic rules tests. Framework choice should therefore follow the state and testing model, not the desire to replace an old framework by itself.

## Options

| Option           | Fit for the game core              | Strengths                                                                                                                                                                                                    | Costs and risks                                                                                                                                                                                                       | Recommendation                                                                     |
| ---------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Modern SvelteKit | High                               | Lowest conceptual migration from the existing UI; Svelte is already understood by the codebase; can retain a thin UI around a new pure rules engine; supports static deployment when configured deliberately | Requires a controlled upgrade/rebuild and disciplined state boundaries; does not fix domain coupling automatically                                                                                                    | Rejected for the rewrite by project-owner decision; remains historical reference   |
| Angular          | High                               | Full application framework with first-party routing, forms, dependency injection, signals, and strong conventions for feature boundaries; aligns with the shared Angular application profile                 | Highest migration and team learning cost; more framework surface than this small game needs; still requires a new rules engine and accessibility/test discipline                                                      | Accepted in ADR-0001; prototype first                                              |
| Astro            | Low as the core; medium as a shell | Excellent static-first output, content/landing pages, selective hydration, and the ability to host a client island                                                                                           | The game would be one large client island; Astro would not remove the need for a client application runtime and could add a boundary between shell and game; Astro website profile is not a fit for the core workflow | Do not use as the primary game framework; consider only for a marketing/docs shell |

Astro's official documentation describes components as static HTML by default and client-side JavaScript as explicit islands. That is valuable for a mostly static site, but Hexakill's main screen is itself the interactive application. Angular's official documentation describes it as a framework for applications with routing, forms, dependency injection, signals, and SSR/SSG options, which matches the application profile more closely. Neither choice substitutes for extracting and testing the game domain.

## Recommendation

Do not reconvert Hexakill to Astro as the primary application. Angular is now the accepted rewrite framework through ADR-0001. Continue extracting a framework-neutral rules engine and characterization test suite, then build the rewrite through small vertical slices. If Astro is selected at all, constrain it to a static shell with the game as an explicitly justified client island.

The framework decision is accepted. The critical unresolved constraints are expected future product scope, whether accounts/backend services are planned, target hosting, and whether a public marketing/content surface is part of the product.

## Evaluation gates before deciding

1. Characterize combat, enemy generation, progression, store, persistence, and reset behavior with deterministic tests.
2. Write the product contract for the store and run persistence before migrating UI code.
3. Prototype the same combat vertical slice in the leading candidate and current SvelteKit baseline.
4. Compare bundle/runtime behavior, keyboard accessibility, audio lifecycle, test ergonomics, and deployment reproducibility.
5. Record the deployment output and hosting choice in a separate ADR.

## References

-   [Astro islands architecture](https://docs.astro.build/en/concepts/islands/)
-   [Astro rendering modes](https://docs.astro.build/en/basics/rendering-modes/)
-   [Angular overview](https://angular.dev/overview)
-   [Angular signals](https://angular.dev/guide/signals)
-   [Angular routing](https://angular.dev/guide/routing)
-   [Angular forms](https://angular.dev/guide/forms)
