# Security policy

## Supported versions

| Version          | Supported |
| ---------------- | --------- |
| `0.1.x`          | Yes       |
| Earlier versions | No        |

## Reporting a vulnerability

Please do not open a public issue for a suspected vulnerability. Private vulnerability reporting is enabled for this repository; submit a report through [GitHub Security Advisories](https://github.com/gokcenciftci/issue-snap/security/advisories/new). If that path is temporarily unavailable, contact the repository owner through [their GitHub profile](https://github.com/gokcenciftci) without publishing exploit details.

Include the affected extension version, a minimal reproduction, impact, and any mitigation you have identified. You should receive an acknowledgement within seven days.

## Data-handling boundaries

IssueSnap runs in the browser and processes active-tab context. v0.1 reduces supported page URLs to their HTTP(S) origin and does not automatically collect page paths, query strings, fragments, content, form values, cookies, screenshots, console logs, or browsing history. The current page title is read for the visible context preview but is included in the Markdown draft only after the reporter opts in.

Drafts and the selected repository target are stored in Chrome local extension storage. Clipboard writes and navigation to GitHub happen only after an explicit user action. Opening GitHub sends the prefilled title, labels, and editable draft to GitHub; reporters should review the draft before choosing that action.

These boundaries reduce accidental disclosure; they do not prevent a reporter from typing sensitive data into the draft or copying it to another application. See [the privacy model](docs/privacy-model.md) for the complete data-flow description.
