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

export type StartScriptRunInput = {
  workspacePath: string;
  scriptName: string;
};

export type RunStarted = {
  runId: string;
  workspacePath: string;
  scriptName: string;
  startedAt: string;
};

export type RunLifecycleState =
  | "starting"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export type RunEvent =
  | {
      type: "state";
      runId: string;
      state: RunLifecycleState;
      timestamp: string;
      exitCode?: number;
      errorMessage?: string;
    }
  | {
      type: "output";
      runId: string;
      stream: "stdout" | "stderr";
      chunk: string;
      timestamp: string;
    };

export type DesktopAPI = {
  workspaces: {
    pickFolder(): Promise<WorkspaceSelection | null>;
    inspect(path: string): Promise<WorkspaceMetadata>;
  };
  runs: {
    startScript(input: StartScriptRunInput): Promise<RunStarted>;
    cancel(runId: string): Promise<void>;
    onEvent(listener: (event: RunEvent) => void): () => void;
  };
};
