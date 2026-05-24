import { InspectionStatus } from "../shared/workspaces/types";
import { useWorkspace } from "./hooks/useWorkspace";
import { classNames } from "./utils/classNames";

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
    inspectError,
    isLoading,
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
              <span
                className={classNames({
                  "status-dot": true,
                  "status-dot-loading": isLoading,
                  "status-dot-error": Boolean(inspectError),
                })}
                aria-hidden="true"
              />
              <div>
                <h2>{selection.name}</h2>
                <code>{selection.path}</code>
              </div>
            </div>
            <div className="workspace-actions">
              <button
                className="button button-secondary"
                disabled={isLoading}
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
                <>
                  {inspectError ? (
                    <p className="message message-error">{inspectError}</p>
                  ) : (
                    <p className="empty-state">
                      Inspect the workspace to load package metadata.
                    </p>
                  )}
                </>
              )}

              {packageError && (
                <p className="message message-error">{packageError}</p>
              )}
            </section>

            <section className="panel">
              <div className="panel-header">
                <h3>Git</h3>
                {git?.isRepo && (
                  <span className="pill pill-green">repository</span>
                )}
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
                      {git.hasUncommittedChanges
                        ? "Uncommitted changes"
                        : "Clean"}
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
                <span className="pill">
                  {Object.keys(scripts).length} found
                </span>
              )}
            </div>

            {scriptsStatus === InspectionStatus.OK && scripts && (
              <pre>{JSON.stringify(scripts, null, 2)}</pre>
            )}
            {scriptsStatus === InspectionStatus.MISSING && (
              <p className="message">No scripts found.</p>
            )}
            {scriptsError && (
              <p className="message message-error">{scriptsError}</p>
            )}
            {!scriptsStatus && (
              <p className="empty-state">
                Inspect the workspace to discover available npm scripts.
              </p>
            )}
          </section>

          {scripts && (
            <section className="panel scripts-panel execute-scripts">
              <div className="panel-header">
                <h3>Execute scripts</h3>
              </div>
              <ul>
                <li>
                  <span>Name</span>
                  <span>Command</span>
                </li>
                {Object.entries(scripts).map(([name, command]) => (
                  <li key={name}>
                    <span>{name}</span>
                    <span>{command}</span>
                    <span>
                      <button
                        disabled
                        className="button button-small button-ghost"
                      >
                        Execute
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </section>
      ) : (
        <section className="empty-workspace">
          <h2>No workspace selected</h2>
          <p>
            Choose a local project folder to inspect package and git metadata.
          </p>
        </section>
      )}
    </main>
  );
}
