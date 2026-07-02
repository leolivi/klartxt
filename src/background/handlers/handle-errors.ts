export function isSidePanelClosedError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.includes("Could not establish connection") || error.message.includes("The message port closed"))
  );
}
