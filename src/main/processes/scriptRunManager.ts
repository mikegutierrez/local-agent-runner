import type { ChildProcessWithoutNullStreams } from "node:child_process";
import {
  CancelRunResponse,
  EmitRunEvent,
  RunId,
  RunLifecycleState,
  StartScriptRunParams,
  StartScriptRunRequest,
  StartScriptRunResponse,
} from "../../shared/runs/types";
import { spawn } from "node:child_process";

type RunRecord = {
  runId: RunId;
  workspacePath: string;
  scriptName: string;
  childProcess: ChildProcessWithoutNullStreams;
  startedAt: string;
  cancelRequested: boolean;
};

type ActiveRuns = Map<RunId, RunRecord>;

type EmitStateChangeParams = {
  state: RunLifecycleState;
  runId: RunId;
  emitEvent: EmitRunEvent;
};

type SpawnScriptProcessParams = StartScriptRunRequest;

type AttachProcessListenersParams = {
  childProcess: ChildProcessWithoutNullStreams;
  runId: RunId;
  emitEvent: EmitRunEvent;
};

export const activeRuns: ActiveRuns = new Map();

const now = (): string => new Date().toISOString();

const emitStateChange = ({
  state,
  runId,
  emitEvent,
}: EmitStateChangeParams): void =>
  emitEvent({
    type: "run:state-changed",
    runId,
    state,
    timestamp: now(),
  });

const spawnScriptProcess = ({
  scriptName,
  workspacePath,
}: SpawnScriptProcessParams): ChildProcessWithoutNullStreams => {
  try {
    return spawn("npm", ["run", scriptName], {
      cwd: workspacePath,
      shell: true,
    });
  } catch (error) {
    throw new Error(`Error spawning child process ${error}`);
  }
};

const attachProcessListeners = ({
  childProcess,
  runId,
  emitEvent,
}: AttachProcessListenersParams): void => {
  childProcess.stdout.on("data", (chunk) => {
    emitEvent({
      type: "run:stdout",
      runId,
      chunk: chunk.toString(),
      timestamp: now(),
    });
  });
  childProcess.stderr.on("data", (chunk) => {
    emitEvent({
      type: "run:stderr",
      runId,
      chunk: chunk.toString(),
      timestamp: now(),
    });
  });
  childProcess.on("exit", (exitCode) => {
    const run = activeRuns.get(runId);
    if (!run) return;
    if (run?.cancelRequested) {
      emitEvent({
        type: "run:cancelled",
        runId,
        timestamp: now(),
      });
      emitStateChange({ state: "cancelled", runId, emitEvent });
      activeRuns.delete(runId);
      return;
    }
    if (exitCode === 0) {
      emitEvent({
        type: "run:completed",
        runId,
        exitCode,
        timestamp: now(),
      });
      emitStateChange({ state: "completed", runId, emitEvent });
    } else {
      emitEvent({
        type: "run:failed",
        runId,
        errorMessage: `Process exited with code ${exitCode}`,
        exitCode,
        timestamp: now(),
      });
      emitStateChange({ state: "failed", runId, emitEvent });
    }
    activeRuns.delete(runId);
  });
  childProcess.on("error", (error) => {
    emitEvent({
      type: "run:failed",
      runId,
      errorMessage: error.message,
      exitCode: 1,
      timestamp: now(),
    });
    emitStateChange({ state: "failed", runId, emitEvent });
    activeRuns.delete(runId);
  });
};

export const startScriptRun = ({
  request,
  emitEvent,
}: StartScriptRunParams): StartScriptRunResponse => {
  const { workspacePath, scriptName } = request;
  const runId: RunId = crypto.randomUUID();
  const startedAt: string = now();

  emitEvent({
    type: "run:started",
    runId,
    workspacePath,
    scriptName,
    command: `npm run ${scriptName}`,
    timestamp: startedAt,
  });

  emitStateChange({ state: "starting", runId, emitEvent });

  const childProcess = spawnScriptProcess({ scriptName, workspacePath });

  activeRuns.set(runId, {
    runId,
    workspacePath,
    scriptName,
    childProcess,
    startedAt,
    cancelRequested: false,
  });

  attachProcessListeners({ childProcess, runId, emitEvent });
  emitStateChange({ state: "running", runId, emitEvent });

  return {
    runId,
    workspacePath,
    scriptName,
    startedAt,
  };
};
export const cancelRun = (runId: RunId): CancelRunResponse => {
  const run = activeRuns.get(runId);
  if (run?.cancelRequested === false) {
    run.cancelRequested = true;
    return {
      ok: run?.childProcess.kill(),
      runId,
      reason: "Cancel requested",
    };
  }
  return { ok: false, runId };
};
