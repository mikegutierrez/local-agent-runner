import { app } from "electron";
import fs from "node:fs";
import path from "node:path";
import { RunHistoryItem } from "../../shared/runs/types";
import { NodeFileError } from "../types/nodeErrors";
import { isRunHistoryItem } from "../../shared/runs/guards";

let historyWriteQueue: Promise<void> = Promise.resolve();

const getRunHistoryPath = () =>
  path.join(app.getPath("userData"), "run-history.json");

const writeRunHistory = async (items: RunHistoryItem[]): Promise<void> => {
  await fs.promises.writeFile(
    getRunHistoryPath(),
    JSON.stringify(items, null, 2),
  );
};

const enqueueHistoryWrite = async (
  write: () => Promise<void>,
): Promise<void> => {
  historyWriteQueue = historyWriteQueue.then(write, write);
  return historyWriteQueue;
};

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

  try {
    await enqueueHistoryWrite(async () => {
      const data = await readRunHistory();
      data.push(item);
      await writeRunHistory(data);
    });
    return true;
  } catch (error) {
    console.error("Append run history error.", error);
    return false;
  }
};

export const clearRunHistory = async (): Promise<boolean> => {
  try {
    await enqueueHistoryWrite(() => writeRunHistory([]));
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
