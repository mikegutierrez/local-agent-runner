import { useState } from "react";
import {
  WorkspaceSelection,
  WorkspaceMetadata,
  InspectWorkspaceRequest,
  PackageMetadata,
  GitMetadata,
  MetadataStatus,
} from "../../shared/workspaces/types";
import { inspectWorkspace, pickWorkspaceFolder } from "../desktop/workspaces";

type UseWorkspaceResult = {
  selection: WorkspaceSelection | null;
  packageJsonStatus: MetadataStatus | undefined;
  packageMetadata: Omit<PackageMetadata, "scripts"> | null;
  packageError: string | undefined;
  scripts: Record<string, string> | null;
  scriptsStatus: MetadataStatus | undefined;
  scriptsError: string | undefined;
  git: GitMetadata | undefined;
  onClearWorkspace: () => void;
  onPickWorkspaceFolder: () => Promise<void>;
  onInspectWorkspace: ({ path }: InspectWorkspaceRequest) => Promise<void>;
};

export const useWorkspace = (): UseWorkspaceResult => {
  const [selection, setSelection] = useState<WorkspaceSelection | null>(null);
  const [workspaceMetadata, setWorkspaceMetadata] =
    useState<WorkspaceMetadata | null>(null);

  const onClearWorkspace = (): void => {
    setSelection(null);
    setWorkspaceMetadata(null);
  };

  const onPickWorkspaceFolder = async (): Promise<void> => {
    const result = await pickWorkspaceFolder();
    setWorkspaceMetadata(null);
    setSelection(result);
  };

  const onInspectWorkspace = async ({
    path,
  }: InspectWorkspaceRequest): Promise<void> => {
    setWorkspaceMetadata(null);
    const result = await inspectWorkspace({ path });
    setWorkspaceMetadata(result);
  };

  // --- Package ---
  const packageJson = workspaceMetadata?.packageJson;
  const packageJsonStatus = packageJson?.status;
  const packageMetadata =
    packageJson?.status === MetadataStatus.OK
      ? {
          name: packageJson.data.name,
          version: packageJson.data.version,
          description: packageJson.data.description,
        }
      : null;

  const packageError =
    packageJson?.status !== MetadataStatus.OK ? packageJson?.error : undefined;

  // --- Scripts ---
  const scriptsEnvelope =
    workspaceMetadata?.packageJson.status === MetadataStatus.OK
      ? workspaceMetadata.packageJson.data.scripts
      : undefined;

  const scriptsStatus = scriptsEnvelope?.status;

  const scripts =
    scriptsEnvelope?.status === MetadataStatus.OK ? scriptsEnvelope.data : null;

  const scriptsError =
    scriptsEnvelope?.status === MetadataStatus.INVALID
      ? scriptsEnvelope.error
      : undefined;

  // --- Git ---
  const git = workspaceMetadata?.git;

  return {
    selection,
    packageJsonStatus,
    packageMetadata,
    packageError,
    scripts,
    scriptsStatus,
    scriptsError,
    git,
    onClearWorkspace,
    onPickWorkspaceFolder,
    onInspectWorkspace,
  };
};
