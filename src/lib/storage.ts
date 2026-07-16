import { DEFAULT_DRAFT } from "./issue";
import type { IssueDraft, Settings } from "../types";

const DRAFT_KEY = "issue-snap:draft";
const SETTINGS_KEY = "issue-snap:settings";

const DEFAULT_SETTINGS: Settings = {
  repository: ""
};

function canUseStorage(): boolean {
  return typeof chrome !== "undefined" && Boolean(chrome.storage?.local);
}

export async function loadDraft(): Promise<IssueDraft> {
  if (!canUseStorage()) return DEFAULT_DRAFT;
  const data = await chrome.storage.local.get(DRAFT_KEY);
  return { ...DEFAULT_DRAFT, ...(data[DRAFT_KEY] as Partial<IssueDraft> | undefined) };
}

export async function saveDraft(draft: IssueDraft): Promise<void> {
  if (canUseStorage()) await chrome.storage.local.set({ [DRAFT_KEY]: draft });
}

export async function loadSettings(): Promise<Settings> {
  if (!canUseStorage()) return DEFAULT_SETTINGS;
  const data = await chrome.storage.local.get(SETTINGS_KEY);
  return { ...DEFAULT_SETTINGS, ...(data[SETTINGS_KEY] as Partial<Settings> | undefined) };
}

export async function saveSettings(settings: Settings): Promise<void> {
  if (canUseStorage()) await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
}
