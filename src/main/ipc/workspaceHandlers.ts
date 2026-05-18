import { InspectWorkspaceRequest } from "../../shared/workspaces/types";
import {
  workspacesInspect,
  workspacesPickFolder,
} from "../services/workspaceService";

export const workspacesPickFolderHandler = async () =>
  await workspacesPickFolder();
export const workspacesInspectHandler = async (
  input: InspectWorkspaceRequest,
) => await workspacesInspect(input);
