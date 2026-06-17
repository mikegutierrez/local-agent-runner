import { RunId } from "../../shared/runs/types";
import { cancelRun, startScriptRun } from "../processes/scriptRunManager";
import { StartScriptRunParams } from "../types/runs";

export const runsStartScript = ({
  request,
  emitEvent,
  appendRunHistory,
}: StartScriptRunParams) =>
  startScriptRun({ request, emitEvent, appendRunHistory });
export const runsCancel = (runId: RunId) => cancelRun(runId);
