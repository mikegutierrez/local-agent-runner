import { runsStartScript, runsCancel } from "../services/runsService";

export const runsStartScriptHandler = () => runsStartScript();
export const runsCancelHandler = () => runsCancel();
