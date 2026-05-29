export const notImplemented = (methodName: string): never => {
  throw new Error(`${methodName} is not implemented yet`);
};
