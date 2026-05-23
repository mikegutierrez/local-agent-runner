function notImplemented(methodName: string): never {
  throw new Error(`${methodName} is not implemented yet`);
}

export const runsStartScript = () => notImplemented("runsStartScript");
export const runsCancel = () => notImplemented("runsCancel");
