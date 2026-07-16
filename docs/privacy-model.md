# Privacy model

IssueSnap is designed to make a useful bug report without collecting a browsing session. Its default behavior is local-first: the extension builds and stores the draft in the browser, and it does not contact a service on its own.

## Data collected for a draft

| Data | Treatment |
| ---- | --------- |
| Site URL | Only an `http:` or `https:` origin is kept. The path, query string, and fragment are removed. |
| Page title | Read to render the visible context preview; included in the Markdown draft only when the reporter enables the opt-in control. |
| Viewport, language, browser label, capture time | Included automatically as environment context when available. |
| Summary, steps, behavior, severity, labels, target repository | Entered or selected by the reporter. |

## Data not collected automatically

IssueSnap does not automatically collect page content, form inputs, cookies, browser history, credentials, screenshots, console logs, network requests, page paths, query values, or URL fragments. It has no analytics or backend service.

## Storage and handoff

The current draft and optional GitHub `owner/repository` target are saved with `chrome.storage.local`. They remain in the browser profile until the reporter clears the draft, changes the stored values, removes the extension, or clears the extension’s storage.

Copying the draft places the visible Markdown on the system clipboard. Choosing **Open GitHub issue** opens GitHub’s new-issue page with the title, labels, and body prefilled. That navigation transfers the selected draft data to GitHub, but it happens only after a reporter action and GitHub still presents an editable form.

## Limits and reporter responsibility

Privacy controls reduce automatic collection; they cannot prevent a reporter from entering sensitive information manually. Review the Markdown preview, page title setting, labels, and selected repository before copying or opening GitHub. Do not include secrets, private URLs, personal data, customer information, or exploit details in a public issue.

For suspected vulnerabilities, use the private process in [SECURITY.md](../SECURITY.md) instead of an issue.
