import { inspectWorkspace } from "../src/main/services/workspaceService";

async function main() {
  const path = process.argv[2] ?? process.cwd();

  const result = await inspectWorkspace({ path });
  console.dir(result, { depth: null });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
