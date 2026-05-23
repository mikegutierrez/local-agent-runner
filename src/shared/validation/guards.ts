type ValueGuard<T> = (value: unknown) => value is T;

export const isPlainObject = (
  value: unknown,
): value is Record<string, unknown> => {
  if (typeof value !== "object" || value === null) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

export const isRecordOf = <T>(
  value: unknown,
  isValue: ValueGuard<T>,
): value is Record<string, T> => {
  return (
    isPlainObject(value) &&
    Object.values(value).every((entry) => isValue(entry))
  );
};

export const isString = (value: unknown): value is string =>
  typeof value === "string";
