import { ipcMain, IpcMainInvokeEvent } from "electron";
import { IPC_CHANNELS } from "../../shared/ipc/channels";
import {
  handlePickWorkspaceFolder,
  handleInspectWorkspace,
} from "./workspaceHandlers";
import {
  handleStartScriptRun,
  handleCancelRun,
  handleClearHistory,
  handleListHistory,
} from "./runHandlers";
import { InspectWorkspaceRequest } from "../../shared/workspaces/types";
import {
  CancelRunRequest,
  RunEvent,
  StartScriptRunRequest,
} from "../../shared/runs/types";
import { appendRunHistory } from "../services/runHistoryService";

export function registerIpcHandlers() {
  // Workspaces
  ipcMain.handle(IPC_CHANNELS.workspacesPickFolder, () =>
    handlePickWorkspaceFolder(),
  );
  ipcMain.handle(
    IPC_CHANNELS.workspacesInspect,
    async (_event: IpcMainInvokeEvent, input: InspectWorkspaceRequest) =>
      handleInspectWorkspace(input),
  );

  // Runs
  ipcMain.handle(
    IPC_CHANNELS.runsStartScript,
    async (event: IpcMainInvokeEvent, request: StartScriptRunRequest) =>
      handleStartScriptRun({
        request,
        emitEvent: (runEvent: RunEvent) =>
          event.sender.send(IPC_CHANNELS.runsEvent, runEvent),
        appendRunHistory,
      }),
  );
  ipcMain.handle(
    IPC_CHANNELS.runsCancel,
    (_event: IpcMainInvokeEvent, request: CancelRunRequest) =>
      handleCancelRun(request),
  );
  ipcMain.handle(IPC_CHANNELS.runsHistoryList, () => handleListHistory());
  ipcMain.handle(IPC_CHANNELS.runsHistoryClear, () => handleClearHistory());
}
