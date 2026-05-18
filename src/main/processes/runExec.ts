import util from "node:util";
import child_process from "node:child_process";
const exec = util.promisify(child_process.exec);

type ExecOutput = {
  ok: boolean;
  stdout: string;
  stderr: string;
  exitCode?: number;
};

type ExecError = Error & {
  code?: number;
  stdout?: string;
  stderr?: string;
};

export const runExec = async ({
  command,
  path: filePath,
}: {
  path: string;
  command: string;
}): Promise<ExecOutput> => {
  try {
    const { stdout, stderr } = await exec(command, { cwd: filePath });
    return {
      ok: true,
      stdout,
      stderr,
    };
  } catch (error) {
    const execError = error as ExecError;
    return {
      ok: false,
      stdout: execError.stdout ?? "",
      stderr: execError.stderr ?? execError.message,
      exitCode: execError.code,
    };
  }
};
