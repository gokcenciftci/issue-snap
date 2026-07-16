# IssueSnap

[![CI](https://github.com/gokcenciftci/issue-snap/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/gokcenciftci/issue-snap/actions/workflows/ci.yml)
[![CodeQL](https://github.com/gokcenciftci/issue-snap/actions/workflows/codeql.yml/badge.svg?branch=main)](https://github.com/gokcenciftci/issue-snap/actions/workflows/codeql.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

IssueSnap turns the current browser page into an editable GitHub issue draft. It captures a deliberately small set of useful environment details, keeps the draft in the browser, and opens GitHub only when the reporter explicitly chooses to do so.

> v0.1 is intentionally narrow. It favors reviewable, privacy-preserving bug reports over collecting every available browser detail.

## Why IssueSnap?

An issue that only says “it does not work” is expensive to investigate. A useful report usually needs reproduction steps, expected and actual behavior, and a little environment context—but collecting that context should not mean sending a browsing session to a third party.

IssueSnap gives reporters an editable GitHub-flavored Markdown draft with the information needed to make a bug actionable. There is no backend, analytics service, or automatic submission step.

## Installation

### Method 1: Using the Pre-built Package (Recommended)

1. Download the pre-built extension package (`issue-snap.zip`) from the latest [GitHub Release](https://github.com/gokcenciftci/issue-snap/releases).
2. Extract the downloaded `.zip` archive to a local folder.
3. Open Google Chrome and navigate to `chrome://extensions/`.
4. Enable **Developer mode** in the top-right corner.
5. Click the **Load unpacked** button in the top-left corner.
6. Select the folder where you extracted the zip files.

### Method 2: Building from Source

If you prefer to audit or build the extension from source:

1. Clone the repository:
   ```bash
   git clone https://github.com/gokcenciftci/issue-snap.git
   cd issue-snap
   ```
2. Install dependencies and build:
   ```bash
   npm ci
   npm run build
   ```
3. Open `chrome://extensions/` in Chrome, enable **Developer mode**, click **Load unpacked**, and select the generated `dist/` directory.

For development with live reloading:

```bash
npm run dev
```

## What can enter an issue draft

| Included automatically | Included only when opted in | Never captured automatically |
| ---------------------- | --------------------------- | ---------------------------- |
| HTTP(S) site origin, viewport, language, browser label, and capture time | Current page title | Page path, query string, fragment, page content, form values, cookies, browsing history, screenshots, console logs, and network traffic |

The current page title is read to render the context preview but is not written to the draft unless the reporter enables the opt-in control. The reporter also supplies the summary, reproduction steps, expected and actual behavior, severity, labels, and optional GitHub `owner/repository` target.

## How the GitHub handoff works

1. IssueSnap generates a Markdown draft locally and shows it for review.
2. The reporter can copy it to the clipboard or explicitly choose **Open GitHub issue**.
3. The latter opens GitHub’s new-issue page with the title, labels, and editable body prefilled. IssueSnap never submits the issue.

See [the privacy model](docs/privacy-model.md) for the storage, clipboard, and GitHub-handoff boundaries.

## Supported environment and limits

- Designed for Chrome Manifest V3; it may work in other Chromium browsers that support the same APIs.
- Only `http:` and `https:` page URLs are reduced to their origin. Browser-owned pages and unsupported URLs are reported as unavailable.
- The extension can read active-tab context only after the user invokes it. A browser may still prevent inspection of protected pages.
- The GitHub target must use the `owner/repository` format. Repository permissions, issue templates, labels, and submission remain under GitHub’s control.

## Architecture

```text
Extension popup
  -> active-tab context capture
  -> origin-only URL sanitization
  -> local Markdown draft generation
  -> Chrome local storage
  -> user-selected clipboard copy or GitHub new-issue navigation
```

The [architecture notes](docs/architecture.md) describe the boundaries between capture, draft generation, persistence, and the user-controlled handoff.

## Development

Requires Node.js `^20.19.0 || >=22.12.0`.

```bash
npm ci
npm run validate
```

`validate` runs strict TypeScript checks, Vitest tests, and a production extension build. See [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), and [the Code of Conduct](CODE_OF_CONDUCT.md) for project practices.

## License

[MIT](LICENSE) © 2026 Gökçen Çiftci
