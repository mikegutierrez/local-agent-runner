export const classNames = (classes: Record<string, boolean>): string =>
  Object.entries(classes)
    .filter(([, enabled]) => enabled)
    .map(([className]) => className)
    .join(" ");
