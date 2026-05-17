import { contextBridge } from "electron";
import { DesktopAPI } from "../shared/desktop-api";

const desktopAPI: DesktopAPI = {
  workspaces: {
    pick: async () => null,
  },
};

contextBridge.exposeInMainWorld("desktop", desktopAPI);
