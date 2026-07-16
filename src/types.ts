export type Severity = "Low" | "Medium" | "High" | "Critical";

export interface IssueDraft {
  title: string;
  steps: string;
  expected: string;
  actual: string;
  severity: Severity;
  labels: string;
  includePageTitle: boolean;
}

export interface PageContext {
  title: string;
  url: string;
  viewport: string;
  language: string;
  browser: string;
  capturedAt: string;
}

export interface Settings {
  repository: string;
}
