"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";
import * as THREE from "three";

/**
 * AI Neural Core - a translucent brain-sphere with a living neural network
 * inside, steered by a 3-axis control gyroscope (the "human-in-control"
 * metaphor) and framed by a camera-facing rubric ring whose 6 labelled nodes
 * are the 6 AI-Fluency assessment axes.
 *
 * Theming: the scene is rendered with two completely separate palettes.
 *  - DARK  → cyan/blue tones on ADDITIVE blending (glow reads on the black page).
 *  - LIGHT → saturated deep-blue/indigo on NORMAL blending, because additive
 *            light is invisible over white. This lets the brain stand out on a
 *            pure-white background with NO dark backdrop behind it.
 *
 * Performance notes: the glass shell uses a cheap physical material (no
 * per-frame transmission FBO), labels are lightweight projected HTML, and the
 * scene needs no HDR environment - so first paint and steady-state are smooth.
 */

const BRAIN_R = 1.3; // brain shell radius
const RING_R = 2.05; // rubric ring radius (6 axis nodes sit here)
const LABEL_R = RING_R + 0.5; // labels sit just outside the nodes
const N_NEURONS = 200;

// Brand axes - stable English terms (shown identically in both locales).
const AXIS_LABELS = [
  "Understanding",
  "Hypothesis",
  "Prompting",
  "Verification",
  "Testing",
  "Debugging",
] as const;

type Palette = {
  blending: THREE.Blending;
  // Neuron radial gradient (inner → outer)
  nInner: string;
  nMid: string;
  nOuter: string;
  // Glass shell
  shellColor: string;
  shellOpacity: number;
  // Inner volumetric glow
  innerGlowColor: string;
  innerGlowOpacity: number;
  // Wireframe neural shell
  wireColor: string;
  wireOpacity: number;
  // Synapse links
  synapseColor: string;
  synapseOpacity: number;
  // Neuron points
  neuronSize: number;
  neuronBase: number;
  neuronPulse: number;
  // Pulsing AI core
  coreColor: string;
  coreEmissive: string;
  coreEmissiveBase: number;
  coreEmissivePulse: number;
  // Core halo
  haloColor: string;
  haloBase: number;
  haloPulse: number;
  // Control gyroscope
  gimbalBase: string;
  gimbalEmZ: string;
  gimbalEmX: string;
  gimbalEmY: string;
  gimbalIntZ: number;
  gimbalIntX: number;
  gimbalIntY: number;
  // Rubric ring + nodes
  ringColor: string;
  ringOpacity: number;
  nodeCore: string;
  nodeEmissive: string;
  nodeEmissiveIntensity: number;
  nodeHaloColor: string;
  nodeHaloOpacity: number;
};

// Dark = Obsidian Refraction. Cyan/blue glow on additive blending.
const DARK_PALETTE: Palette = {
  blending: THREE.AdditiveBlending,
  nInner: "#6ea8ff",
  nMid: "#0055ff",
  nOuter: "#3ad8ff",
  shellColor: "#dce8ff",
  shellOpacity: 0.14,
  innerGlowColor: "#6ea8ff",
  innerGlowOpacity: 0.06,
  wireColor: "#6ea8ff",
  wireOpacity: 0.09,
  synapseColor: "#6ea8ff",
  synapseOpacity: 0.15,
  neuronSize: 0.135,
  neuronBase: 0.82,
  neuronPulse: 0.18,
  coreColor: "#eafffb",
  coreEmissive: "#6ea8ff",
  coreEmissiveBase: 2.2,
  coreEmissivePulse: 1.7,
  haloColor: "#0055ff",
  haloBase: 0.12,
  haloPulse: 0.13,
  gimbalBase: "#0c1722",
  gimbalEmZ: "#6ea8ff",
  gimbalEmX: "#0055ff",
  gimbalEmY: "#3ad8ff",
  gimbalIntZ: 1.5,
  gimbalIntX: 1.3,
  gimbalIntY: 1.2,
  ringColor: "#6ea8ff",
  ringOpacity: 0.5,
  nodeCore: "#eafffb",
  nodeEmissive: "#6ea8ff",
  nodeEmissiveIntensity: 3.4,
  nodeHaloColor: "#6ea8ff",
  nodeHaloOpacity: 0.2,
};

// Light = Iceberg Protocol. Saturated deep-blue/indigo "ink" on NORMAL blending
// so every detail stays crisp and dark against the white page.
const LIGHT_PALETTE: Palette = {
  blending: THREE.NormalBlending,
  nInner: "#2f6bd6",
  nMid: "#0a3fc0",
  nOuter: "#5132c4",
  shellColor: "#3a5fc8",
  shellOpacity: 0.08,
  innerGlowColor: "#2a4fc0",
  innerGlowOpacity: 0.05,
  wireColor: "#2a52c0",
  wireOpacity: 0.3,
  synapseColor: "#1f48b8",
  synapseOpacity: 0.42,
  neuronSize: 0.15,
  neuronBase: 0.92,
  neuronPulse: 0.08,
  coreColor: "#16308f",
  coreEmissive: "#0033d6",
  coreEmissiveBase: 1.0,
  coreEmissivePulse: 0.7,
  haloColor: "#2a54c8",
  haloBase: 0.12,
  haloPulse: 0.08,
  gimbalBase: "#16357f",
  gimbalEmZ: "#2f6bd6",
  gimbalEmX: "#0a3fc0",
  gimbalEmY: "#5132c4",
  gimbalIntZ: 0.7,
  gimbalIntX: 0.65,
  gimbalIntY: 0.6,
  ringColor: "#0041c8",
  ringOpacity: 0.6,
  nodeCore: "#13308f",
  nodeEmissive: "#0033d6",
  nodeEmissiveIntensity: 1.7,
  nodeHaloColor: "#3358c0",
  nodeHaloOpacity: 0.2,
};

type Props = {
  rotate?: boolean;
  speed?: number;
  theme?: "light" | "dark";
};

/** A single rubric-axis node: bright core + halo. */
function AxisNode({
  position,
  palette,
}: {
  position: [number, number, number];
  palette: Palette;
}) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.085, 16, 16]} />
        <meshStandardMaterial
          color={palette.nodeCore}
          emissive={palette.nodeEmissive}
          emissiveIntensity={palette.nodeEmissiveIntensity}
          toneMapped={false}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.24, 16, 16]} />
        <meshBasicMaterial
          color={palette.nodeHaloColor}
          transparent
          opacity={palette.nodeHaloOpacity}
          blending={palette.blending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

export function FluencyCore({ rotate = true, speed = 0.15, theme = "dark" }: Props) {
  const P = theme === "light" ? LIGHT_PALETTE : DARK_PALETTE;

  const brain = useRef<THREE.Group>(null);
  const rubric = useRef<THREE.Group>(null);
  const gimbalZ = useRef<THREE.Group>(null);
  const gimbalX = useRef<THREE.Group>(null);
  const gimbalY = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);
  const neuronsMat = useRef<THREE.PointsMaterial>(null);

  // Neural cloud geometry (positions + synapse links) - stable across themes.
  const { positions, radii, segments } = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const pos = new Float32Array(N_NEURONS * 3);
    const rad = new Float32Array(N_NEURONS);

    for (let i = 0; i < N_NEURONS; i++) {
      const dir = new THREE.Vector3().randomDirection();
      const r = BRAIN_R * (0.28 + 0.68 * Math.cbrt(Math.random()));
      const p = dir.multiplyScalar(r);
      pts.push(p);
      pos[i * 3] = p.x;
      pos[i * 3 + 1] = p.y;
      pos[i * 3 + 2] = p.z;
      rad[i] = r;
    }

    const seg: number[] = [];
    const maxDist = 0.5;
    const maxLinks = 2;
    for (let i = 0; i < N_NEURONS; i++) {
      const near: { j: number; d: number }[] = [];
      for (let j = i + 1; j < N_NEURONS; j++) {
        const d = pts[i].distanceTo(pts[j]);
        if (d < maxDist) near.push({ j, d });
      }
      near.sort((a, b) => a.d - b.d);
      for (let k = 0; k < Math.min(maxLinks, near.length); k++) {
        const b = pts[near[k].j];
        seg.push(pts[i].x, pts[i].y, pts[i].z, b.x, b.y, b.z);
      }
    }

    return { positions: pos, radii: rad, segments: new Float32Array(seg) };
  }, []);

  // Per-neuron colours depend on the active palette - recomputed on theme swap.
  const colors = useMemo(() => {
    const col = new Float32Array(N_NEURONS * 3);
    const cInner = new THREE.Color(P.nInner);
    const cMid = new THREE.Color(P.nMid);
    const cOuter = new THREE.Color(P.nOuter);
    for (let i = 0; i < N_NEURONS; i++) {
      const t = THREE.MathUtils.clamp((radii[i] / BRAIN_R - 0.28) / 0.68, 0, 1);
      const c = cInner.clone().lerp(cMid, t).lerp(cOuter, t * 0.5);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return col;
  }, [radii, P.nInner, P.nMid, P.nOuter]);

  // Soft round sprite so neurons read as glowing dots, not hard squares.
  const sprite = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.35, "rgba(255,255,255,0.55)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }, []);

  // Camera-facing rubric ring: closed loop + 6 nodes/labels in the XY plane.
  const ringPoints = useMemo(
    () =>
      Array.from({ length: 73 }, (_, i) => {
        const a = (i / 72) * Math.PI * 2;
        return [Math.cos(a) * RING_R, Math.sin(a) * RING_R, 0] as [
          number,
          number,
          number,
        ];
      }),
    [],
  );
  const axes = useMemo(
    () =>
      AXIS_LABELS.map((label, i) => {
        const a = -Math.PI / 2 + (i / 6) * Math.PI * 2;
        return {
          label,
          node: [Math.cos(a) * RING_R, Math.sin(a) * RING_R, 0] as [
            number,
            number,
            number,
          ],
          labelPos: [Math.cos(a) * LABEL_R, Math.sin(a) * LABEL_R, 0] as [
            number,
            number,
            number,
          ],
        };
      }),
    [],
  );

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    if (rotate) {
      if (brain.current) brain.current.rotation.y += delta * speed * 1.1;
      // Nested 3-axis gimbal → gyroscope "being steered" feel.
      if (gimbalZ.current) gimbalZ.current.rotation.z += delta * speed * 2.2;
      if (gimbalX.current) gimbalX.current.rotation.x += delta * speed * 2.9;
      if (gimbalY.current) gimbalY.current.rotation.y += delta * speed * 1.8;
      // Slow drift of the labelled rubric ring around the screen axis.
      if (rubric.current) rubric.current.rotation.z += delta * speed * 0.35;
    }

    const pulse = 0.5 + 0.5 * Math.sin(t * 1.7);
    if (core.current) {
      core.current.scale.setScalar(1 + pulse * 0.13);
      (core.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        P.coreEmissiveBase + pulse * P.coreEmissivePulse;
    }
    if (halo.current) {
      (halo.current.material as THREE.MeshBasicMaterial).opacity =
        P.haloBase + pulse * P.haloPulse;
    }
    if (neuronsMat.current) {
      neuronsMat.current.opacity = P.neuronBase + pulse * P.neuronPulse;
    }
  });

  return (
    <group>
      {/* ── Tilted 3D assembly: brain + control gyroscope ────────── */}
      <group rotation={[0.32, 0, 0]}>
        <group ref={brain}>
          {/* Translucent glossy shell (cheap - no transmission FBO) */}
          <mesh scale={[1.06, 0.97, 1]}>
            <sphereGeometry args={[BRAIN_R, 48, 48]} />
            <meshPhysicalMaterial
              transparent
              opacity={P.shellOpacity}
              roughness={0.12}
              metalness={0}
              clearcoat={1}
              clearcoatRoughness={0.12}
              color={P.shellColor}
              ior={1.4}
              transmission={0}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Soft volumetric inner glow so the brain reads luminous, not hollow */}
          <mesh scale={[1.04, 0.96, 0.98]}>
            <sphereGeometry args={[BRAIN_R * 0.92, 32, 32]} />
            <meshBasicMaterial
              color={P.innerGlowColor}
              transparent
              opacity={P.innerGlowOpacity}
              blending={P.blending}
              depthWrite={false}
              side={THREE.BackSide}
              toneMapped={false}
            />
          </mesh>

          {/* Faint wireframe neural shell → "network sphere" read */}
          <mesh scale={[1.12, 1.0, 1.06]}>
            <icosahedronGeometry args={[BRAIN_R, 2]} />
            <meshBasicMaterial
              color={P.wireColor}
              wireframe
              transparent
              opacity={P.wireOpacity}
              blending={P.blending}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>

          {/* Synapse links */}
          <lineSegments>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[segments, 3]} />
            </bufferGeometry>
            <lineBasicMaterial
              color={P.synapseColor}
              transparent
              opacity={P.synapseOpacity}
              blending={P.blending}
              depthWrite={false}
              toneMapped={false}
            />
          </lineSegments>

          {/* Neurons */}
          <points>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[positions, 3]} />
              <bufferAttribute attach="attributes-color" args={[colors, 3]} />
            </bufferGeometry>
            <pointsMaterial
              ref={neuronsMat}
              map={sprite}
              size={P.neuronSize}
              vertexColors
              transparent
              opacity={P.neuronBase}
              depthWrite={false}
              blending={P.blending}
              sizeAttenuation
              toneMapped={false}
            />
          </points>

          {/* Pulsing AI core + halo */}
          <mesh ref={core}>
            <sphereGeometry args={[0.17, 24, 24]} />
            <meshStandardMaterial
              color={P.coreColor}
              emissive={P.coreEmissive}
              emissiveIntensity={P.coreEmissiveBase}
              toneMapped={false}
            />
          </mesh>
          <mesh ref={halo}>
            <sphereGeometry args={[0.46, 20, 20]} />
            <meshBasicMaterial
              color={P.haloColor}
              transparent
              opacity={P.haloBase}
              blending={P.blending}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        </group>

        {/* Control gyroscope: 3 nested gimbals being "steered" */}
        <group ref={gimbalZ}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.9, 0.014, 12, 96]} />
            <meshStandardMaterial
              color={P.gimbalBase}
              emissive={P.gimbalEmZ}
              emissiveIntensity={P.gimbalIntZ}
              metalness={0.6}
              roughness={0.3}
              toneMapped={false}
            />
          </mesh>
          <group ref={gimbalX}>
            <mesh rotation={[0, Math.PI / 2, 0]}>
              <torusGeometry args={[1.72, 0.013, 12, 96]} />
              <meshStandardMaterial
                color={P.gimbalBase}
                emissive={P.gimbalEmX}
                emissiveIntensity={P.gimbalIntX}
                metalness={0.6}
                roughness={0.3}
                toneMapped={false}
              />
            </mesh>
            <group ref={gimbalY}>
              <mesh>
                <torusGeometry args={[1.55, 0.012, 12, 96]} />
                <meshStandardMaterial
                  color={P.gimbalBase}
                  emissive={P.gimbalEmY}
                  emissiveIntensity={P.gimbalIntY}
                  metalness={0.6}
                  roughness={0.3}
                  toneMapped={false}
                />
              </mesh>
            </group>
          </group>
        </group>
      </group>

      {/* ── Camera-facing rubric ring with 6 labelled axis nodes ── */}
      <group ref={rubric}>
        <Line
          points={ringPoints}
          color={P.ringColor}
          lineWidth={1.4}
          transparent
          opacity={P.ringOpacity}
        />
        {axes.map((ax) => (
          <group key={ax.label}>
            <AxisNode position={ax.node} palette={P} />
            <Html position={ax.labelPos} center zIndexRange={[20, 0]}>
              <span className="rubric-label">{ax.label}</span>
            </Html>
          </group>
        ))}
      </group>
    </group>
  );
}
