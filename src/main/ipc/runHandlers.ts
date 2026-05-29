import {
  CancelRunRequest,
  StartScriptRunParams,
} from "../../shared/runs/types";
import { runsStartScript, runsCancel } from "../services/runsService";

export const handleStartScriptRun = ({
  request,
  emitEvent,
}: StartScriptRunParams) => runsStartScript({ request, emitEvent });
export const handleCancelRun = (request: CancelRunRequest) =>
  runsCancel(request.runId);
