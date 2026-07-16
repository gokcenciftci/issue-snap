# Architecture

IssueSnap has a deliberately small browser-extension pipeline. Each stage has one responsibility so that the information which can leave the browser is easy to trace.

```text
App.tsx
  -> lib/browser.ts
      -> Chrome active tab + scripting APIs
  -> lib/issue.ts
      -> origin-only URL sanitization
      -> Markdown and GitHub new-issue URL generation
  -> lib/storage.ts
      -> chrome.storage.local
```

## Boundaries

| Layer | Responsibility |
| ----- | -------------- |
| Popup UI | Collects reporter-entered fields, displays the context snapshot and Markdown preview, and requires the reporter to initiate each handoff. |
| Browser capture | Reads the active tab’s title, viewport, language, URL, and browser label when Chrome permits it. It does not read page content or form fields. |
| URL sanitization | Accepts only `http:` and `https:` URLs, then retains their origin. Paths, query strings, and fragments are discarded before a draft is built. |
| Draft generator | Produces a predictable GitHub-flavored Markdown body and validates the optional `owner/repository` target. |
| Local storage | Persists the draft and target with `chrome.storage.local` so the popup can be closed without losing work. |
| Handoff | Copies the visible draft to the clipboard or opens GitHub’s new-issue page only after an explicit reporter action. |

## Data flow

```text
active browser tab
  -> limited context capture
  -> sanitize URL to origin
  -> combine with reporter-entered issue fields
  -> render Markdown preview and save locally
  -> reporter chooses: copy to clipboard | open GitHub issue
```

The GitHub route is a navigation to GitHub’s issue-creation page with prefilled query parameters. It is not a GitHub API integration and does not submit an issue. The reporter can still edit or abandon the draft on GitHub.

## Extending the extension

New context fields should be treated as privacy-sensitive. Before adding one, define whether it is automatic or opt-in, ensure it is visible in the preview, update tests for the generated Markdown, and document the data-flow change in [the privacy model](privacy-model.md) and README.
