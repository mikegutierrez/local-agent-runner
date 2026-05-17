import { contextBridge, ipcRenderer } from "electron";
import { IPC_CHANNELS, type IpcInvokeMap } from "../shared/ipc/channels";
import type { DesktopAPI } from "../shared/desktop-api";
import type { RunEvent } from "../shared/runs/types";

function invoke<Channel extends keyof IpcInvokeMap>(
  channel: Channel,
  request: IpcInvokeMap[Channel]["request"],
): Promise<IpcInvokeMap[Channel]["response"]> {
  return ipcRenderer.invoke(channel, request);
}

const desktopAPI: DesktopAPI = {
  workspaces: {
    pickFolder: async () =>
      invoke(IPC_CHANNELS.workspacesPickFolder, undefined),
    inspect: async (input) => invoke(IPC_CHANNELS.workspacesInspect, input),
  },
  runs: {
    startScript: async (input) => invoke(IPC_CHANNELS.runsStartScript, input),
    cancel: async (input) => invoke(IPC_CHANNELS.runsCancel, input),
    onEvent: (listener: (event: RunEvent) => void) => {
      const callback = (
        _event: Electron.IpcRendererEvent,
        payload: RunEvent,
      ) => {
        listener(payload);
      };
      ipcRenderer.on(IPC_CHANNELS.runsEvent, callback);

      return () => {
        ipcRenderer.removeListener(IPC_CHANNELS.runsEvent, callback);
      };
    },
  },
};

contextBridge.exposeInMainWorld("desktop", desktopAPI);
