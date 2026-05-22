import { dialog } from "electron";
import path from "node:path";
import fs from "node:fs";

import {
  InspectWorkspaceRequest,
  InspectWorkspaceResponse,
  WorkspaceMetadata,
  WorkspaceSelection,
} from "../../shared/workspaces/types";
import { parseGitOutput } from "./gitService";

export const workspacesPickFolder =
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

const parsePackageJson = async ({
  path: filePath,
}: InspectWorkspaceRequest): Promise<WorkspaceMetadata["packageJson"]> => {
  try {
    const packageJsonPath = path.join(filePath, "package.json");
    const raw = await fs.promises.readFile(packageJsonPath, {
      encoding: "utf-8",
    });
    const parsed = JSON.parse(raw);
    return {
      name: parsed?.name,
      version: parsed?.version,
      description: parsed?.description,
      scripts: parsed?.scripts ?? {},
    };
  } catch (error) {
    console.error("parsePackageJson error: ", error);
    return null;
  }
};

export const workspacesInspect = async ({
  path: filePath,
}: InspectWorkspaceRequest): Promise<InspectWorkspaceResponse> => {
  const workspaceSelection = {
    path: filePath,
    name: path.basename(filePath),
  };

  const packageJson = await parsePackageJson({ path: filePath });
  const git = await parseGitOutput({ path: filePath });

  return {
    ...workspaceSelection,
    packageJson,
    git,
  };
};
