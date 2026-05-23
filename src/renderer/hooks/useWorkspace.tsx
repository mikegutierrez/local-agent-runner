import { useState } from "react";
import {
  WorkspaceSelection,
  WorkspaceMetadata,
  InspectWorkspaceRequest,
  PackageMetadata,
  GitMetadata,
  InspectionStatus,
} from "../../shared/workspaces/types";
import { inspectWorkspace, pickWorkspaceFolder } from "../desktop/workspaces";

type UseWorkspaceResult = {
  selection: WorkspaceSelection | null;
  packageMetadata: Omit<PackageMetadata, "scripts"> | null;
  packageError: string | undefined;
  scripts: Record<string, string> | null;
  scriptsStatus: InspectionStatus | undefined;
  scriptsError: string | undefined;
  git: GitMetadata | undefined;
  clearWorkspace: () => void;
  pickWorkspace: () => Promise<void>;
  inspectWorkspace: ({ path }: InspectWorkspaceRequest) => Promise<void>;
};

export const useWorkspace = (): UseWorkspaceResult => {
  const [selection, setSelection] = useState<WorkspaceSelection | null>(null);
  const [workspaceMetadata, setWorkspaceMetadata] =
    useState<WorkspaceMetadata | null>(null);

  const clearWorkspace = (): void => {
    setSelection(null);
    setWorkspaceMetadata(null);
  };

  const pickWorkspace = async (): Promise<void> => {
    const result = await pickWorkspaceFolder();
    setWorkspaceMetadata(null);
    setSelection(result);
  };

  const inspectSelectedWorkspace = async ({
    path,
  }: InspectWorkspaceRequest): Promise<void> => {
    setWorkspaceMetadata(null);
    const result = await inspectWorkspace({ path });
    setWorkspaceMetadata(result);
  };

  // --- Package ---
  const packageJson = workspaceMetadata?.packageJson;
  const packageMetadata =
    packageJson?.status === InspectionStatus.OK
      ? {
          name: packageJson.data.name,
          version: packageJson.data.version,
          description: packageJson.data.description,
        }
      : null;

  const packageError =
    packageJson?.status !== InspectionStatus.OK ? packageJson?.error : undefined;

  // --- Scripts ---
  const scriptsEnvelope =
    workspaceMetadata?.packageJson.status === InspectionStatus.OK
      ? workspaceMetadata.packageJson.data.scripts
      : undefined;

  const scriptsStatus = scriptsEnvelope?.status;

  const scripts =
    scriptsEnvelope?.status === InspectionStatus.OK
      ? scriptsEnvelope.data
      : null;

  const scriptsError =
    scriptsEnvelope?.status === InspectionStatus.INVALID
      ? scriptsEnvelope.error
      : undefined;

  // --- Git ---
  const git = workspaceMetadata?.git;

  return {
    selection,
    packageMetadata,
    packageError,
    scripts,
    scriptsStatus,
    scriptsError,
    git,
    clearWorkspace,
    pickWorkspace,
    inspectWorkspace: inspectSelectedWorkspace,
  };
};
