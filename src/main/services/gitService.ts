import {
  InspectWorkspaceRequest,
  WorkspaceMetadata,
} from "../../shared/workspaces/types";
import { runExec } from "../processes/runExec";

export const parseGitOutput = async ({
  path: filePath,
}: InspectWorkspaceRequest): Promise<WorkspaceMetadata["git"]> => {
  const revParse = await runExec({
    command: "git rev-parse --is-inside-work-tree",
    path: filePath,
  });

  if (!revParse.ok || revParse.stdout?.trim() !== "true") {
    return { isRepo: false };
  }

  const branch = await runExec({
    command: "git branch --show-current",
    path: filePath,
  });

  const statusOut = await runExec({
    command: "git status --porcelain",
    path: filePath,
  });

  return {
    isRepo: true,
    branch: branch.stdout?.split(/\r?\n/)[0],
    hasUncommittedChanges: Boolean(statusOut.stdout?.trim()),
  };
};
