import { EMPTY_CONTEXT, sanitizeUrl } from "./issue";
import type { PageContext } from "../types";

type PageDetails = Pick<PageContext, "title" | "viewport" | "language">;

function getBrowserLabel(userAgent: string): string {
  if (/Edg\//.test(userAgent)) return "Microsoft Edge";
  if (/Firefox\//.test(userAgent)) return "Firefox";
  if (/Chrome\//.test(userAgent)) return "Google Chrome";
  if (/Safari\//.test(userAgent)) return "Safari";
  return "Unknown browser";
}

export function isExtensionRuntime(): boolean {
  return typeof chrome !== "undefined" && Boolean(chrome.tabs && chrome.scripting);
}

export async function captureCurrentPage(): Promise<PageContext> {
  if (!isExtensionRuntime()) {
    return {
      ...EMPTY_CONTEXT,
      browser: getBrowserLabel(navigator.userAgent),
      capturedAt: new Date().toLocaleString()
    };
  }

  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  let details: Partial<PageDetails> = {};

  if (tab?.id) {
    try {
      const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => ({
          title: document.title,
          viewport: `${window.innerWidth} × ${window.innerHeight}`,
          language: document.documentElement.lang || navigator.language
        })
      });
      details = result[0]?.result ?? {};
    } catch {
      // Browser-owned pages cannot be inspected. The tab metadata remains useful.
    }
  }

  return {
    title: details.title || tab?.title || "Not available",
    url: sanitizeUrl(tab?.url),
    viewport: details.viewport || "Not available",
    language: details.language || navigator.language || "Not available",
    browser: getBrowserLabel(navigator.userAgent),
    capturedAt: new Date().toLocaleString()
  };
}
