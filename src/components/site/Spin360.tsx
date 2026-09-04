import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { MoveHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { spinFrameUrl, type SpinManifest } from "@/lib/spin360";

/**
 * 360 spin viewer for the vehicle page.
 *
 * Frames are AI-generated turntable renders, not photographs of the physical unit,
 * which is why the viewer carries a permanent disclosure chip. The real photo
 * (v.image) remains the og:image and the Car JSON-LD image — this component never
 * changes what the page claims to be a photograph.
 *
 * Rendering is N stacked <img> elements toggled by `visibility`, not a single <img>
 * whose src is swapped: a src swap can paint-decode-flash on Safari even for cached
 * bytes. Frames stay in the tree as plain HTMLImageElements so the browser can evict
 * and cheaply re-decode them; ImageBitmap would pin ~50-100MB of decoded 1280x800
 * bitmaps and OOM low-end iOS.
 */

const ROTATIONS_PER_WIDTH = 1.5;
const PX_PER_FRAME_MIN = 8;
const PX_PER_FRAME_MAX = 48;
/**
 * Rightward drag should move the car's visible face rightward, so it reads as
 * "the car follows your hand". Which sign achieves that depends on how the image
 * model actually interpreted "rotated N degrees clockwise", which is not reliable.
 * Verify against real frames and flip THIS ONE CONSTANT if the car fights the hand.
 */
const DRAG_DIRECTION: 1 | -1 = -1;

type SpinSnapshot = { status: "loading" | "ready" | "error"; loaded: number; total: number };
type SpinLoad = {
  /** Replaced immutably on every change — useSyncExternalStore compares by identity. */
  snapshot: SpinSnapshot;
  images: HTMLImageElement[];
  listeners: Set<() => void>;
};

/** Module-level so a hover on the toggle can start the download before mount. */
const loads = new Map<string, SpinLoad>();

function loadFrame(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      // decode() rejects with EncodingError when the browser evicts decoded data,
      // even though the image itself loaded fine. Resolve either way.
      img.decode().then(
        () => resolve(img),
        () => resolve(img),
      );
    };
    img.onerror = () => reject(new Error(`360 frame failed: ${url}`));
    img.src = url;
  });
}

/** Idempotent while an entry exists. Safe to call from event handlers and lazy ref init. */
export function preloadSpin(vehicleId: string, m: SpinManifest): SpinLoad {
  const key = `${vehicleId}:${m.rev}`;
  const existing = loads.get(key);
  if (existing) return existing;

  const total = m.frames;
  const load: SpinLoad = {
    snapshot: { status: "loading", loaded: 0, total },
    images: new Array(total),
    listeners: new Set(),
  };
  loads.set(key, load);

  const set = (patch: Partial<SpinSnapshot>) => {
    load.snapshot = { ...load.snapshot, ...patch };
    load.listeners.forEach((cb) => cb());
  };
  const url = (i: number) => spinFrameUrl(vehicleId, m, i);
  const one = async (i: number) => {
    try {
      load.images[i] = await loadFrame(url(i));
    } catch {
      load.images[i] = await loadFrame(url(i)); // one retry; a second failure propagates
    }
    set({ loaded: load.snapshot.loaded + 1 });
  };

  void (async () => {
    try {
      await one(0); // frame 0 alone first — it is the sequence's own poster
      // Neighbour-priority [1, n-1, 2, n-2, ...] so an early drag in EITHER
      // direction from frame 0 lands on an already-decoded frame.
      const order: number[] = [];
      for (let d = 1; d <= Math.floor(total / 2); d++) {
        order.push(d);
        if (d !== total - d) order.push(total - d);
      }
      let next = 0;
      // 4 workers: caps concurrent decodes so the hero's scroll parallax on the
      // same view does not jank while frames land.
      await Promise.all(
        Array.from({ length: Math.min(4, order.length) }, async () => {
          while (next < order.length) {
            const i = order[next++];
            await one(i);
          }
        }),
      );
      set({ status: "ready" });
    } catch {
      loads.delete(key); // a future mount retries fresh...
      set({ status: "error" }); // ...while current subscribers see the terminal state
    }
  })();

  return load;
}

export type Spin360Props = {
  vehicleId: string;
  /** Caller has already null-checked getSpin(v.id). */
  manifest: SpinManifest;
  /** The real photo — already decoded by the branch we just replaced, so it paints instantly. */
  poster: string;
  label: string;
  /** The page passes photo-mode's own height classes, so the two can never drift apart. */
  className?: string;
  /** Fires once on terminal load failure; the page reverts to photo and hides the toggle. */
  onUnavailable?: () => void;
};

export function Spin360({
  vehicleId,
  manifest,
  poster,
  label,
  className,
  onUnavailable,
}: Spin360Props) {
  const total = manifest.frames;

  // Lazy ref init gives exactly one SpinLoad per mount. Calling preloadSpin bare in
  // render would restart forever after an error, because the error path deletes the
  // Map entry that makes it idempotent.
  const loadRef = useRef<SpinLoad | null>(null);
  if (loadRef.current === null) loadRef.current = preloadSpin(vehicleId, manifest);
  const load = loadRef.current;

  const snap = useSyncExternalStore(
    (cb) => {
      load.listeners.add(cb);
      return () => load.listeners.delete(cb);
    },
    () => load.snapshot,
    () => load.snapshot,
  );
  const ready = snap.status === "ready";

  const [frame, setFrame] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [hintDismissed, setHintDismissed] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const firedRef = useRef(false);
  const dragRef = useRef({ pointerId: null as number | null, lastX: 0, acc: 0, pxPerFrame: 24 });

  useEffect(() => {
    if (snap.status === "error" && !firedRef.current) {
      firedRef.current = true;
      onUnavailable?.();
    }
  }, [snap.status, onUnavailable]);

  const wrap = (i: number) => ((i % total) + total) % total;
  const step = (delta: number) => setFrame((f) => wrap(f + delta));

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!ready || dragRef.current.pointerId !== null) return; // ignore a second finger
    const el = rootRef.current;
    if (!el) return;
    dragRef.current = {
      pointerId: e.pointerId,
      lastX: e.clientX,
      acc: 0,
      // One edge-to-edge drag is ~1.5 turns. Measured once per drag, no ResizeObserver.
      pxPerFrame: Math.min(
        PX_PER_FRAME_MAX,
        Math.max(PX_PER_FRAME_MIN, el.clientWidth / (total * ROTATIONS_PER_WIDTH)),
      ),
    };
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      /* drag still works while the pointer stays inside the box */
    }
    setDragging(true);
    setHintDismissed(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (d.pointerId !== e.pointerId) return;
    d.acc += e.clientX - d.lastX;
    d.lastX = e.clientX;
    const steps = Math.trunc(d.acc / d.pxPerFrame);
    if (steps !== 0) {
      d.acc -= steps * d.pxPerFrame; // carry the remainder so slow drags still accumulate
      step(DRAG_DIRECTION * steps);
    }
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current.pointerId !== e.pointerId) return;
    dragRef.current.pointerId = null;
    try {
      rootRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* iOS can throw when releasing after pointercancel */
    }
    setDragging(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!ready) return;
    const quarter = Math.max(1, Math.round(total / 4));
    let handled = true;
    switch (e.key) {
      case "ArrowRight":
      case "ArrowUp":
        step(1);
        break;
      case "ArrowLeft":
      case "ArrowDown":
        step(-1);
        break;
      case "PageUp":
        step(quarter);
        break;
      case "PageDown":
        step(-quarter);
        break;
      case "Home":
        setFrame(0);
        break;
      case "End":
        setFrame(total - 1);
        break;
      default:
        handled = false;
    }
    if (handled) {
      e.preventDefault();
      setHintDismissed(true);
    }
  };

  return (
    <div
      ref={rootRef}
      role="slider"
      tabIndex={ready ? 0 : -1}
      aria-label={`Rotate 360 degree view of ${label}`}
      aria-roledescription="360 degree viewer"
      aria-orientation="horizontal"
      aria-valuemin={0}
      aria-valuemax={total - 1}
      aria-valuenow={frame}
      aria-valuetext={`${Math.round((frame * 360) / total)} degrees`}
      aria-disabled={!ready}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={onKeyDown}
      onDragStart={(e) => e.preventDefault()}
      className={cn(
        // touch-pan-y: horizontal gestures rotate, vertical ones still scroll the page.
        "relative touch-pan-y select-none",
        // Inset ring: the card is overflow-hidden, so an offset ring would be clipped away.
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
        ready && (dragging ? "cursor-grabbing" : "cursor-grab"),
        className,
      )}
    >
      {ready ? (
        Array.from({ length: total }, (_, i) => (
          <img
            key={i}
            src={spinFrameUrl(vehicleId, manifest, i)}
            alt="" /* the slider root carries the accessible name */
            aria-hidden="true"
            draggable={false}
            width={manifest.width}
            height={manifest.height}
            className={cn(
              "pointer-events-none h-full w-full object-cover [-webkit-touch-callout:none]",
              i > 0 && "absolute inset-0", // frame 0 stays in flow and sizes the box
            )}
            style={{ visibility: i === frame ? "visible" : "hidden" }}
          />
        ))
      ) : (
        <img
          src={poster}
          alt=""
          draggable={false}
          width={manifest.width}
          height={manifest.height}
          className="pointer-events-none h-full w-full object-cover [-webkit-touch-callout:none]"
        />
      )}

      {snap.status === "loading" && (
        <span className="glass absolute bottom-16 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-semibold text-ink">
          Loading 360 view · {snap.loaded}/{total}
        </span>
      )}
      {snap.status === "error" && (
        <span className="glass absolute bottom-16 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-semibold text-ink">
          360 view unavailable
        </span>
      )}
      {ready && !hintDismissed && (
        <span className="glass spin360-hint absolute bottom-16 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-ink">
          <MoveHorizontal className="h-3.5 w-3.5" aria-hidden /> Drag to rotate
        </span>
      )}
      {ready && (
        <span className="glass absolute left-4 top-14 max-w-[calc(100%-2rem)] rounded-full px-3 py-1 text-[11px] font-medium text-muted-foreground sm:left-auto sm:right-4 sm:top-4">
          Illustrative 360 view, not photography of this unit
        </span>
      )}
    </div>
  );
}
