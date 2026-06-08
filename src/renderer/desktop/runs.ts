import {
  StartScriptRunRequest,
  CancelRunRequest,
  RunEvent,
} from "../../shared/runs/types";

export const startScript = async (input: StartScriptRunRequest) =>
  window.desktop.runs.startScript(input);
export const cancel = async (input: CancelRunRequest) =>
  window.desktop.runs.cancel(input);
export const onEvent = (listener: (event: RunEvent) => void) =>
  window.desktop.runs.onEvent(listener);
