import { RunId, StartScriptRunParams } from "../../shared/runs/types";
import { cancelRun, startScriptRun } from "../processes/scriptRunManager";

export const runsStartScript = ({ request, emitEvent }: StartScriptRunParams) =>
  startScriptRun({ request, emitEvent });
export const runsCancel = (runId: RunId) => cancelRun(runId);
