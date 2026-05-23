import { InspectionStatus } from "../shared/workspaces/types";
import { useWorkspace } from "./hooks/useWorkspace";

export function App() {
  const {
    selection,
    packageMetadata,
    packageError,
    scripts,
    scriptsStatus,
    scriptsError,
    git,
    clearWorkspace,
    pickWorkspace,
    inspectWorkspace,
  } = useWorkspace();

  return (
    <main id="app-root">
      <header className="app-header">
        <div>
          <p className="eyebrow">Local developer workspace</p>
          <h1>Local Agent Runner</h1>
        </div>
        <button className="button button-primary" onClick={pickWorkspace}>
          Select workspace
        </button>
      </header>

      {selection ? (
        <section className="workspace-shell">
          <div className="workspace-header">
            <div className="workspace-title">
              <span className="status-dot" aria-hidden="true" />
              <div>
                <h2>{selection.name}</h2>
                <code>{selection.path}</code>
              </div>
            </div>
            <div className="workspace-actions">
              <button
                className="button button-secondary"
                onClick={() => inspectWorkspace({ path: selection.path })}
              >
                Inspect workspace
              </button>
              <button className="button button-ghost" onClick={clearWorkspace}>
                Clear
              </button>
            </div>
          </div>

          <div className="inspector-grid">
            <section className="panel panel-wide">
              <div className="panel-header">
                <h3>Package</h3>
                {packageMetadata?.version && (
                  <span className="pill">v{packageMetadata.version}</span>
                )}
              </div>

              {packageMetadata ? (
                <div className="metadata-list">
                  <div>
                    <span>Name</span>
                    <strong>{packageMetadata.name ?? "Unnamed package"}</strong>
                  </div>
                  {packageMetadata.description && (
                    <div>
                      <span>Description</span>
                      <p>{packageMetadata.description}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="empty-state">
                  Inspect the workspace to load package metadata.
                </p>
              )}

              {packageError && <p className="message message-error">{packageError}</p>}
            </section>

            <section className="panel">
              <div className="panel-header">
                <h3>Git</h3>
                {git?.isRepo && <span className="pill pill-green">repository</span>}
              </div>

              {git?.isRepo ? (
                <div className="metadata-list">
                  <div>
                    <span>Branch</span>
                    <strong>{git.branch || "detached HEAD"}</strong>
                  </div>
                  <div>
                    <span>Status</span>
                    <strong>
                      {git.hasUncommittedChanges ? "Uncommitted changes" : "Clean"}
                    </strong>
                  </div>
                </div>
              ) : (
                <p className="empty-state">
                  Git metadata appears after inspection for repositories.
                </p>
              )}
            </section>
          </div>

          <section className="panel scripts-panel">
            <div className="panel-header">
              <h3>Scripts</h3>
              {scripts && (
                <span className="pill">{Object.keys(scripts).length} found</span>
              )}
            </div>

            {scriptsStatus === InspectionStatus.OK && scripts && (
              <pre>{JSON.stringify(scripts, null, 2)}</pre>
            )}
            {scriptsStatus === InspectionStatus.MISSING && (
              <p className="message">No scripts found.</p>
            )}
            {scriptsError && <p className="message message-error">{scriptsError}</p>}
            {!scriptsStatus && (
              <p className="empty-state">
                Inspect the workspace to discover available npm scripts.
              </p>
            )}
          </section>
        </section>
      ) : (
        <section className="empty-workspace">
          <h2>No workspace selected</h2>
          <p>Choose a local project folder to inspect package and git metadata.</p>
        </section>
      )}
    </main>
  );
}
