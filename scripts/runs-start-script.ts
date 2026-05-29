import { RunEvent } from "../src/shared/runs/types";
import { startScriptRunFromCliArgs } from "./runs-test-helpers";

async function main() {
  const emitEvent = (event: RunEvent) => console.dir(event, { depth: null });
  startScriptRunFromCliArgs(emitEvent);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
