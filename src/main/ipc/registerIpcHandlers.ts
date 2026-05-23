import { ipcMain, IpcMainInvokeEvent } from "electron";
import { IPC_CHANNELS } from "../../shared/ipc/channels";
import {
  handlePickWorkspaceFolder,
  handleInspectWorkspace,
} from "./workspaceHandlers";
import { handleStartScriptRun, handleCancelRun } from "./runHandlers";
import { InspectWorkspaceRequest } from "../../shared/workspaces/types";

export function registerIpcHandlers() {
  // Workspaces
  ipcMain.handle(
    IPC_CHANNELS.workspacesPickFolder,
    () => handlePickWorkspaceFolder(),
  );
  ipcMain.handle(
    IPC_CHANNELS.workspacesInspect,
    async (_event: IpcMainInvokeEvent, input: InspectWorkspaceRequest) =>
      handleInspectWorkspace(input),
  );

  // Runs
  ipcMain.handle(IPC_CHANNELS.runsStartScript, handleStartScriptRun);
  ipcMain.handle(IPC_CHANNELS.runsCancel, handleCancelRun);
}
