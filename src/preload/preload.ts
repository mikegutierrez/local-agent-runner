import { contextBridge } from "electron";
import type { DesktopAPI } from "../shared/desktop-api";

function notImplemented(methodName: string): never {
  throw new Error(`window.desktop.${methodName} is not implemented yet`);
}

// TODO: import ipcRenderer and IPC_CHANNELS
const desktopAPI: DesktopAPI = {
  workspaces: {
    pickFolder: async () => notImplemented("workspaces.pickFolder"),
    inspect: async () => notImplemented("workspaces.inspect"),
  },
  runs: {
    startScript: async () => notImplemented("runs.startScript"),
    cancel: async () => notImplemented("runs.cancel"),
    onEvent: () => notImplemented("runs.onEvent"),
  },
};

contextBridge.exposeInMainWorld("desktop", desktopAPI);
