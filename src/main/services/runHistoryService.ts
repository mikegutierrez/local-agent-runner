import { app } from "electron";
import fs from "node:fs";
import path from "node:path";
import { RunHistoryItem } from "../../shared/runs/types";
import { NodeFileError } from "../types/nodeErrors";
import { isRunHistoryItem } from "../../shared/runs/guards";

const getRunHistoryPath = () =>
  path.join(app.getPath("userData"), "run-history.json");

export const readRunHistory = async (): Promise<RunHistoryItem[]> => {
  const runHistoryPath = getRunHistoryPath();

  let raw: string;
  try {
    raw = await fs.promises.readFile(runHistoryPath, { encoding: "utf-8" });
  } catch (error) {
    const readError = error as NodeFileError;
    if (readError.code === "ENOENT") {
      return [];
    }
    console.error("Read run history error.", error);
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    console.error("Run history parse error", error);
    return [];
  }

  if (!Array.isArray(parsed)) return [];

  return parsed.filter(isRunHistoryItem);
};

export const appendRunHistory = async (
  item: RunHistoryItem,
): Promise<boolean> => {
  if (!isRunHistoryItem(item)) return false;

  const runHistoryPath = getRunHistoryPath();

  try {
    const data = await readRunHistory();
    data.push(item);
    await fs.promises.writeFile(runHistoryPath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error("Append run history error.", error);
    return false;
  }
};

export const clearRunHistory = async (): Promise<boolean> => {
  const runHistoryPath = getRunHistoryPath();

  try {
    await fs.promises.writeFile(runHistoryPath, JSON.stringify([], null, 2));
    return true;
  } catch (error) {
    const clearError = error as NodeFileError;
    if (clearError.code === "ENOENT") {
      return false;
    }
    console.error("Clear run history error.", error);
    return false;
  }
};
