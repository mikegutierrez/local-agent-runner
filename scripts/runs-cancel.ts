import { runsCancel } from "../src/main/services/runsService";
import { RunEvent, RunId } from "../src/shared/runs/types";
import { startScriptRunFromCliArgs } from "./runs-test-helpers";

async function main() {
  let runId: RunId | undefined;
  const emitEvent = (event: RunEvent) => {
    runId = event.runId as RunId;
    console.dir(event, { depth: null });
  };
  startScriptRunFromCliArgs(emitEvent);

  setTimeout(() => {
    if (runId) {
      const result = runsCancel(runId);
      console.dir(result, { depth: null });
    }
  }, 1000);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
