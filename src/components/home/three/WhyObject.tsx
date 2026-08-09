import { useEffect, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Float, Lightformer, RoundedBox } from "@react-three/drei";

export type WhyObjectKind = "key" | "wheel" | "shield" | "certificate" | "engine";

export interface WhyObjectProps {
  kind: WhyObjectKind;
  active: boolean;
  quality: "high" | "low";
}

interface StageMaterials {
  silver: THREE.MeshPhysicalMaterial;
  chrome: THREE.MeshPhysicalMaterial;
  graphite: THREE.MeshStandardMaterial;
  paper: THREE.MeshStandardMaterial;
  accent: THREE.MeshStandardMaterial;
}

function useStageMaterials(quality: "high" | "low"): StageMaterials {
  const mats = useMemo<StageMaterials>(() => {
    // Fully metallic surfaces go near-black without an environment map, so in low
    // quality (no Environment) we soften metalness slightly to keep the sheen.
    const metal = quality === "high" ? 1 : 0.7;
    return {
      silver: new THREE.MeshPhysicalMaterial({
        color: "#c8cdd4",
        metalness: metal,
        roughness: 0.35,
        clearcoat: 0.5,
        clearcoatRoughness: 0.3,
      }),
      chrome: new THREE.MeshPhysicalMaterial({
        color: "#e9edf2",
        metalness: metal,
        roughness: 0.12,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
      }),
      graphite: new THREE.MeshStandardMaterial({
        color: "#002c5f",
        metalness: quality === "high" ? 0.75 : 0.45,
        roughness: 0.3,
      }),
      paper: new THREE.MeshStandardMaterial({ color: "#e4e6ea", metalness: 0.15, roughness: 0.55 }),
      accent: new THREE.MeshStandardMaterial({
        color: "#001e42",
        emissive: "#002c5f",
        emissiveIntensity: 2.2,
        metalness: 0.3,
        roughness: 0.3,
      }),
    };
  }, [quality]);

  return mats;
}

/** Continuous slow Y rotation + pointer-follow tilt, all damped (no snapping). */
function Rotator({ children }: { children: ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const sway = useRef({ x: 0, y: 0 });
  const timeAcc = useRef(0);

  useFrame((state, delta) => {
    // Own accumulated clock: fiber resets clock.elapsedTime whenever Scene3D toggles
    // the frameloop on scroll, which would snap the rotation back to its t=0 pose.
    timeAcc.current += Math.min(delta, 0.1);
    const t = timeAcc.current;
    sway.current.y = THREE.MathUtils.damp(sway.current.y, state.pointer.x * 0.45, 4, delta);
    sway.current.x = THREE.MathUtils.damp(sway.current.x, -state.pointer.y * 0.3, 4, delta);
    const g = group.current;
    if (g) {
      g.rotation.y = t * 0.4 + sway.current.y;
      g.rotation.x = sway.current.x;
    }
  });

  return <group ref={group}>{children}</group>;
}

/** Modern car key fob: rounded body, emissive buttons, chrome ring loop and blade. */
function KeyFob({ mats }: { mats: StageMaterials }) {
  return (
    <group position={[0, -0.12, 0]} scale={1.05}>
      <RoundedBox args={[0.85, 1.3, 0.26]} radius={0.12} smoothness={4} material={mats.graphite} />
      <RoundedBox
        args={[0.66, 1.06, 0.08]}
        radius={0.09}
        smoothness={4}
        position={[0, 0, 0.11]}
        material={mats.silver}
      />
      <mesh position={[0, 0.18, 0.17]} rotation={[Math.PI / 2, 0, 0]} material={mats.accent}>
        <cylinderGeometry args={[0.055, 0.055, 0.035, 20]} />
      </mesh>
      <mesh position={[0, -0.06, 0.17]} rotation={[Math.PI / 2, 0, 0]} material={mats.accent}>
        <cylinderGeometry args={[0.055, 0.055, 0.035, 20]} />
      </mesh>
      <mesh position={[0, -0.32, 0.17]} rotation={[Math.PI / 2, 0, 0]} material={mats.chrome}>
        <cylinderGeometry args={[0.07, 0.07, 0.035, 20]} />
      </mesh>
      <mesh position={[0, 0.76, 0]} material={mats.silver}>
        <boxGeometry args={[0.1, 0.3, 0.05]} />
      </mesh>
      <mesh position={[0, 0.98, 0]} material={mats.chrome}>
        <torusGeometry args={[0.15, 0.035, 12, 32]} />
      </mesh>
    </group>
  );
}

/** Sporty steering wheel: torus rim, three tapered spokes, hub with emissive logo dot. */
function Wheel({ mats }: { mats: StageMaterials }) {
  const spokes = useMemo(() => {
    const angles = [0, Math.PI, -Math.PI / 2];
    return angles.map((a) => ({
      position: [Math.cos(a) * 0.47, Math.sin(a) * 0.47, 0] as [number, number, number],
      rotation: [0, 0, a + Math.PI / 2] as [number, number, number],
    }));
  }, []);

  return (
    <group scale={0.88}>
      <mesh material={mats.graphite}>
        <torusGeometry args={[1, 0.1, 18, 48]} />
      </mesh>
      {spokes.map((s, i) => (
        <mesh key={i} position={s.position} rotation={s.rotation} material={mats.silver}>
          <cylinderGeometry args={[0.11, 0.05, 0.86, 10]} />
        </mesh>
      ))}
      <mesh rotation={[Math.PI / 2, 0, 0]} material={mats.graphite}>
        <cylinderGeometry args={[0.3, 0.34, 0.14, 28]} />
      </mesh>
      <mesh position={[0, 0, 0.08]} material={mats.chrome}>
        <torusGeometry args={[0.26, 0.02, 10, 32]} />
      </mesh>
      <mesh position={[0, 0, 0.09]} rotation={[Math.PI / 2, 0, 0]} material={mats.accent}>
        <cylinderGeometry args={[0.055, 0.055, 0.02, 20]} />
      </mesh>
    </group>
  );
}

/** Heater shield: beveled extruded silhouette, graphite face plate, emissive diamond emblem. */
function Shield({ mats }: { mats: StageMaterials }) {
  const geos = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, -0.98);
    shape.bezierCurveTo(0.6, -0.55, 0.85, -0.1, 0.78, 0.62);
    shape.quadraticCurveTo(0.4, 0.52, 0, 0.56);
    shape.quadraticCurveTo(-0.4, 0.52, -0.78, 0.62);
    shape.bezierCurveTo(-0.85, -0.1, -0.6, -0.55, 0, -0.98);
    const outer = new THREE.ExtrudeGeometry(shape, {
      depth: 0.12,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 3,
      curveSegments: 24,
    });
    outer.center();
    const inner = new THREE.ExtrudeGeometry(shape, {
      depth: 0.05,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 2,
      curveSegments: 24,
    });
    inner.center();
    return { outer, inner };
  }, []);

  return (
    <group position={[0, 0.08, 0]} scale={1.02}>
      <mesh geometry={geos.outer} material={mats.silver} />
      <mesh
        geometry={geos.inner}
        material={mats.graphite}
        scale={[0.8, 0.8, 1]}
        position={[0, 0, 0.12]}
      />
      <mesh position={[0, 0.02, 0.24]} scale={[0.55, 1, 0.5]} material={mats.accent}>
        <octahedronGeometry args={[0.3, 0]} />
      </mesh>
    </group>
  );
}

/** Rolled certificate scroll: paper roll, end caps, silver ribbon, seal with emissive rim. */
function Certificate({ mats }: { mats: StageMaterials }) {
  return (
    <group rotation={[0.25, 0, -0.5]} position={[0, 0.05, 0]}>
      <mesh rotation={[0, 0, Math.PI / 2]} material={mats.paper}>
        <cylinderGeometry args={[0.21, 0.21, 1.55, 24]} />
      </mesh>
      <mesh position={[0.78, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={mats.paper}>
        <cylinderGeometry args={[0.26, 0.26, 0.16, 24]} />
      </mesh>
      <mesh position={[-0.78, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={mats.paper}>
        <cylinderGeometry args={[0.26, 0.26, 0.16, 24]} />
      </mesh>
      <mesh position={[0.14, 0, 0]} rotation={[0, Math.PI / 2, 0]} material={mats.silver}>
        <torusGeometry args={[0.235, 0.045, 12, 32]} />
      </mesh>
      <mesh position={[0.14, -0.1, 0.26]} rotation={[Math.PI / 2, 0, 0]} material={mats.graphite}>
        <cylinderGeometry args={[0.13, 0.13, 0.06, 24]} />
      </mesh>
      <mesh position={[0.14, -0.1, 0.29]} material={mats.accent}>
        <torusGeometry args={[0.12, 0.018, 10, 28]} />
      </mesh>
    </group>
  );
}

/** Compact V-block engine: graphite block, two angled piston banks, intake arcs, valley glow. */
function Engine({ mats }: { mats: StageMaterials }) {
  const pistonsX = [-0.38, 0, 0.38];
  return (
    <group position={[0, -0.28, 0]}>
      <mesh material={mats.graphite}>
        <boxGeometry args={[1.35, 0.55, 0.95]} />
      </mesh>
      <mesh position={[0.74, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={mats.chrome}>
        <cylinderGeometry args={[0.2, 0.2, 0.09, 24]} />
      </mesh>
      {[1, -1].map((side) => (
        <group key={side} position={[0, 0.24, side * 0.16]} rotation={[side * 0.5, 0, 0]}>
          {pistonsX.map((x) => (
            <mesh key={x} position={[x, 0.24, 0]} material={mats.silver}>
              <cylinderGeometry args={[0.13, 0.15, 0.48, 18]} />
            </mesh>
          ))}
          <mesh position={[0, 0.52, 0]} material={mats.graphite}>
            <boxGeometry args={[1.25, 0.1, 0.36]} />
          </mesh>
        </group>
      ))}
      {[-0.3, 0.3].map((x) => (
        <mesh
          key={x}
          position={[x, 0.62, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          material={mats.silver}
        >
          <torusGeometry args={[0.3, 0.05, 10, 24, Math.PI]} />
        </mesh>
      ))}
      <mesh position={[0, 0.4, 0]} material={mats.accent}>
        <boxGeometry args={[1.2, 0.4, 0.06]} />
      </mesh>
    </group>
  );
}

/** A few slow-drifting dust motes behind the object; count drops in low quality. */
function Dust({ quality }: { quality: "high" | "low" }) {
  const points = useRef<THREE.Points>(null);
  const count = quality === "high" ? 70 : 20;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 3.6;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 2.6 + 0.2;
      arr[i * 3 + 2] = -0.6 - Math.random() * 1.6;
    }
    return arr;
  }, [count]);

  const timeAcc = useRef(0);
  useFrame((_state, delta) => {
    timeAcc.current += Math.min(delta, 0.1);
    if (points.current) {
      points.current.position.y = Math.sin(timeAcc.current * 0.3) * 0.08;
    }
  });

  return (
    <points ref={points} key={count}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#bcd3e6"
        transparent
        opacity={0.35}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

function StageContent({ kind, quality }: { kind: WhyObjectKind; quality: "high" | "low" }) {
  const mats = useStageMaterials(quality);
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} />
      <directionalLight position={[-4, 1.5, 2]} intensity={0.5} color="#cfd8e3" />
      <directionalLight position={[-2, 3, -4]} intensity={1.1} color="#bfe2ff" />
      {quality === "high" && (
        <Environment resolution={256} frames={1}>
          <Lightformer
            intensity={2.5}
            position={[0, 4, 2]}
            rotation={[-Math.PI / 2, 0, 0]}
            scale={[7, 4, 1]}
          />
          <Lightformer
            intensity={1.6}
            position={[-5, 1, 1]}
            rotation={[0, Math.PI / 2, 0]}
            scale={[5, 1.4, 1]}
            color="#e3ebf4"
          />
          <Lightformer
            intensity={1.1}
            position={[5, 0.5, -1]}
            rotation={[0, -Math.PI / 2, 0]}
            scale={[5, 1.6, 1]}
            color="#9fb6c9"
          />
        </Environment>
      )}
      <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.6}>
        <Rotator>
          {kind === "key" && <KeyFob mats={mats} />}
          {kind === "wheel" && <Wheel mats={mats} />}
          {kind === "shield" && <Shield mats={mats} />}
          {kind === "certificate" && <Certificate mats={mats} />}
          {kind === "engine" && <Engine mats={mats} />}
        </Rotator>
      </Float>
      <Dust quality={quality} />
      <ContactShadows
        position={[0, -1.3, 0]}
        opacity={0.4}
        scale={4.5}
        blur={2.6}
        far={2}
        resolution={quality === "high" ? 256 : 128}
        color="#000000"
      />
    </>
  );
}

/**
 * Small 3D object stage for the "Why Choose Us" grid. Self-contained (no asset
 * loading), transparent background, pausable via `active`, quality-scalable.
 */
export default function WhyObject({ kind, active, quality }: WhyObjectProps) {
  return (
    <Canvas
      style={{ position: "absolute", inset: 0 }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      dpr={quality === "high" ? [1, 1.75] : [1, 1]}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0.3, 4.5], fov: 35 }}
    >
      <StageContent kind={kind} quality={quality} />
    </Canvas>
  );
}
