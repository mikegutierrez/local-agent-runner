export type RunId = `${string}-${string}-${string}-${string}-${string}`;

export type EmitRunEvent = (event: RunEvent) => void;

// Synchronous acknowledgement returned by runs.startScript once the main
// process has accepted the request and allocated a run id. This does not mean
// the child process has emitted output or reached the running state yet.
export type StartScriptRunRequest = {
  workspacePath: string;
  scriptName: string;
};

export type StartScriptRunResponse = {
  runId: RunId;
  workspacePath: string;
  scriptName: string;
  startedAt: string;
};

export type CancelRunRequest = {
  runId: RunId;
};

export type CancelRunResponse = {
  ok: boolean;
  runId: RunId;
  reason?: string;
};

export type RunLifecycleState =
  | "starting"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export type TerminalRunState = "completed" | "failed" | "cancelled";

export type RunEvent =
  | {
      // Broadcast event emitted when the run is actually created in the process
      // lifecycle stream. Consumers should use this for timeline/output state, not as
      // the command response for runs.startScript.
      type: "run:started";
      runId: RunId;
      workspacePath: string;
      scriptName: string;
      command: string;
      timestamp: string;
    }
  | {
      type: "run:stdout";
      runId: RunId;
      chunk: string;
      timestamp: string;
    }
  | {
      type: "run:stderr";
      runId: RunId;
      chunk: string;
      timestamp: string;
    }
  | {
      // Generic lifecycle transition event for UI state machines. Terminal events
      // below carry their own payloads, so this should not replace them.
      type: "run:state-changed";
      runId: RunId;
      state: RunLifecycleState;
      timestamp: string;
    }
  | {
      // Terminal success event for a process that exited normally with code 0.
      type: "run:completed";
      runId: RunId;
      exitCode: number;
      timestamp: string;
    }
  | {
      // Terminal failure event for spawn errors or non-zero exits. exitCode may be
      // absent when the process failed before an exit code existed.
      type: "run:failed";
      runId: RunId;
      errorMessage: string;
      exitCode?: number | null;
      timestamp: string;
    }
  | {
      // Terminal cancellation event for user-initiated stops. Treat separately from
      // failed so retry/history UI can explain intent correctly.
      type: "run:cancelled";
      runId: RunId;
      timestamp: string;
    };

export type RunHistoryItem = {
  runId: RunId;
  scriptName: string;
  workspacePath: string;
  startedAt: string;
  endedAt: string;
  state: TerminalRunState;
  exitCode?: number | null;
  errorMessage?: string;
};
