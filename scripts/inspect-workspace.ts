import { inspectWorkspace } from "../src/main/services/workspaceService";

try {
  const path = process.argv[2] ?? process.cwd();
  inspectWorkspace({ path }).then((result) => {
    console.dir(result, { depth: null });
  });
} catch (error) {
  console.error(error);
}
