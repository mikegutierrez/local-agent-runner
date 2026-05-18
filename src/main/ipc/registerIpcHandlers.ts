import { ipcMain, IpcMainInvokeEvent } from "electron";
import { IPC_CHANNELS } from "../../shared/ipc/channels";
import {
  workspacesPickFolderHandler,
  workspacesInspectHandler,
} from "./workspaceHandlers";
import { runsStartScriptHandler, runsCancelHandler } from "./runHandlers";
import { InspectWorkspaceRequest } from "../../shared/workspaces/types";

export function registerIpcHandlers() {
  // Workspaces
  ipcMain.handle(
    IPC_CHANNELS.workspacesPickFolder,
    async () => await workspacesPickFolderHandler(),
  );
  ipcMain.handle(
    IPC_CHANNELS.workspacesInspect,
    async (_event: IpcMainInvokeEvent, input: InspectWorkspaceRequest) =>
      workspacesInspectHandler(input),
  );

  // Runs
  ipcMain.handle(IPC_CHANNELS.runsStartScript, runsStartScriptHandler);
  ipcMain.handle(IPC_CHANNELS.runsCancel, runsCancelHandler);
}
