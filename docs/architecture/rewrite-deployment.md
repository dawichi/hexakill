# Angular Rewrite Deployment Contract

**Status:** Proposed static deployment contract; hosting provider acceptance is still pending.

## Current output

The Angular prototype is a browser-only application with no server routes, API, database, accounts, or secrets. A production build is generated from `rewrite/angular-prototype/` with Node.js `24.19.0` and npm `11.17.0`:

```sh
npm ci
npm run build
```

The publishable artifact is `dist/angular-prototype/browser/`. It includes the application bundle, hashed styles/scripts, and the copied legacy asset tree under `images/`, `music/`, and `sounds/`.

## Required hosting behavior

- Serve `index.html` at `/` over HTTPS.
- Serve the generated asset files without rewriting their paths.
- Return a meaningful 404 for unknown paths until URL routing is introduced.
- If Angular routes are added later, configure an explicit fallback to `index.html` and test direct navigation/refresh for every public route.
- Do not expose source maps or development server output in the production artifact unless intentionally approved.
- Preserve long-lived caching for hashed bundles while allowing HTML to revalidate.
- Configure security headers and remove the legacy external CDN dependency before release if it remains in the promoted application.

## Provider status

The legacy README links to Vercel, but repository evidence does not prove ownership, project configuration, current availability, or deployment history. Vercel is therefore a candidate rather than an accepted target. The first production-like deployment must record the provider/project, build command, output directory, preview URL, rollback procedure, 404 behavior, headers, and asset verification.

## Release gate

The rewrite is not ready for top-level promotion until the static artifact is built from a clean install, browser journeys pass against the production-like output, representative assets load, and an owner-approved deployment target is recorded in an ADR.
