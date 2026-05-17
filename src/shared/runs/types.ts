// Synchronous acknowledgement returned by runs.startScript once the main
// process has accepted the request and allocated a run id. This does not mean
// the child process has emitted output or reached the running state yet.
export type StartScriptRunRequest = {
  workspacePath: string;
  scriptName: string;
};

export type StartScriptRunResponse = {
  runId: string;
  workspacePath: string;
  scriptName: string;
  startedAt: string;
};

export type CancelRunRequest = {
  runId: string;
};

export type RunLifecycleState =
  | "idle"
  | "starting"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export type RunEvent =
  | {
      // Broadcast event emitted when the run is actually created in the process
      // lifecycle stream. Consumers should use this for timeline/output state, not as
      // the command response for runs.startScript.
      type: "run:started";
      runId: string;
      workspacePath: string;
      scriptName: string;
      command: string;
      timestamp: string;
    }
  | {
      type: "run:stdout";
      runId: string;
      chunk: string;
      timestamp: string;
    }
  | {
      type: "run:stderr";
      runId: string;
      chunk: string;
      timestamp: string;
    }
  | {
      // Generic lifecycle transition event for UI state machines. Terminal events
      // below carry their own payloads, so this should not replace them.
      type: "run:state-changed";
      runId: string;
      state: RunLifecycleState;
      timestamp: string;
    }
  | {
      // Terminal success event for a process that exited normally with code 0.
      type: "run:completed";
      runId: string;
      exitCode: number;
      timestamp: string;
    }
  | {
      // Terminal failure event for spawn errors or non-zero exits. exitCode may be
      // absent when the process failed before an exit code existed.
      type: "run:failed";
      runId: string;
      errorMessage: string;
      exitCode?: number | null;
      timestamp: string;
    }
  | {
      // Terminal cancellation event for user-initiated stops. Treat separately from
      // failed so retry/history UI can explain intent correctly.
      type: "run:cancelled";
      runId: string;
      timestamp: string;
    };
