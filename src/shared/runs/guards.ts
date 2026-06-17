import {
  isPlainObject,
  isRunId,
  isString,
  isTerminalRunState,
} from "../validation/guards";
import { RunHistoryItem } from "./types";

export const isRunHistoryItem = (value: unknown): value is RunHistoryItem => {
  if (!isPlainObject(value)) return false;
  return (
    isRunId(value.runId) &&
    isString(value.workspacePath) &&
    isString(value.scriptName) &&
    isString(value.startedAt) &&
    isString(value.endedAt) &&
    isTerminalRunState(value.state) &&
    (value.exitCode === undefined ||
      value.exitCode === null ||
      typeof value.exitCode === "number") &&
    (value.errorMessage === undefined || isString(value.errorMessage))
  );
};
