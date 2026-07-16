# Contributing

Thanks for contributing to IssueSnap. The project prioritizes small, reviewable changes, accessible interaction, and a local-first privacy model that is easy to understand and verify.

## Prerequisites

- Node.js `^20.19.0 || >=22.12.0`
- npm 10 or newer
- Chrome or a compatible Chromium browser for manual extension checks

## Local workflow

```bash
npm ci
npm run validate
```

`validate` runs strict TypeScript checks, Vitest tests, and a production extension build. To inspect the extension manually, load the generated `dist` directory through `chrome://extensions` with Developer mode enabled.

## Before changing behavior

1. Search existing issues and pull requests to avoid duplicate work.
2. For a substantial change, open an issue first and describe the reporter problem it solves.
3. Keep the change focused. Do not combine unrelated refactors, visual changes, and behavior changes in one pull request.
4. Treat privacy, accessibility, and the generated Markdown structure as user-facing behavior.

## Privacy-sensitive changes

Changes to browser capture, storage, clipboard use, URL handling, or the GitHub handoff need particular care:

1. Preserve origin-only URL capture unless a privacy-impacting change has been explicitly discussed.
2. Keep page-title inclusion opt-in and disabled by default.
3. Add or update focused tests for URL sanitization and Markdown generation.
4. Update [the privacy model](docs/privacy-model.md), README scope, and [SECURITY.md](SECURITY.md) when the data boundary changes.
5. Never add credentials, private URLs, personal data, real customer data, or sensitive screenshots to tests, issues, or pull requests.

## Pull requests

Use a clear, imperative commit message such as `feat: add a confirmed screenshot workflow` or `fix: retain draft after popup closes`. Explain the user impact, include relevant validation results, and call out any privacy or accessibility implications.

Keep keyboard navigation and visible focus states usable. If a change affects the generated issue body, describe the before-and-after output in the pull request.
