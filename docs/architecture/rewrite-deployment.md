# Angular Rewrite Deployment Contract

**Status:** Static deployment contract for the Angular application.

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
- Send a self-contained Content Security Policy; the current app has no external script, font, image, media, or connection requirement.
- Configure security headers before release and keep the production artifact self-contained.

## Provider status

Production hosting is managed outside this repository. Keep the provider, project ownership,
preview URL, rollback procedure, 404 behavior, headers, and asset verification recorded with the
release process.

## Local contract verification

`npm run verify:deployment` validates the committed `vercel.json` framework, install command, build command, output directory, and required security headers. When passed an artifact path, it also verifies that the publishable directory contains `index.html`. This is repository evidence only; it does not prove provider ownership or authorize a deployment.

## Release gate

The application has local gates for clean-install/build, preview HTTP behavior (security headers,
asset caching, 404, HEAD, unsupported methods, path traversal, and malformed URL encoding), browser
journeys against the production-like output, and representative assets. Release still requires
owner-approved deployment target/ownership, rollback, and external verification in an ADR.
