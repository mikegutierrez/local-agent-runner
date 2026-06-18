import type {
  StartScriptRunRequest,
  StartScriptRunResponse,
  CancelRunRequest,
  RunEvent,
  CancelRunResponse,
  RunHistoryItem,
} from "../runs/types";
import type {
  WorkspaceSelection,
  InspectWorkspaceRequest,
  InspectWorkspaceResponse,
} from "../workspaces/types";

export const IPC_CHANNELS = {
  workspacesPickFolder: "workspaces:pick-folder",
  workspacesInspect: "workspaces:inspect",
  runsStartScript: "runs:start-script",
  runsCancel: "runs:cancel",
  runsEvent: "runs:event",
  runsHistoryList: "runs:history-list",
  runsHistoryClear: "runs:history-clear",
} as const;

// Request/response channels used with ipcRenderer.invoke/ipcMain.handle.
export type IpcInvokeMap = {
  [IPC_CHANNELS.workspacesPickFolder]: {
    request: void;
    response: WorkspaceSelection | null;
  };
  [IPC_CHANNELS.workspacesInspect]: {
    request: InspectWorkspaceRequest;
    response: InspectWorkspaceResponse;
  };
  [IPC_CHANNELS.runsStartScript]: {
    request: StartScriptRunRequest;
    response: StartScriptRunResponse;
  };
  [IPC_CHANNELS.runsCancel]: {
    request: CancelRunRequest;
    response: CancelRunResponse;
  };
  [IPC_CHANNELS.runsHistoryList]: {
    request: void;
    response: RunHistoryItem[];
  };
  [IPC_CHANNELS.runsHistoryClear]: {
    request: void;
    response: boolean;
  };
};

// One-way event channels sent from main to renderer with webContents.send.
// These are subscribed to through preload APIs, not invoked as commands.
export type IpcEventMap = {
  [IPC_CHANNELS.runsEvent]: RunEvent;
};
