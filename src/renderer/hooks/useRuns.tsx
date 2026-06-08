import { useEffect, useState } from "react";
import {
  CancelRunRequest,
  CancelRunResponse,
  RunEvent,
  RunId,
  RunLifecycleState,
  StartScriptRunRequest,
} from "../../shared/runs/types";
import {
  cancel,
  onEvent,
  startScript as startScriptRun,
} from "../desktop/runs";

type CurrentRun = {
  runId: RunId;
  scriptName: string;
  workspacePath: string;
  state: RunLifecycleState;
  output: Array<{
    stream: "stdout" | "stderr";
    chunk: string;
    timestamp: string;
  }>;
  startedAt?: string;
  endedAt?: string;
  errorMessage?: string;
  exitCode?: number | null;
};

type Runs = Record<RunId, CurrentRun>;

type UseRunsResult = {
  startScript: (input: StartScriptRunRequest) => Promise<void>;
  cancelRun: (input: CancelRunRequest) => Promise<CancelRunResponse>;
  clearRuns: () => Promise<void>;
  runs: Runs | null;
  isRunActive: (run: CurrentRun) => boolean;
  activeRuns: Runs;
};

export const useRuns = (): UseRunsResult => {
  const [runs, setRuns] = useState<Runs | null>(null);

  useEffect(() => {
    return onEvent((event: RunEvent) => {
      setRuns((currentRuns) => {
        const existingRuns = currentRuns ?? {};
        const run = existingRuns[event.runId];
        switch (event.type) {
          case "run:started":
            return {
              ...existingRuns,
              [event.runId]: {
                runId: event.runId,
                workspacePath: event.workspacePath,
                scriptName: event.scriptName,
                state: "starting",
                output: [],
                startedAt: event.timestamp,
              },
            };
          case "run:state-changed":
            if (!run) return existingRuns;
            return {
              ...existingRuns,
              [event.runId]: {
                ...run,
                state: event.state,
              },
            };
          case "run:stdout":
          case "run:stderr":
            if (!run) return existingRuns;
            return {
              ...existingRuns,
              [event.runId]: {
                ...run,
                output: [
                  ...run.output,
                  {
                    stream: event.type === "run:stdout" ? "stdout" : "stderr",
                    chunk: event.chunk,
                    timestamp: event.timestamp,
                  },
                ],
              },
            };
          case "run:completed":
            if (!run) return existingRuns;
            return {
              ...existingRuns,
              [event.runId]: {
                ...run,
                state: "completed",
                exitCode: event.exitCode,
                endedAt: event.timestamp,
              },
            };
          case "run:failed":
            if (!run) return existingRuns;
            return {
              ...existingRuns,
              [event.runId]: {
                ...run,
                state: "failed",
                errorMessage: event.errorMessage,
                exitCode: event.exitCode,
                endedAt: event.timestamp,
              },
            };
          case "run:cancelled":
            if (!run) return existingRuns;
            return {
              ...existingRuns,
              [event.runId]: {
                ...run,
                state: "cancelled",
                endedAt: event.timestamp,
              },
            };
        }
      });
    });
  }, []);

  const startScript = async (input: StartScriptRunRequest): Promise<void> => {
    const result = await startScriptRun(input);
    setRuns((currentRuns) => {
      const existingRuns = currentRuns ?? {};
      if (existingRuns[result.runId]) return existingRuns;
      return {
        ...existingRuns,
        [result.runId]: { ...result, state: "starting", output: [] },
      };
    });
  };

  const cancelRun = async (
    input: CancelRunRequest,
  ): Promise<CancelRunResponse> => cancel(input);

  const isRunActive = (run: CurrentRun): boolean =>
    run.state === "starting" || run.state === "running";

  const activeRuns = Object.values(runs || {})
    .filter(isRunActive)
    .reduce((obj, run) => {
      obj[run.runId] = run;
      return obj;
    }, {} as Runs);

  const clearRuns = async (): Promise<void> => {
    const activeRunIds = Object.keys(activeRuns) as RunId[];
    const runsToCancel = activeRunIds.map((runId) => cancelRun({ runId }));
    await Promise.all(runsToCancel);
    setRuns(null);
  };

  return {
    startScript,
    cancelRun,
    clearRuns,
    runs,
    isRunActive,
    activeRuns,
  };
};
