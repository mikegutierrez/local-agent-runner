import {
  EmitRunEvent,
  RunHistoryItem,
  StartScriptRunRequest,
} from "../../shared/runs/types";

export type AppendRunHistory = (item: RunHistoryItem) => Promise<boolean>;

export type StartScriptRunParams = {
  request: StartScriptRunRequest;
  emitEvent: EmitRunEvent;
  appendRunHistory: AppendRunHistory;
};
