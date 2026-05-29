import { runsStartScript } from "../src/main/services/runsService";
import { EmitRunEvent } from "../src/shared/runs/types";

export const startScriptRunFromCliArgs = (emitEvent: EmitRunEvent) => {
  const workspacePath = process.argv[2];
  const scriptName = process.argv[3];

  if (!workspacePath || !scriptName) {
    console.error(
      "Usage: npm run runs:start -- /path/to/workspace script-name",
    );
    process.exitCode = 1;
    return;
  }

  runsStartScript({ request: { workspacePath, scriptName }, emitEvent });
};
