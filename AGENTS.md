# Development notes

- Use Bun: `bun install`, `bun run`, and `bunx`. Do not use npm or Yarn.
- Keep `src/app/domain/` framework-independent; browser, audio, storage, clock, and UI code belongs outside it.
- Treat localStorage as untrusted input. Validate and version saved data at the storage boundary.
- Keep gameplay rules in the domain and add focused regression coverage when changing them.
- After implementation changes, run the global gate:

  ```sh
  bun run check
  bun run verify:types
  bun run test -- --watch=false --no-progress
  bun run test:e2e
  bun run build
  bun run verify:assets
  ```

- Keep the root README and `docs/ARCHITECTURE.md` aligned with player-visible and architectural changes.
- Do not replace bundled art or audio while source and license details remain unknown.
- Do not push changes unless the project owner explicitly requests it.
