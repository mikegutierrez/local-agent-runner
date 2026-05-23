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
  MetadataStatus,
} from "../../shared/workspaces/types";

type NodeFileError = Error & { code?: string };

const parsePackageScripts = (value: unknown): PackageScriptsEnvelope => {
  if (value === undefined) return { status: MetadataStatus.MISSING };
  if (!isRecordOf(value, isString))
    return {
      status: MetadataStatus.INVALID,
      error: "package.json scripts must be an object with string values.",
    };
  return {
    status: MetadataStatus.OK,
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
      status: isMissing ? MetadataStatus.MISSING : MetadataStatus.INVALID,
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
      status: MetadataStatus.INVALID,
      error: "package.json contains invalid JSON.",
    };
  }
  if (!isPlainObject(parsed)) {
    return {
      status: MetadataStatus.INVALID,
      error: "package.json must contain a JSON object.",
    };
  }

  const scripts = parsePackageScripts(parsed.scripts);

  return {
    status: MetadataStatus.OK,
    data: {
      ...(isString(parsed.name) && { name: parsed.name }),
      ...(isString(parsed.version) && { version: parsed.version }),
      ...(isString(parsed.description) && { description: parsed.description }),
      scripts,
    },
  };
};
