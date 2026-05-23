export type WorkspaceSelection = {
  path: string;
  name: string;
};

export enum InspectionStatus {
  OK = "ok",
  MISSING = "missing",
  INVALID = "invalid",
}

export type PackageScriptsEnvelope =
  | { status: InspectionStatus.OK; data: Record<string, string> }
  | { status: InspectionStatus.MISSING }
  | { status: InspectionStatus.INVALID; error: string };

export type PackageMetadata = {
  name?: string;
  version?: string;
  description?: string;
  scripts: PackageScriptsEnvelope;
};

export type PackageJsonEnvelope =
  | { status: InspectionStatus.OK; data: PackageMetadata }
  | { status: InspectionStatus.MISSING; error?: string }
  | { status: InspectionStatus.INVALID; error?: string };

export type GitMetadata = {
  isRepo: boolean;
  branch?: string;
  hasUncommittedChanges?: boolean;
};

export type WorkspaceMetadata = WorkspaceSelection & {
  packageJson: PackageJsonEnvelope;
  git: GitMetadata;
};

export type InspectWorkspaceRequest = {
  path: string;
};

export type InspectWorkspaceResponse = WorkspaceMetadata;
