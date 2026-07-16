import { useCallback, useEffect, useMemo, useState } from "react";
import { captureCurrentPage, isExtensionRuntime } from "./lib/browser";
import {
  buildGitHubIssueUrl,
  buildIssueMarkdown,
  DEFAULT_DRAFT,
  EMPTY_CONTEXT,
  isValidRepository
} from "./lib/issue";
import { loadDraft, loadSettings, saveDraft, saveSettings } from "./lib/storage";
import type { IssueDraft, PageContext, Settings } from "./types";

type View = "report" | "settings";
type NoticeTone = "success" | "warning" | "error";

interface Notice {
  tone: NoticeTone;
  message: string;
}

async function copyText(value: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const element = document.createElement("textarea");
  element.value = value;
  element.setAttribute("readonly", "");
  element.style.position = "fixed";
  element.style.opacity = "0";
  document.body.appendChild(element);
  element.select();
  document.execCommand("copy");
  element.remove();
}

export default function App() {
  const [view, setView] = useState<View>("report");
  const [draft, setDraft] = useState<IssueDraft>(DEFAULT_DRAFT);
  const [settings, setSettings] = useState<Settings>({ repository: "" });
  const [context, setContext] = useState<PageContext>(EMPTY_CONTEXT);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const refreshContext = useCallback(async () => {
    setIsCapturing(true);
    try {
      setContext(await captureCurrentPage());
    } catch {
      setNotice({
        tone: "warning",
        message: "The page context could not be fully captured. You can still edit and copy the draft."
      });
    } finally {
      setIsCapturing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const [savedDraft, savedSettings] = await Promise.all([loadDraft(), loadSettings()]);
        if (!active) return;
        setDraft(savedDraft);
        setSettings(savedSettings);
      } catch {
        if (active) {
          setNotice({
            tone: "warning",
            message: "Your saved draft could not be restored, so a new blank draft was opened."
          });
        }
      }

      if (active) await refreshContext();
    })();

    return () => {
      active = false;
    };
  }, [refreshContext]);

  const markdown = useMemo(() => buildIssueMarkdown(draft, context), [context, draft]);
  const repositoryIsValid = isValidRepository(settings.repository);

  function updateDraft<K extends keyof IssueDraft>(field: K, value: IssueDraft[K]) {
    setDraft((current) => {
      const next = { ...current, [field]: value };
      // Popup pages can disappear immediately, so persist each user change instead of
      // relying on a delayed timer that would be cancelled when the popup closes.
      void saveDraft(next).catch(() => undefined);
      return next;
    });
  }

  async function handleCopy() {
    try {
      await copyText(markdown);
      setNotice({ tone: "success", message: "Markdown copied. Review it, then paste it wherever you need it." });
    } catch {
      setNotice({ tone: "error", message: "The draft could not be copied. Select it from the preview instead." });
    }
  }

  async function handleOpenIssue() {
    const issueUrl = buildGitHubIssueUrl(settings.repository, draft, context);
    if (!issueUrl) {
      setView("settings");
      setNotice({ tone: "warning", message: "Add a valid GitHub repository first, for example octocat/Hello-World." });
      return;
    }

    try {
      if (typeof chrome !== "undefined" && chrome.tabs?.create) {
        await chrome.tabs.create({ url: issueUrl });
      } else {
        window.open(issueUrl, "_blank", "noopener,noreferrer");
      }
      setNotice({ tone: "success", message: "GitHub opened with your editable issue draft." });
    } catch {
      setNotice({ tone: "error", message: "GitHub could not be opened. Copy the Markdown preview instead." });
    }
  }

  function handlePrimaryAction() {
    if (!repositoryIsValid) {
      setView("settings");
      return;
    }

    void handleOpenIssue();
  }

  async function handleSaveSettings() {
    const repository = settings.repository.trim();
    if (!isValidRepository(repository)) {
      setNotice({ tone: "warning", message: "Use a valid GitHub repository such as octocat/Hello-World." });
      return;
    }

    const nextSettings = { repository };
    setSettings(nextSettings);
    try {
      await saveSettings(nextSettings);
      setNotice({ tone: "success", message: "Your GitHub issue target was saved locally." });
      setView("report");
    } catch {
      setNotice({
        tone: "error",
        message: "Your GitHub issue target could not be saved. Try again."
      });
    }
  }

  function handleClearDraft() {
    setDraft(DEFAULT_DRAFT);
    void saveDraft(DEFAULT_DRAFT).catch(() => undefined);
    setNotice({ tone: "success", message: "The current draft was cleared." });
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">IS</span>
          <div>
            <p className="eyebrow">Privacy-first bug reporting</p>
            <h1>IssueSnap</h1>
          </div>
        </div>
        <button
          className="icon-button"
          type="button"
          onClick={() => setView((current) => (current === "report" ? "settings" : "report"))}
          aria-label={view === "report" ? "Open settings" : "Back to report"}
          title={view === "report" ? "Settings" : "Back to report"}
        >
          {view === "report" ? "⚙" : "←"}
        </button>
      </header>

      {notice && (
        <div className={`notice notice-${notice.tone}`} role="status" aria-live="polite">
          {notice.message}
          <button type="button" className="notice-dismiss" onClick={() => setNotice(null)} aria-label="Dismiss message">
            ×
          </button>
        </div>
      )}

      {view === "settings" ? (
        <section className="settings-view" aria-labelledby="settings-title">
          <div className="section-heading">
            <p className="eyebrow">Destination</p>
            <h2 id="settings-title">GitHub issue target</h2>
            <p>IssueSnap keeps this setting only in your browser.</p>
          </div>

          <label className="field-label" htmlFor="repository">
            Repository
            <input
              id="repository"
              className={settings.repository && !repositoryIsValid ? "input input-error" : "input"}
              value={settings.repository}
              onChange={(event) => setSettings({ repository: event.target.value })}
              placeholder="owner/repository"
              autoComplete="off"
              spellCheck={false}
            />
          </label>
          <p className="field-hint">Example: <code>octocat/Hello-World</code></p>
          {settings.repository && !repositoryIsValid && (
            <p className="validation-message">Use the GitHub <code>owner/repository</code> format.</p>
          )}

          <div className="settings-actions">
            <button type="button" className="button button-secondary" onClick={() => setView("report")}>
              Cancel
            </button>
            <button type="button" className="button button-primary" onClick={() => void handleSaveSettings()}>
              Save target
            </button>
          </div>
        </section>
      ) : (
        <>
          <section className="context-card" aria-labelledby="context-title">
            <div className="context-heading">
              <div>
                <p className="eyebrow">Current page</p>
                <h2 id="context-title">Context snapshot</h2>
              </div>
              <button
                type="button"
                className="text-button"
                onClick={() => void refreshContext()}
                disabled={isCapturing}
              >
                {isCapturing ? "Refreshing…" : "Refresh"}
              </button>
            </div>
            <dl className="context-grid">
              <div>
                <dt>Page</dt>
                <dd title={context.title}>{context.title}</dd>
              </div>
              <div>
                <dt>Viewport</dt>
                <dd>{context.viewport}</dd>
              </div>
              <div className="context-url">
                <dt>Site origin</dt>
                <dd title={context.url}>{context.url}</dd>
              </div>
            </dl>
            <p className="privacy-note">Only the site origin is captured automatically. Page paths, query parameters, and fragments never enter the draft.</p>
          </section>

          <form className="report-form" onSubmit={(event) => event.preventDefault()}>
            <div className="section-heading compact">
              <p className="eyebrow">Report details</p>
              <h2>Make the bug actionable</h2>
            </div>

            <label className="field-label" htmlFor="title">
              Short summary
              <input
                id="title"
                className="input"
                value={draft.title}
                onChange={(event) => updateDraft("title", event.target.value)}
                placeholder="Save button does not respond"
              />
            </label>

            <label className="field-label" htmlFor="steps">
              Steps to reproduce
              <textarea
                id="steps"
                className="input textarea"
                value={draft.steps}
                onChange={(event) => updateDraft("steps", event.target.value)}
                placeholder={"Open the editor\nClick Save"}
              />
            </label>

            <div className="two-column-fields">
              <label className="field-label" htmlFor="expected">
                Expected
                <textarea
                  id="expected"
                  className="input textarea compact-textarea"
                  value={draft.expected}
                  onChange={(event) => updateDraft("expected", event.target.value)}
                  placeholder="The document is saved"
                />
              </label>
              <label className="field-label" htmlFor="actual">
                Actual
                <textarea
                  id="actual"
                  className="input textarea compact-textarea"
                  value={draft.actual}
                  onChange={(event) => updateDraft("actual", event.target.value)}
                  placeholder="Nothing happens"
                />
              </label>
            </div>

            <div className="two-column-fields">
              <label className="field-label" htmlFor="severity">
                Severity
                <select
                  id="severity"
                  className="input select"
                  value={draft.severity}
                  onChange={(event) => updateDraft("severity", event.target.value as IssueDraft["severity"])}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </label>
              <label className="field-label" htmlFor="labels">
                Labels
                <input
                  id="labels"
                  className="input"
                  value={draft.labels}
                  onChange={(event) => updateDraft("labels", event.target.value)}
                  placeholder="bug, frontend"
                />
              </label>
            </div>

            <label className="checkbox-field" htmlFor="include-page-title">
              <input
                id="include-page-title"
                type="checkbox"
                checked={draft.includePageTitle}
                onChange={(event) => updateDraft("includePageTitle", event.target.checked)}
              />
              <span>
                <strong>Include current page title in the issue</strong>
                <small>Off by default so a sensitive tab title does not leave your browser.</small>
              </span>
            </label>
          </form>

          <section className="preview-section" aria-labelledby="preview-title">
            <div className="context-heading">
              <div>
                <p className="eyebrow">Editable output</p>
                <h2 id="preview-title">GitHub-flavored Markdown</h2>
              </div>
              <button type="button" className="text-button danger" onClick={handleClearDraft}>
                Clear draft
              </button>
            </div>
            <pre className="markdown-preview">{markdown}</pre>
          </section>

          <section className="action-panel" aria-label="Issue actions">
            <div>
              <p className="action-title">Nothing is sent automatically.</p>
              <p className="action-copy">Review the generated draft before copying it or opening GitHub.</p>
            </div>
            <div className="action-buttons">
              <button type="button" className="button button-secondary" onClick={() => void handleCopy()}>
                Copy Markdown
              </button>
              <button type="button" className="button button-primary" onClick={handlePrimaryAction}>
                {repositoryIsValid ? "Open GitHub issue" : "Set GitHub repository"}
              </button>
            </div>
          </section>

          {!isExtensionRuntime() && (
            <p className="runtime-note">Preview mode: load the built extension in Chrome to capture the active tab.</p>
          )}
        </>
      )}
    </main>
  );
}
