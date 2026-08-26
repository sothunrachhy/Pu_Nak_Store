// A Server Action can fail in a way that has no useful message for the user.
// The common one: Next.js rotates action IDs on every build, so a tab opened
// before a deploy calls an ID the server no longer knows. Next.js redacts the
// real reason in production, leaving only React's minified "error #441" text -
// never worth showing to a shopkeeper.
//
// Such failures are returned as this sentinel so the UI can offer the one
// thing that actually recovers them: reloading the page.
export const ACTION_FAILED = "__action_failed__";

export async function runAction<T>(fn: () => Promise<T>): Promise<T | { error: string }> {
  try {
    return await fn();
  } catch (e) {
    // Keep the real error in the console for debugging; in dev the Next.js
    // overlay still surfaces it in full.
    console.error("Server action failed:", e);
    return { error: ACTION_FAILED };
  }
}
