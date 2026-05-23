import { dialog } from "electron";
import path from "node:path";

import {
  InspectWorkspaceRequest,
  InspectWorkspaceResponse,
  WorkspaceSelection,
} from "../../shared/workspaces/types";
import { inspectGitMetadata } from "./gitService";
import { parsePackageJson } from "./packageJsonService";

export const pickWorkspaceFolder =
  async (): Promise<WorkspaceSelection | null> => {
    const result = await dialog.showOpenDialog({
      title: "Pick a workspace",
      properties: ["openDirectory"],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    const filePath = result.filePaths[0];
    const name = path.basename(filePath);

    return { path: filePath, name };
  };

export const inspectWorkspace = async ({
  path: filePath,
}: InspectWorkspaceRequest): Promise<InspectWorkspaceResponse> => {
  const workspaceSelection = {
    path: filePath,
    name: path.basename(filePath),
  };

  const packageJson = await parsePackageJson({ path: filePath });
  const git = await inspectGitMetadata({ path: filePath });

  return {
    ...workspaceSelection,
    packageJson,
    git,
  };
};
