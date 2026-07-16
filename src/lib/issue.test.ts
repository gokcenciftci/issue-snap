import { describe, expect, it } from "vitest";
import { buildGitHubIssueUrl, buildIssueMarkdown, isValidRepository, sanitizeUrl } from "./issue";
import type { IssueDraft, PageContext } from "../types";

const draft: IssueDraft = {
  title: "Save button does not respond",
  steps: "Open the editor\nClick Save",
  expected: "The document is saved",
  actual: "Nothing happens",
  severity: "High",
  labels: "bug,frontend",
  includePageTitle: true
};

const context: PageContext = {
  title: "Document editor",
  url: "https://example.com/editor?view=full",
  viewport: "1440 × 900",
  language: "en",
  browser: "Google Chrome",
  capturedAt: "2026-07-12, 12:00"
};

describe("sanitizeUrl", () => {
  it("keeps only a page origin, never a path, fragment, or query value", () => {
    expect(
      sanitizeUrl("https://example.com/path?utm_source=newsletter&token=secret&tab=profile#section")
    ).toBe("https://example.com");
  });

  it("does not expose unsupported browser URLs", () => {
    expect(sanitizeUrl("chrome://settings")).toBe("Not available");
  });
});

describe("issue generation", () => {
  it("builds an editable, complete Markdown draft", () => {
    const markdown = buildIssueMarkdown(draft, context);
    expect(markdown).toContain("## Steps to reproduce");
    expect(markdown).toContain("1. Open the editor");
    expect(markdown).not.toContain("- **Severity:**");
    expect(markdown).toContain("## Severity\nHigh");
    expect(markdown).toContain("- **Page:** Document editor");
  });

  it("omits the active page title unless the reporter opts in", () => {
    const markdown = buildIssueMarkdown({ ...draft, includePageTitle: false }, context);
    expect(markdown).toContain("- **Page:** Not included");
  });

  it("accepts valid GitHub owner/repository values only", () => {
    expect(isValidRepository("octocat/Hello-World")).toBe(true);
    expect(isValidRepository("missing-slash")).toBe(false);
  });

  it("creates a GitHub new-issue URL with title, labels, and body", () => {
    const url = buildGitHubIssueUrl("octocat/Hello-World", draft, context);
    expect(url).not.toBeNull();
    const parsed = new URL(url!);
    expect(parsed.pathname).toBe("/octocat/Hello-World/issues/new");
    expect(parsed.searchParams.get("labels")).toBe("bug,frontend");
    expect(parsed.searchParams.get("body")).toContain("Save button does not respond");
  });
});
