import { IMAGES } from "@/assets/images.gen";

/**
 * Serves AVIF, then WebP, then JPEG, at the narrowest width that fits the layout.
 *
 * Always emits intrinsic width/height so the browser reserves space before the bytes
 * arrive, which is what keeps Cumulative Layout Shift at zero. Pass `priority` for the
 * LCP image on a page: it disables lazy loading and asks the browser to fetch early.
 */
export function ResponsiveImage({
  name,
  alt,
  className,
  sizes = "100vw",
  priority = false,
  aspect,
}: {
  /** Base filename without extension, e.g. "hero-truck". */
  name: string;
  alt: string;
  className?: string;
  /** CSS `sizes` describing the rendered width at each breakpoint. */
  sizes?: string;
  priority?: boolean;
  /** Override the intrinsic ratio when the image is cropped by object-fit. */
  aspect?: { width: number; height: number };
}) {
  const asset = IMAGES[name];

  if (!asset) {
    // Fail visibly in development, silently in production, rather than rendering a
    // broken <img> with an empty src.
    if (import.meta.env.DEV) console.warn(`ResponsiveImage: no generated asset for "${name}"`);
    return null;
  }

  const srcset = (kind: "avif" | "webp" | "jpg") =>
    asset.variants.map((v) => `${v[kind]} ${v.w}w`).join(", ");

  const fallback = asset.variants[asset.variants.length - 1];
  const width = aspect?.width ?? asset.width;
  const height = aspect?.height ?? asset.height;

  return (
    <picture>
      <source type="image/avif" srcSet={srcset("avif")} sizes={sizes} />
      <source type="image/webp" srcSet={srcset("webp")} sizes={sizes} />
      <img
        src={fallback.jpg}
        srcSet={srcset("jpg")}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding={priority ? "sync" : "async"}
        className={className}
      />
    </picture>
  );
}

/**
 * Maps an imported asset URL back to its manifest key, for data that stores raw imports.
 *
 * Matches against known keys rather than parsing the filename: build hashes and hyphenated
 * names ("car-mustang-a1b2c3.jpg") cannot be told apart by pattern alone, and a greedy
 * pattern silently returns the wrong key. Longest match wins so "car-explorer" is never
 * shadowed by a hypothetical "car".
 */
const IMAGE_KEYS = Object.keys(IMAGES).sort((a, b) => b.length - a.length);

export function imageNameFromSrc(src: string): string | undefined {
  const file = src.split("/").pop() ?? "";
  return IMAGE_KEYS.find((key) => file.startsWith(key));
}
