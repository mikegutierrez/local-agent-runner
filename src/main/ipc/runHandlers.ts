import { runsStartScript, runsCancel } from "../services/runsService";

export const handleStartScriptRun = () => runsStartScript();
export const handleCancelRun = () => runsCancel();
