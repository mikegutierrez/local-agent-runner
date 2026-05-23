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
      <header>
        <h1>Local Agent Runner</h1>
        <button onClick={pickWorkspace}>Select workspace</button>
        {selection && (
          <section>
            <div>
              <h2>{selection.name}</h2>
              <pre>{selection.path}</pre>
            </div>
            <br />
            <button
              onClick={() => inspectWorkspace({ path: selection.path })}
            >
              Inspect workspace
            </button>
            <br />

            {packageMetadata && (
              <div>
                {packageMetadata.name && <h3>{packageMetadata.name}</h3>}
                {packageMetadata.version && <h4>{packageMetadata.version}</h4>}
                {packageMetadata.description && (
                  <p>{packageMetadata.description}</p>
                )}
              </div>
            )}
            {packageError && <h4>{packageError}</h4>}
            {scriptsError && <h4>{scriptsError}</h4>}
            {scriptsStatus === InspectionStatus.MISSING && (
              <h4>No scripts found</h4>
            )}
            <div style={{ display: "flex", flexDirection: "row", gap: 8 }}>
              {scriptsStatus === InspectionStatus.OK && scripts && (
                <div style={{ width: "60%" }}>
                  <h3>Scripts</h3>
                  <pre>{JSON.stringify(scripts, null, 2)}</pre>
                </div>
              )}
              {git?.isRepo && (
                <div style={{ width: "40%" }}>
                  <h3>git</h3>
                  <pre>
                    {JSON.stringify(
                      {
                        branch: git.branch,
                        hasUncommittedChanges: git.hasUncommittedChanges,
                      },
                      null,
                      2,
                    )}
                  </pre>
                </div>
              )}
            </div>

            <br />
            <button onClick={clearWorkspace}>Clear workspace</button>
          </section>
        )}
      </header>
    </main>
  );
}
