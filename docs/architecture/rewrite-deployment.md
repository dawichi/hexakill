# Angular Rewrite Deployment Contract

**Status:** Proposed static deployment contract; Vercel endpoint observed, Angular deployment still pending.

## Current output

The active Angular application is a browser-only application with no server routes, API, database, accounts, or secrets. A production build is generated from the repository root with Node.js `24.19.0` and npm `11.17.0`:

```sh
npm ci
npm run build
npm run verify:deployment
npm run verify:preview
# Optional local production-artifact verification
npm run test:e2e:production
```

The publishable artifact is `dist/hexakill/browser/`. It includes the application bundle, hashed styles/scripts, and the retained asset tree under `images/`, `music/`, and `sounds/`.

## Required hosting behavior

- Serve `index.html` at `/` over HTTPS.
- Serve the generated asset files without rewriting their paths.
- Return a meaningful 404 for unknown paths until URL routing is introduced.
- If Angular routes are added later, configure an explicit fallback to `index.html` and test direct navigation/refresh for every public route.
- Do not expose source maps or development server output in the production artifact unless intentionally approved.
- Preserve long-lived caching for hashed bundles while allowing HTML to revalidate.
- Configure security headers and remove the legacy external CDN dependency before release if it remains in the promoted application.

## Provider status

`https://hexakill.vercel.app` was observed returning HTTP `200` from Vercel on 2026-08-16, with `x-sveltekit-page: true` and the legacy `TS + Svelte game` description; it still serves the archived SvelteKit application. Repository evidence does not prove project ownership or deployment authorization. `vercel.json` records the candidate Angular install/build/output contract, but it is not evidence of a completed deployment. The first Angular deployment must record the provider/project, preview URL, rollback procedure, 404 behavior, headers, and asset verification.

## Local contract verification

`npm run verify:deployment` validates the committed `vercel.json` framework, install command, build command, output directory, and required security headers. When passed an artifact path, it also verifies that the publishable directory contains `index.html`. This is repository evidence only; it does not prove provider ownership or authorize a deployment.

## Release gate

The root Angular migration now has local gates for clean-install/build, preview HTTP behavior (security headers, asset caching, and 404), browser journeys against the production-like output, and representative assets. Release still requires owner-approved deployment target/ownership, rollback, and external verification in an ADR.
