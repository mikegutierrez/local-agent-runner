import type {
  StartScriptRunRequest,
  StartScriptRunResponse,
  RunEvent,
  CancelRunRequest,
  CancelRunResponse,
  RunHistoryItem,
} from "./runs/types";
import type {
  WorkspaceSelection,
  InspectWorkspaceResponse,
  InspectWorkspaceRequest,
} from "./workspaces/types";

export type DesktopAPI = {
  workspaces: {
    pickFolder(): Promise<WorkspaceSelection | null>;
    inspect(input: InspectWorkspaceRequest): Promise<InspectWorkspaceResponse>;
  };
  runs: {
    startScript(input: StartScriptRunRequest): Promise<StartScriptRunResponse>;
    cancel(input: CancelRunRequest): Promise<CancelRunResponse>;
    // Subscribe to run lifecycle/output events pushed from the main process.
    // The returned function removes the listener and should be called on cleanup.
    onEvent(listener: (event: RunEvent) => void): () => void;
    listHistory(): Promise<RunHistoryItem[]>;
    clearHistory(): Promise<boolean>;
  };
};
