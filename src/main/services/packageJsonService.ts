import path from "node:path";
import fs from "node:fs";

import {
  isRecordOf,
  isString,
  isPlainObject,
} from "../../shared/validation/guards";
import {
  InspectWorkspaceRequest,
  PackageJsonEnvelope,
  PackageScriptsEnvelope,
  InspectionStatus,
} from "../../shared/workspaces/types";

type NodeFileError = Error & { code?: string };

const parsePackageScripts = (value: unknown): PackageScriptsEnvelope => {
  if (value === undefined) return { status: InspectionStatus.MISSING };
  if (!isRecordOf(value, isString))
    return {
      status: InspectionStatus.INVALID,
      error: "package.json scripts must be an object with string values.",
    };
  return {
    status: InspectionStatus.OK,
    data: value,
  };
};

export const parsePackageJson = async ({
  path: filePath,
}: InspectWorkspaceRequest): Promise<PackageJsonEnvelope> => {
  const packageJsonPath = path.join(filePath, "package.json");

  let raw: string;
  try {
    raw = await fs.promises.readFile(packageJsonPath, {
      encoding: "utf-8",
    });
  } catch (error) {
    const readError = error as NodeFileError;
    const isMissing = readError?.code === "ENOENT";
    return {
      status: isMissing ? InspectionStatus.MISSING : InspectionStatus.INVALID,
      error: isMissing
        ? "No package.json found in this workspace."
        : "Unable to read package.json.",
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      status: InspectionStatus.INVALID,
      error: "package.json contains invalid JSON.",
    };
  }
  if (!isPlainObject(parsed)) {
    return {
      status: InspectionStatus.INVALID,
      error: "package.json must contain a JSON object.",
    };
  }

  const scripts = parsePackageScripts(parsed.scripts);

  return {
    status: InspectionStatus.OK,
    data: {
      ...(isString(parsed.name) && { name: parsed.name }),
      ...(isString(parsed.version) && { version: parsed.version }),
      ...(isString(parsed.description) && { description: parsed.description }),
      scripts,
    },
  };
};
