# Hexakill Angular Rewrite Prototype

This is the isolated Angular prototype for the Hexakill rewrite. It deliberately lives beside, rather than inside, the legacy SvelteKit application.

The current prototype contains:

- an accessible welcome screen;
- typed character selection for Wizard, Samurai, and Warrior;
- an in-memory session service using Angular signals;
- a complete typed legacy enemy roster with deterministic level/gold generation and sequential Gold Slime bosses;
- a combat rules module independent from Angular components;
- an explicit pure combat state machine and injectable clock boundary;
- Attack, Magic, and Potion combat actions; and
- enemy turns, defeat handling, provisional victory rewards, power-ups, and an in-memory store; and
- deterministic Vitest coverage for enemy generation, damage, resistance, critical hits, misses, health caps, combat transitions, progression, and purchases.

Persistence and sound playback now exist behind provisional injectable boundaries; music controls and production deployment remain unresolved. Enemy stat scaling, rewards, power-up limits, store effects, persistence schema, and audio lifecycle are characterization decisions, not final product behavior. See the parent project's [development handoff](../../docs/handoff.md) for the exact continuation boundary.

## Development server

Run `npm start` for a development server. Navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify the source files.

## Building

Run `npm run build` to build the application. Output is written to `dist/angular-prototype/`.

## Running unit tests

Run `npm test -- --watch=false --no-progress` to execute the unit tests with Vitest.

## Related project documentation

Read the parent project [rewrite decision](../../docs/adr/0001-angular-rewrite.md), [target architecture](../../docs/architecture/rewrite-target.md), and [prioritized TODOs](../../docs/TODO.md) before extending the prototype.

## Further help

For Angular CLI command references, see the [Angular CLI documentation](https://angular.dev/tools/cli).
