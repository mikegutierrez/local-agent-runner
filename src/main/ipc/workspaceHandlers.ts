import { InspectWorkspaceRequest } from "../../shared/workspaces/types";
import {
  inspectWorkspace,
  pickWorkspaceFolder,
} from "../services/workspaceService";

export const handlePickWorkspaceFolder = async () => await pickWorkspaceFolder();
export const handleInspectWorkspace = async (
  input: InspectWorkspaceRequest,
) => await inspectWorkspace(input);
