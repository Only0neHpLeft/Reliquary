export const GIT_HASH: string = __GIT_HASH__;
export const APP_TITLE = `Reliquary (${GIT_HASH})`;

export async function applyWindowTitle(): Promise<void> {
  document.title = APP_TITLE;
  try {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    await getCurrentWindow().setTitle(APP_TITLE);
  } catch {
    // Not running in Tauri (e.g. browser dev) — document.title is enough.
  }
}
