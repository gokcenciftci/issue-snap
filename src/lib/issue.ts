import type { IssueDraft, PageContext } from "../types";

export const DEFAULT_DRAFT: IssueDraft = {
  title: "",
  steps: "",
  expected: "",
  actual: "",
  severity: "Medium",
  labels: "bug",
  includePageTitle: false
};

export const EMPTY_CONTEXT: PageContext = {
  title: "Not captured yet",
  url: "Not available",
  viewport: "Not available",
  language: "Not available",
  browser: "Not available",
  capturedAt: "Not captured yet"
};

export function sanitizeUrl(value: string | undefined): string {
  if (!value) return "Not available";

  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return "Not available";
    }

    // Routes can contain customer IDs, magic links, emails, and other values that
    // cannot be reliably identified. Keep only the origin by default.
    return url.origin;
  } catch {
    return "Not available";
  }
}

export function isValidRepository(repository: string): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9.-]{0,38}\/[A-Za-z0-9_.-]+$/.test(repository.trim());
}

function filled(value: string, fallback = "Not provided"): string {
  return value.trim() || fallback;
}

function asBulletList(value: string): string {
  const lines = value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.length ? lines.map((line) => `1. ${line}`).join("\n") : "1. Not provided";
}

export function buildIssueMarkdown(draft: IssueDraft, context: PageContext): string {
  return `## Summary
${filled(draft.title)}

## Steps to reproduce
${asBulletList(draft.steps)}

## Expected behavior
${filled(draft.expected)}

## Actual behavior
${filled(draft.actual)}

## Severity
${draft.severity}

## Environment
- **Page:** ${draft.includePageTitle ? filled(context.title) : "Not included"}
- **URL:** ${filled(context.url)}
- **Viewport:** ${filled(context.viewport)}
- **Language:** ${filled(context.language)}
- **Browser:** ${filled(context.browser)}
- **Captured:** ${filled(context.capturedAt)}

---
_Generated locally with IssueSnap. Review this draft before submitting._`;
}

export function buildGitHubIssueUrl(repository: string, draft: IssueDraft, context: PageContext): string | null {
  if (!isValidRepository(repository)) return null;

  const url = new URL(`https://github.com/${repository.trim()}/issues/new`);
  url.searchParams.set("title", draft.title.trim() || "Bug report");
  url.searchParams.set("body", buildIssueMarkdown(draft, context));

  if (draft.labels.trim()) {
    url.searchParams.set("labels", draft.labels.trim());
  }

  return url.toString();
}
