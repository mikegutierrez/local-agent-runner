import { contextBridge } from "electron";
import type { DesktopAPI } from "../shared/desktop-api";

const desktopAPI: DesktopAPI = {
  workspaces: {
    pickFolder: async () => null,
    inspect: async (path) => ({
      path,
      name: "string",
      packageJson: { scripts: { start: "start" } },
      git: { isRepo: true },
    }),
  },
  runs: {
    startScript: async ({ workspacePath, scriptName }) => ({
      workspacePath,
      scriptName,
      runId: "placeholder-run",
      startedAt: new Date().toISOString(),
    }),
    cancel: async (_runId) => {},
    onEvent: (_listener) => () => {},
  },
};

contextBridge.exposeInMainWorld("desktop", desktopAPI);
