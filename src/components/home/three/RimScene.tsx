import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, RoundedBox, Sparkles } from "@react-three/drei";

export interface RimSceneProps {
  /** Drives the frameloop — the parent pauses rendering when the section is off-screen. */
  active: boolean;
  /** "low" reduces particle counts, shadow resolution and disables the reflection environment. */
  quality: "high" | "low";
}

const SPOKE_COUNT = 7;
const HOLE_COUNT = 10;
const BASE_YAW = -0.52; // ~30 deg three-quarter presentation angle
const BASE_PITCH = 0.06;

function Wheel({ quality }: { quality: "high" | "low" }) {
  const floatRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Group>(null);
  const keyLightRef = useRef<THREE.DirectionalLight>(null);
  const pointerSmooth = useRef({ x: 0, y: 0 });

  const materials = useMemo(() => {
    const high = quality === "high";
    return {
      rubber: new THREE.MeshStandardMaterial({ color: "#131b26", roughness: 0.95, metalness: 0 }),
      sidewall: new THREE.MeshStandardMaterial({
        color: "#1a2536",
        roughness: 0.8,
        metalness: 0.05,
      }),
      alloy: new THREE.MeshPhysicalMaterial({
        color: "#dfe3e8",
        metalness: high ? 1 : 0.8,
        roughness: high ? 0.12 : 0.22,
        clearcoat: 1,
        clearcoatRoughness: 0.12,
      }),
      barrel: new THREE.MeshStandardMaterial({
        color: "#84898f",
        metalness: high ? 1 : 0.75,
        roughness: 0.3,
        side: THREE.DoubleSide,
      }),
      steel: new THREE.MeshStandardMaterial({ color: "#43474e", metalness: 0.85, roughness: 0.4 }),
      dark: new THREE.MeshStandardMaterial({ color: "#002c5f", metalness: 0.5, roughness: 0.4 }),
      caliper: new THREE.MeshStandardMaterial({
        color: "#002c5f",
        metalness: 0.6,
        roughness: 0.25,
      }),
      glow: new THREE.MeshStandardMaterial({
        color: "#001e42",
        emissive: new THREE.Color("#002c5f"),
        emissiveIntensity: 2.2,
        metalness: 0.2,
        roughness: 0.4,
        toneMapped: false,
      }),
    };
  }, [quality]);

  const geometries = useMemo(
    () => ({
      tire: new THREE.TorusGeometry(1.58, 0.34, 24, 48),
      sidewallRing: new THREE.TorusGeometry(1.4, 0.045, 10, 48),
      lip: new THREE.TorusGeometry(1.29, 0.09, 16, 48),
      barrel: new THREE.CylinderGeometry(1.24, 1.19, 0.52, 48, 1, true),
      hub: new THREE.CylinderGeometry(0.3, 0.3, 0.12, 32),
      cap: new THREE.CylinderGeometry(0.155, 0.155, 0.14, 24),
      glowRing: new THREE.TorusGeometry(0.215, 0.014, 10, 40),
      lug: new THREE.CylinderGeometry(0.034, 0.034, 0.07, 6),
      valve: new THREE.CylinderGeometry(0.016, 0.016, 0.15, 8),
      disc: new THREE.CylinderGeometry(1.02, 1.02, 0.06, 48),
      discHat: new THREE.CylinderGeometry(0.44, 0.44, 0.1, 32),
      hole: new THREE.CylinderGeometry(0.028, 0.028, 0.075, 8),
    }),
    [],
  );

  const spokeAngles = useMemo(
    () => Array.from({ length: SPOKE_COUNT }, (_, i) => (i / SPOKE_COUNT) * Math.PI * 2),
    [],
  );
  const holeAngles = useMemo(
    () => Array.from({ length: HOLE_COUNT }, (_, i) => (i / HOLE_COUNT) * Math.PI * 2),
    [],
  );

  const timeAcc = useRef(0);
  useFrame((state, delta) => {
    const float = floatRef.current;
    const spin = spinRef.current;
    if (!float || !spin) return;

    // Own accumulated clock: fiber resets clock.elapsedTime whenever Scene3D toggles
    // the frameloop on scroll, which would snap every rotation back to its t=0 pose.
    timeAcc.current += Math.min(delta, 0.1);
    const t = timeAcc.current;
    const p = pointerSmooth.current;
    p.x = THREE.MathUtils.damp(p.x, state.pointer.x, 2.5, delta);
    p.y = THREE.MathUtils.damp(p.y, state.pointer.y, 2.5, delta);

    // Continuous wheel spin around the axle (tire + rim only).
    spin.rotation.z = -t * 0.5;

    // Gentle float + slow presentation yaw so light sweeps the spokes, pointer tilt on top.
    float.position.y = Math.sin(t * 0.9) * 0.09;
    float.rotation.y = BASE_YAW + Math.sin(t * 0.25) * 0.15 + p.x * 0.1;
    float.rotation.x = BASE_PITCH - p.y * 0.1;

    // Key light travels subtly with the pointer so reflections sweep across the alloy.
    const key = keyLightRef.current;
    if (key) key.position.set(3.5 + p.x * 1.6, 3 + p.y * 1.2, 4.5);
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <hemisphereLight intensity={0.25} color="#cfd8e3" groundColor="#0b0b0b" />
      <directionalLight
        ref={keyLightRef}
        position={[3.5, 3, 4.5]}
        intensity={2.2}
        color="#ffffff"
      />
      <directionalLight position={[-4, 1.5, 2.5]} intensity={0.55} color="#a9c4e6" />
      <directionalLight position={[-2.5, 3.5, -4]} intensity={2} color="#f4f7fb" />
      <directionalLight position={[2.5, -2, -3.5]} intensity={1.1} color="#dfe8f2" />

      <group ref={floatRef} rotation={[BASE_PITCH, BASE_YAW, 0]}>
        {/* Spinning assembly: tire + rim + spokes + hub + valve stem */}
        <group ref={spinRef}>
          <mesh geometry={geometries.tire} material={materials.rubber} scale={[1, 1, 0.82]} />
          <mesh
            geometry={geometries.sidewallRing}
            material={materials.sidewall}
            position={[0, 0, 0.22]}
          />
          <mesh
            geometry={geometries.lip}
            material={materials.alloy}
            position={[0, 0, 0.16]}
            scale={[1, 1, 0.6]}
          />
          <mesh
            geometry={geometries.barrel}
            material={materials.barrel}
            rotation={[Math.PI / 2, 0, 0]}
          />

          {/* 7 twin-blade spokes with a slight twist */}
          {spokeAngles.map((angle, i) => (
            <group key={`spoke-${i}`} rotation={[0, 0, angle]}>
              <RoundedBox
                args={[0.085, 1.04, 0.14]}
                radius={0.02}
                smoothness={2}
                material={materials.alloy}
                position={[-0.062, 0.76, 0.05]}
                rotation={[0, 0.22, 0.04]}
              />
              <RoundedBox
                args={[0.085, 1.04, 0.14]}
                radius={0.02}
                smoothness={2}
                material={materials.alloy}
                position={[0.062, 0.76, 0.05]}
                rotation={[0, 0.22, -0.04]}
              />
            </group>
          ))}

          {/* Hub: disc, ice-blue emissive ring accent, center cap, lug nuts */}
          <mesh
            geometry={geometries.hub}
            material={materials.alloy}
            rotation={[Math.PI / 2, 0, 0]}
            position={[0, 0, 0.1]}
          />
          <mesh geometry={geometries.glowRing} material={materials.glow} position={[0, 0, 0.17]} />
          <mesh
            geometry={geometries.cap}
            material={materials.alloy}
            rotation={[Math.PI / 2, 0, 0]}
            position={[0, 0, 0.14]}
          />
          {spokeAngles.map((angle, i) => (
            <mesh
              key={`lug-${i}`}
              geometry={geometries.lug}
              material={materials.steel}
              rotation={[Math.PI / 2, 0, 0]}
              position={[Math.cos(angle + 0.45) * 0.25, Math.sin(angle + 0.45) * 0.25, 0.16]}
            />
          ))}

          {/* Valve stem */}
          <group rotation={[0, 0, 0.9]}>
            <mesh
              geometry={geometries.valve}
              material={materials.dark}
              position={[0, 1.13, 0.16]}
              rotation={[0.5, 0, 0]}
            />
          </group>
        </group>

        {/* Static brake: drilled disc + red caliper (does not spin with the wheel) */}
        <mesh
          geometry={geometries.disc}
          material={materials.steel}
          rotation={[Math.PI / 2, 0, 0]}
          position={[0, 0, -0.32]}
        />
        <mesh
          geometry={geometries.discHat}
          material={materials.dark}
          rotation={[Math.PI / 2, 0, 0]}
          position={[0, 0, -0.28]}
        />
        {holeAngles.map((angle, i) => (
          <mesh
            key={`hole-${i}`}
            geometry={geometries.hole}
            material={materials.dark}
            rotation={[Math.PI / 2, 0, 0]}
            position={[Math.cos(angle) * 0.78, Math.sin(angle) * 0.78, -0.32]}
          />
        ))}
        <group position={[0, 1.0, -0.32]} rotation={[0, 0, -0.12]}>
          <RoundedBox
            args={[0.56, 0.3, 0.42]}
            radius={0.06}
            smoothness={3}
            material={materials.caliper}
          />
          <RoundedBox
            args={[0.42, 0.16, 0.48]}
            radius={0.04}
            smoothness={2}
            material={materials.dark}
          />
        </group>
      </group>
    </>
  );
}

export default function RimScene({ active, quality }: RimSceneProps) {
  const dpr = useMemo<[number, number]>(() => (quality === "high" ? [1, 1.75] : [1, 1]), [quality]);

  return (
    <Canvas
      style={{ position: "absolute", inset: 0 }}
      frameloop={active ? "always" : "never"}
      dpr={dpr}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0.3, 6.3], fov: 38 }}
    >
      <Wheel quality={quality} />

      <Sparkles
        count={quality === "high" ? 60 : 20}
        scale={[7, 4.5, 3]}
        size={1.6}
        speed={0.28}
        opacity={0.35}
        color="#d5dae1"
      />

      <ContactShadows
        position={[0, -2.25, 0]}
        opacity={0.45}
        scale={9}
        blur={2.8}
        far={3.2}
        resolution={quality === "high" ? 512 : 256}
        frames={quality === "high" ? Infinity : 1}
        color="#000000"
      />

      {quality === "high" && (
        <Environment resolution={256} frames={1}>
          {/* Bright thin strips make the alloy glint; no network fetch — fully procedural */}
          <Lightformer
            form="rect"
            intensity={5}
            color="#ffffff"
            position={[0, 5, 1]}
            scale={[9, 0.8, 1]}
            rotation={[Math.PI / 2, 0, 0]}
          />
          <Lightformer
            form="rect"
            intensity={3}
            color="#dfe8f4"
            position={[-5, 1, 2]}
            scale={[6, 0.7, 1]}
            rotation={[0, Math.PI / 2, 0]}
          />
          <Lightformer
            form="rect"
            intensity={3.5}
            color="#ffffff"
            position={[5, 2, -1]}
            scale={[6, 0.6, 1]}
            rotation={[0, -Math.PI / 2, 0]}
          />
          <Lightformer
            form="ring"
            intensity={1.2}
            color="#b9c7d6"
            position={[0, -1, -4]}
            scale={4}
            rotation={[0, Math.PI, 0]}
          />
        </Environment>
      )}
    </Canvas>
  );
}
