import {
  InspectWorkspaceRequest,
  InspectWorkspaceResponse,
  WorkspaceSelection,
} from "../../shared/workspaces/types";

export const pickWorkspaceFolder =
  async (): Promise<WorkspaceSelection | null> =>
    window.desktop.workspaces.pickFolder();

export const inspectWorkspace = async ({
  path,
}: InspectWorkspaceRequest): Promise<InspectWorkspaceResponse> =>
  window.desktop.workspaces.inspect({ path });
