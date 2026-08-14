# Architecture Decision Records

ADRs record durable, accepted project decisions. Accepted ADRs are not silently rewritten; a later decision supersedes the earlier record. Recommendations and unresolved framework comparisons belong in `docs/architecture/` until accepted.

## Records

- [ADR-0001: Use Angular for the Hexakill rewrite](0001-angular-rewrite.md) — accepted framework direction for the active root Angular application.

## Candidates for the next ADRs

- Rendering/deployment mode after the framework decision in [rewrite-evaluation.md](../architecture/rewrite-evaluation.md).
- Static deployment contract and hosting provider; the current proposal is [rewrite-deployment.md](../architecture/rewrite-deployment.md).
- Rewrite boundary and domain-state-machine contract after characterization tests.
- Store and progression contract, including item effects and restocking.
- Local persistence schema/versioning and whether records remain browser-local.
