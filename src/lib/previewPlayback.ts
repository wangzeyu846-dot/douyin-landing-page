// One playback lease for all second/third-section previews, including pending play() calls.
let active: { video: HTMLVideoElement; revoke: () => void } | null = null;
const listeners = new Set<(previewActive: boolean) => void>();
export function hasPreviewPlayback() { return active !== null; }
export function subscribePreviewPlayback(listener: (previewActive: boolean) => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
function broadcast() { listeners.forEach(listener => listener(active !== null)); }
export function isPreviewCurrent(video: HTMLVideoElement) { return active?.video === video; }
export function stopPreview(video: HTMLVideoElement) {
  if (active?.video !== video) return;
  const previous = active; active = null;
  previous.video.pause();
  try { previous.video.currentTime = 0; } catch { /* No seek range before metadata. */ }
  previous.revoke();
  broadcast();
}
export async function playPreview(video: HTMLVideoElement, revoke: () => void) {
  if (active) stopPreview(active.video);
  const lease = { video, revoke }; active = lease;
  broadcast();
  try {
    await video.play();
    if (active !== lease) { if (active?.video !== video) video.pause(); return false; }
    return true;
  } catch { if (active === lease) stopPreview(video); return false; }
}
