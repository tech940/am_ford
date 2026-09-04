// GENERATED FILE — do not edit by hand. Rebuilt by `bun run spin360:generate`
// (scripts/generate-360.mjs). Edits are lost on the next generation run.
//
// A vehicle appears here only when public/360/<id>/ holds a contiguous
// frame-00..frame-(N-1).webp run (N >= 8). An absent id means the vehicle page
// renders no 360 UI at all — identically on the server and the client, because
// this is a build-time module read and never a runtime probe.

export type SpinManifest = {
  /** Contiguous frame count starting at frame-00. */
  frames: number;
  /** Always 1280 — every frame is normalized to this by the generator. */
  width: number;
  /** Always 800 — matches the photo-mode hero img, so object-cover crops alike. */
  height: number;
  /**
   * First 8 hex of sha1 over all frame bytes in index order. A CONTENT hash, not
   * an mtime: git clone/checkout rewrites mtimes, which would churn this value on
   * every fresh machine and bust caches for no reason.
   */
  rev: string;
};

export const SPIN_360: Record<string, SpinManifest> = {};

export function getSpin(id: string): SpinManifest | undefined {
  return SPIN_360[id];
}

export function spinFrameUrl(id: string, m: SpinManifest, i: number): string {
  return `/360/${id}/frame-${String(i).padStart(2, "0")}.webp?v=${m.rev}`;
}
