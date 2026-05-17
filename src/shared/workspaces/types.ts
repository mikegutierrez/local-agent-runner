export type WorkspaceSelection = {
  path: string;
  name: string;
};

export type WorkspaceMetadata = WorkspaceSelection & {
  packageJson: {
    name?: string;
    version?: string;
    description?: string;
    scripts: Record<string, string>;
  } | null;
  git: {
    isRepo: boolean;
    branch?: string;
    hasUncommittedChanges?: boolean;
  };
};

export type InspectWorkspaceRequest = {
  path: string;
};

export type InspectWorkspaceResponse = WorkspaceMetadata;
