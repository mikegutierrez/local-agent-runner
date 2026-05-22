import { useCallback, useState } from "react";
import { WorkspaceSelection } from "../shared/workspaces/types";

export function App() {
  const [folder, setFolder] = useState<WorkspaceSelection | null>(null);

  const onSelectRepository = useCallback(async () => {
    const result = await window.desktop.workspaces.pickFolder();
    setFolder(result);
  }, []);

  const onClearRepository = useCallback(() => setFolder(null), []);

  return (
    <main id="app-root">
      <header>
        <h1>Local Agent Runner</h1>
        <button onClick={onSelectRepository}>Select repository</button>
        {folder && (
          <section>
            <div>
              <p>{folder.name}</p>
              <pre>{folder.path}</pre>
            </div>
            <br />
            <button onClick={onClearRepository}>Clear repository</button>
          </section>
        )}
      </header>
    </main>
  );
}
