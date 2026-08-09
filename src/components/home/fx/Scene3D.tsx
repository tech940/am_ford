import React, { Component, Suspense, useEffect, useState } from "react";
import type { ErrorInfo, ReactNode } from "react";
import {
  useAllowWebGL,
  useMounted,
  useQualityTier,
  useSectionActive,
  type QualityTier,
} from "../hooks";

interface WebGLErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface WebGLErrorBoundaryState {
  hasError: boolean;
}

class WebGLErrorBoundary extends Component<WebGLErrorBoundaryProps, WebGLErrorBoundaryState> {
  constructor(props: WebGLErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): WebGLErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn("Scene3D WebGL rendering error captured:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}

/**
 * Wrapper every 3D canvas mounts through. It guarantees:
 *  - nothing WebGL touches the server render (mount gate),
 *  - the chunk only loads once the section approaches the viewport (lazy),
 *  - priority scenes (Hero) mount immediately on client without layout shift,
 *  - WebGL context/rendering crashes are safely caught by an Error Boundary,
 *  - the frame loop fully pauses when the section scrolls off screen.
 */
export function Scene3D({
  className,
  children,
  fallback,
  priority = false,
}: {
  className?: string;
  children: (active: boolean, quality: QualityTier) => ReactNode;
  fallback?: ReactNode;
  priority?: boolean;
}) {
  const mounted = useMounted();
  const quality = useQualityTier();
  const { allow: allowWebGL, reason: gateReason } = useAllowWebGL();
  const [ref, inView, active] = useSectionActive<HTMLDivElement>("400px");
  const [everNear, setEverNear] = useState(priority);

  useEffect(() => {
    if (inView || priority) setEverNear(true);
  }, [inView, priority]);

  // On phones, low-end hardware, Save-Data, or reduced-motion, the three.js chunk is never
  // requested at all and the fallback stands in permanently.
  const shouldRender = mounted && allowWebGL && (everNear || priority);

  // Why 3D is off, surfaced in the DOM. This used to fail completely silently, which meant a
  // blank panel on a capable desktop was indistinguishable from a deliberate mobile opt-out.
  // Inspect with: document.querySelector('[data-scene3d]').dataset.scene3d
  const reason = !mounted
    ? "pending-mount"
    : !allowWebGL
      ? `blocked: ${gateReason}`
      : !(everNear || priority)
        ? "not-yet-scrolled-near"
        : "on";

  return (
    <div ref={ref} className={className} data-scene3d={reason}>
      {shouldRender ? (
        <WebGLErrorBoundary fallback={fallback ?? null}>
          <Suspense fallback={fallback ?? null}>{children(active, quality)}</Suspense>
        </WebGLErrorBoundary>
      ) : (
        (fallback ?? null)
      )}
    </div>
  );
}
