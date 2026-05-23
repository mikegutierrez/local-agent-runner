export type WorkspaceSelection = {
  path: string;
  name: string;
};

export enum MetadataStatus {
  OK = "ok",
  MISSING = "missing",
  INVALID = "invalid",
}

export type PackageScriptsEnvelope =
  | { status: MetadataStatus.OK; data: Record<string, string> }
  | { status: MetadataStatus.MISSING }
  | { status: MetadataStatus.INVALID; error: string };

export type PackageMetadata = {
  name?: string;
  version?: string;
  description?: string;
  scripts: PackageScriptsEnvelope;
};

export type PackageJsonEnvelope =
  | { status: MetadataStatus.OK; data: PackageMetadata }
  | { status: MetadataStatus.MISSING; error?: string }
  | { status: MetadataStatus.INVALID; error?: string };

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
