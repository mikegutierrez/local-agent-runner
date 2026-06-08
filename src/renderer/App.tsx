import { AnsiUp } from "ansi_up";
import dayjs from "dayjs";
import { CirclePlay, CircleStop, Trash } from "lucide-react";
import { InspectionStatus } from "../shared/workspaces/types";
import { useRuns } from "./hooks/useRuns";
import { useWorkspace } from "./hooks/useWorkspace";
import { classNames } from "./utils/classNames";
import { RunId } from "../shared/runs/types";

const ansiUp = new AnsiUp();

export function App() {
  const { startScript, cancelRun, clearRuns, runs, isRunActive, activeRuns } =
    useRuns();

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
  } = useWorkspace({ clearRuns });

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

          <div className={runs ? "script-grid" : ""}>
            <section className="panel">
              <div className="panel-header">
                <h3>Scripts</h3>
                {scripts && (
                  <span className="pill">
                    {Object.keys(scripts).length} found
                  </span>
                )}
              </div>

              {scriptsStatus === InspectionStatus.OK && scripts && (
                <section className="panel-table">
                  <ul>
                    <li className="grid-row grid-row-3">
                      <span>Name</span>
                      <span>Command</span>
                    </li>
                    {Object.entries(scripts).map(([name, command]) => {
                      const run =
                        activeRuns &&
                        Object.values(activeRuns)
                          .filter((active) => active.scriptName === name)
                          .pop();
                      const isActive = run && isRunActive(run);
                      return (
                        <li key={name} className="grid-row grid-row-3">
                          <span>
                            {name}{" "}
                            {Object.keys(activeRuns).includes(
                              run?.runId as RunId,
                            ) && (
                              <span
                                className={classNames({
                                  "status-dot": true,
                                  "status-dot-loading": isActive || false,
                                })}
                                aria-hidden="true"
                              />
                            )}
                          </span>
                          <span>{command}</span>
                          <span className="script-actions">
                            {isActive && (
                              <button
                                className="button button-icon button-icon-stop"
                                onClick={() => cancelRun({ runId: run.runId })}
                                aria-label={`Stop ${name}`}
                                title={`Stop ${name}`}
                              >
                                <CircleStop aria-hidden="true" />
                              </button>
                            )}
                            <button
                              disabled={isActive}
                              className="button button-icon button-icon-start"
                              onClick={() =>
                                startScript({
                                  workspacePath: selection.path,
                                  scriptName: name,
                                })
                              }
                              aria-label={`Run ${name}`}
                              title={`Run ${name}`}
                            >
                              <CirclePlay aria-hidden="true" />
                            </button>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </section>
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
            {runs && (
              <section className="panel">
                <div className="panel-header">
                  <h3>Output</h3>
                  <span className="pill">
                    {Object.keys(runs).length}{" "}
                    {Object.keys(runs).length > 1 ? "runs" : "run"}
                  </span>
                </div>
                <section className="panel-table">
                  {Object.entries(runs).map(([id, run]) => {
                    const isActive = run && isRunActive(run);
                    return (
                      <ul key={id}>
                        <li>
                          {run.scriptName}
                          <span
                            className={classNames({
                              "space-left": true,
                              "status-dot": true,
                              "status-dot-loading": isActive || false,
                              "status-dot-error": run?.exitCode === 1,
                            })}
                            aria-hidden="true"
                          />
                        </li>
                        {run?.output.map((entry, index) => (
                          <li
                            key={`${entry.timestamp}-${index}`}
                            className={`output-line output-line-${entry.stream}`}
                          >
                            <pre
                              dangerouslySetInnerHTML={{
                                __html: ansiUp.ansi_to_html(entry.chunk),
                              }}
                            />
                          </li>
                        ))}
                        {run?.errorMessage && <li>{run?.errorMessage}</li>}
                      </ul>
                    );
                  })}
                </section>
              </section>
            )}
          </div>

          {runs && (
            <section className="panel panel-table">
              <div className="panel-header">
                <h3>Runs</h3>
                <span className="script-actions">
                  <button
                    className="button button-icon button-icon-start"
                    onClick={clearRuns}
                    aria-label="Clear runs"
                    title="Clear runs"
                  >
                    <Trash aria-hidden="true" />
                  </button>
                </span>
              </div>
              <ul>
                <li className="grid-row grid-row-4">
                  <span>Name</span>
                  <span>State</span>
                  <span>Started At</span>
                  <span>Ended At</span>
                </li>
                {Object.entries(runs).map(([id, run]) => {
                  const isDoneRunning =
                    run.state === "cancelled" ||
                    run.state === "completed" ||
                    run.state === "failed";
                  return (
                    <li key={id} className="grid-row grid-row-4">
                      <span>{run.scriptName}</span>
                      <span>{run.state}</span>
                      <span>{dayjs(run.startedAt).format("h:mm:ss A")}</span>
                      <span>
                        {isDoneRunning &&
                          dayjs(run.endedAt).format("h:mm:ss A")}
                      </span>
                    </li>
                  );
                })}
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
