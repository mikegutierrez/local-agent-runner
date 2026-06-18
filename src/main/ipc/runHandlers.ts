import { CancelRunRequest } from "../../shared/runs/types";
import { clearRunHistory, readRunHistory } from "../services/runHistoryService";
import { runsStartScript, runsCancel } from "../services/runsService";
import { StartScriptRunParams } from "../types/runs";

export const handleStartScriptRun = ({
  request,
  emitEvent,
  appendRunHistory,
}: StartScriptRunParams) =>
  runsStartScript({ request, emitEvent, appendRunHistory });
export const handleCancelRun = (request: CancelRunRequest) =>
  runsCancel(request.runId);
export const handleListHistory = () => readRunHistory();
export const handleClearHistory = () => clearRunHistory();
