export type DesktopAPI = {
  workspaces: {
    pick(): Promise<string | null>;
  };
};
