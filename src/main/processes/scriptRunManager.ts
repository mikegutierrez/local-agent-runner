import type { ChildProcessWithoutNullStreams } from "node:child_process";
import {
  CancelRunResponse,
  EmitRunEvent,
  RunId,
  RunLifecycleState,
  StartScriptRunRequest,
  StartScriptRunResponse,
} from "../../shared/runs/types";
import { spawn } from "node:child_process";
import { AppendRunHistory, StartScriptRunParams } from "../types/runs";

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
  appendRunHistory: AppendRunHistory;
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
  appendRunHistory,
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
      const endedAt = now();
      emitEvent({
        type: "run:cancelled",
        runId,
        timestamp: endedAt,
      });
      emitStateChange({ state: "cancelled", runId, emitEvent });
      activeRuns.delete(runId);
      void appendRunHistory({
        runId,
        scriptName: run.scriptName,
        workspacePath: run.workspacePath,
        startedAt: run.startedAt,
        endedAt,
        state: "cancelled",
      });
      return;
    }
    if (exitCode === 0) {
      const endedAt = now();
      emitEvent({
        type: "run:completed",
        runId,
        exitCode,
        timestamp: endedAt,
      });
      emitStateChange({ state: "completed", runId, emitEvent });
      void appendRunHistory({
        runId,
        scriptName: run.scriptName,
        workspacePath: run.workspacePath,
        startedAt: run.startedAt,
        endedAt,
        state: "completed",
        exitCode,
      });
    } else {
      const endedAt = now();
      emitEvent({
        type: "run:failed",
        runId,
        errorMessage: `Process exited with code ${exitCode}`,
        exitCode,
        timestamp: endedAt,
      });
      emitStateChange({ state: "failed", runId, emitEvent });
      void appendRunHistory({
        runId,
        scriptName: run.scriptName,
        workspacePath: run.workspacePath,
        startedAt: run.startedAt,
        endedAt,
        state: "failed",
        exitCode,
      });
    }
    activeRuns.delete(runId);
  });
  childProcess.on("error", (error) => {
    const run = activeRuns.get(runId);
    if (!run) return;
    const endedAt = now();
    emitEvent({
      type: "run:failed",
      runId,
      errorMessage: error.message,
      exitCode: 1,
      timestamp: endedAt,
    });
    emitStateChange({ state: "failed", runId, emitEvent });
    activeRuns.delete(runId);
    void appendRunHistory({
      runId,
      scriptName: run.scriptName,
      workspacePath: run.workspacePath,
      startedAt: run.startedAt,
      endedAt,
      state: "failed",
      errorMessage: error.message,
    });
  });
};

export const startScriptRun = ({
  request,
  emitEvent,
  appendRunHistory,
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

  attachProcessListeners({ childProcess, runId, emitEvent, appendRunHistory });
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
