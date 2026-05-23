import { InspectWorkspaceRequest } from "../../shared/workspaces/types";
import {
  inspectWorkspace,
  pickWorkspaceFolder,
} from "../services/workspaceService";

export const handlePickWorkspaceFolder = () => pickWorkspaceFolder();
export const handleInspectWorkspace = async (
  input: InspectWorkspaceRequest,
) => inspectWorkspace(input);
