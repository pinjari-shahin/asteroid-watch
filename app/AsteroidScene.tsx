

"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";

// --------------------------------------------------
// EARTH TEXTURE
// --------------------------------------------------

function createEarthTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;

  const ctx = canvas.getContext("2d")!;

  const ocean = ctx.createLinearGradient(0, 0, 0, 1024);
  ocean.addColorStop(0, "#071b3d");
  ocean.addColorStop(0.5, "#0754a1");
  ocean.addColorStop(1, "#06152e");

  ctx.fillStyle = ocean;
  ctx.fillRect(0, 0, 2048, 1024);

  const continents = [
    [[180,220],[250,150],[360,170],[420,245],[390,330],[330,360],[290,460],[235,400],[205,310]],
    [[390,430],[465,460],[500,560],[470,700],[415,810],[380,700],[400,580]],
    [[800,190],[920,130],[1060,160],[1120,240],[1060,310],[950,290],[900,360],[820,300]],
    [[940,350],[1030,380],[1080,510],[1030,650],[980,770],[920,640],[900,500]],
    [[1230,200],[1380,160],[1510,210],[1590,300],[1510,380],[1390,340],[1320,430],[1230,340]],
    [[1460,500],[1560,470],[1630,530],[1580,620],[1500,610]],
    [[1700,690],[1770,660],[1830,710],[1790,770],[1720,750]],
  ];

  continents.forEach((points, index) => {
    ctx.beginPath();

    points.forEach(([x, y], i) => {
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.closePath();

    const land = ctx.createLinearGradient(0, 100, 0, 900);
    land.addColorStop(0, "#e0dfb7");
    land.addColorStop(0.35, "#477d4c");
    land.addColorStop(0.7, "#a5a36d");
    land.addColorStop(1, "#d9d5b1");

    ctx.fillStyle = land;
    ctx.fill();

    ctx.globalAlpha = 0.25;
    ctx.strokeStyle = "#c8d9a0";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.globalAlpha = 0.18;
    ctx.fillStyle = index % 2 ? "#1d4f32" : "#d7c58c";

    for (let j = 0; j < 18; j++) {
      const p = points[j % points.length];

      ctx.beginPath();
      ctx.arc(
        p[0] + Math.sin(j * 12.3) * 28,
        p[1] + Math.cos(j * 5.7) * 24,
        3 + (j % 5) * 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  });

  // Polar ice
  ctx.fillStyle = "#d9edfa";
  ctx.fillRect(0, 0, 2048, 75);
  ctx.fillRect(0, 955, 2048, 69);

  // Cloud bands
  ctx.globalAlpha = 0.2;

  for (let i = 0; i < 65; i++) {
    ctx.beginPath();

    const x = (i * 97) % 2048;
    const y = 100 + ((i * 53) % 820);

    ctx.ellipse(
      x,
      y,
      40 + (i % 5) * 18,
      3 + (i % 4) * 2,
      0.15,
      0,
      Math.PI * 2
    );

    ctx.fillStyle = "#ffffff";
    ctx.fill();
  }

  ctx.globalAlpha = 1;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  return texture;
}

// --------------------------------------------------
// EARTH
// --------------------------------------------------

function Earth() {
  const group = useRef<THREE.Group>(null);
  const texture = useMemo(() => createEarthTexture(), []);

  useFrame((_, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.035;
    }
  });

  return (
    <group ref={group} position={[2.0, -0.1, -1.7]}>
      <mesh>
        <sphereGeometry args={[1.48, 96, 96]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.92}
          metalness={0}
        />
      </mesh>

      {/* Blue atmospheric halo */}
      <mesh>
        <sphereGeometry args={[1.54, 64, 64]} />
        <meshBasicMaterial
          color="#249bff"
          transparent
          opacity={0.14}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[1.62, 64, 64]} />
        <meshBasicMaterial
          color="#168cff"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// --------------------------------------------------
// ASTEROID
// --------------------------------------------------

function Asteroid() {
  const asteroid = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1.18, 6);
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);

      const n1 = Math.sin(x * 13 + y * 8) * Math.cos(z * 11 + y * 5);
      const n2 = Math.sin(z * 24 + x * 7) * Math.cos(y * 19);
      const n3 = Math.sin(x * 37 + y * 31 + z * 17);

      const factor = 1 + n1 * 0.09 + n2 * 0.035 + n3 * 0.012;

      pos.setXYZ(
        i,
        x * factor * 1.05,
        y * factor * 0.9,
        z * factor
      );
    }

    geo.computeVertexNormals();
    return geo;
  }, []);

  const material = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;

    const ctx = canvas.getContext("2d")!;

    const base = ctx.createLinearGradient(0, 0, 512, 256);
    base.addColorStop(0, "#423b35");
    base.addColorStop(0.4, "#8c7b69");
    base.addColorStop(0.7, "#4c4540");
    base.addColorStop(1, "#211f20");

    ctx.fillStyle = base;
    ctx.fillRect(0, 0, 512, 256);

    // Rocky speckles
    for (let i = 0; i < 7500; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 256;
      const r = Math.random() * 3 + 0.3;

      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);

      ctx.fillStyle =
        Math.random() > 0.5
          ? `rgba(205,184,157,${Math.random() * 0.38})`
          : `rgba(12,11,12,${Math.random() * 0.55})`;

      ctx.fill();
    }

    // Craters
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 256;
      const r = 2 + Math.random() * 10;

      const crater = ctx.createRadialGradient(
        x - r * 0.25,
        y - r * 0.3,
        1,
        x,
        y,
        r
      );

      crater.addColorStop(0, "#201d1c");
      crater.addColorStop(0.7, "#554a40");
      crater.addColorStop(1, "#b09a80");

      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = crater;
      ctx.fill();
    }

    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 8;

    return new THREE.MeshStandardMaterial({
      map,
      roughness: 1,
      metalness: 0.02,
    });
  }, []);

  useFrame((_, delta) => {
    if (asteroid.current) {
      asteroid.current.rotation.y += delta * 0.12;
      asteroid.current.rotation.x += delta * 0.035;
    }
  });

  return (
    <mesh
      ref={asteroid}
      geometry={geometry}
      material={material}
      position={[-0.75, 0.05, 1.0]}
      castShadow
      receiveShadow
    />
  );
}

// --------------------------------------------------
// ORBIT PATH
// --------------------------------------------------

function Orbit() {
  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = [];

    for (let i = 0; i <= 300; i++) {
      const t = (i / 300) * Math.PI * 2;

      points.push(
        new THREE.Vector3(
          Math.cos(t) * 2.75,
          Math.sin(t) * 0.72 - 0.15,
          Math.sin(t) * 0.42 - 0.2
        )
      );
    }

    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  return (
    <line geometry={geometry}>
      <lineBasicMaterial
        color="#20c7ff"
        transparent
        opacity={0.9}
      />
    </line>
  );
}

// --------------------------------------------------
// FLOATING ASTEROID DEBRIS
// --------------------------------------------------

function Debris() {
  const pieces = useMemo(() => {
    return Array.from({ length: 32 }, (_, i) => ({
      position: [
        -3.8 + ((i * 37) % 80) / 10,
        -1.8 + ((i * 19) % 40) / 10,
        -2.8 + ((i * 23) % 30) / 10,
      ] as [number, number, number],
      size: 0.025 + ((i * 7) % 6) * 0.012,
    }));
  }, []);

  return (
    <group>
      {pieces.map((piece, i) => (
        <mesh
          key={i}
          position={piece.position}
          rotation={[i, i * 0.7, i * 0.3]}
        >
          <dodecahedronGeometry args={[piece.size, 0]} />
          <meshStandardMaterial
            color="#64554a"
            roughness={1}
          />
        </mesh>
      ))}
    </group>
  );
}

// --------------------------------------------------
// 3D ASTRONAUT
// --------------------------------------------------

function Astronaut() {
  const astronaut = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (astronaut.current) {
      const t = state.clock.elapsedTime;

      // Gentle floating motion
      astronaut.current.position.y = 0.22 + Math.sin(t * 0.8) * 0.12;
      astronaut.current.rotation.z = Math.sin(t * 0.45) * 0.045;
      astronaut.current.rotation.y = Math.sin(t * 0.3) * 0.08;
    }
  });

  return (
    <group
      ref={astronaut}
      position={[-2.65, 0.22, 0.1]}
      scale={0.58}
      rotation={[0.05, 0.25, -0.12]}
    >
      {/* Backpack */}
      <mesh position={[0, -0.12, -0.24]}>
        <boxGeometry args={[0.48, 0.65, 0.25]} />
        <meshStandardMaterial
          color="#a8b7c8"
          metalness={0.45}
          roughness={0.5}
        />
      </mesh>

      {/* Backpack side panels */}
      <mesh position={[-0.27, -0.12, -0.22]}>
        <boxGeometry args={[0.08, 0.48, 0.2]} />
        <meshStandardMaterial color="#52667c" metalness={0.5} />
      </mesh>

      <mesh position={[0.27, -0.12, -0.22]}>
        <boxGeometry args={[0.08, 0.48, 0.2]} />
        <meshStandardMaterial color="#52667c" metalness={0.5} />
      </mesh>

      {/* Main suit body */}
      <mesh position={[0, -0.1, 0]}>
        <capsuleGeometry args={[0.27, 0.48, 8, 16]} />
        <meshStandardMaterial
          color="#e7edf5"
          roughness={0.65}
          metalness={0.08}
        />
      </mesh>

      {/* Chest control panel */}
      <mesh position={[0, -0.06, 0.255]}>
        <boxGeometry args={[0.29, 0.23, 0.045]} />
        <meshStandardMaterial
          color="#34465d"
          metalness={0.4}
          roughness={0.4}
        />
      </mesh>

      {/* Control panel lights */}
      {[
        [-0.075, -0.015, "#24e0ff"],
        [0, -0.015, "#55ffae"],
        [0.075, -0.015, "#ffb84d"],
      ].map(([x, y, color], i) => (
        <mesh
          key={i}
          position={[Number(x), Number(y) - 0.06, 0.285]}
        >
          <sphereGeometry args={[0.025, 12, 12]} />
          <meshBasicMaterial color={String(color)} />
        </mesh>
      ))}

      {/* Helmet collar */}
      <mesh position={[0, 0.31, 0]}>
        <cylinderGeometry args={[0.19, 0.22, 0.12, 24]} />
        <meshStandardMaterial color="#7d8da0" metalness={0.5} />
      </mesh>

      {/* Helmet */}
      <mesh position={[0, 0.53, 0]}>
        <sphereGeometry args={[0.31, 32, 32]} />
        <meshStandardMaterial
          color="#f0f5fa"
          roughness={0.3}
          metalness={0.15}
        />
      </mesh>

      {/* Dark glass visor */}
      <mesh position={[0, 0.53, 0.245]} scale={[0.79, 0.68, 0.28]}>
        <sphereGeometry args={[0.27, 32, 32]} />
        <meshPhysicalMaterial
          color="#07182c"
          metalness={0.85}
          roughness={0.12}
          clearcoat={1}
          clearcoatRoughness={0.08}
        />
      </mesh>

      {/* Visor reflection */}
      <mesh position={[-0.075, 0.64, 0.31]} rotation={[0, 0, -0.4]}>
        <boxGeometry args={[0.09, 0.018, 0.008]} />
        <meshBasicMaterial
          color="#7ce8ff"
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Left arm */}
      <group position={[-0.34, -0.02, 0]} rotation={[0, 0, -0.45]}>
        <mesh position={[0, -0.18, 0]}>
          <capsuleGeometry args={[0.095, 0.32, 6, 12]} />
          <meshStandardMaterial color="#dbe4ef" roughness={0.65} />
        </mesh>
        <mesh position={[0, -0.39, 0]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial color="#788ba1" metalness={0.3} />
        </mesh>
      </group>

      {/* Right arm */}
      <group position={[0.34, -0.02, 0]} rotation={[0, 0, 0.55]}>
        <mesh position={[0, -0.18, 0]}>
          <capsuleGeometry args={[0.095, 0.32, 6, 12]} />
          <meshStandardMaterial color="#dbe4ef" roughness={0.65} />
        </mesh>
        <mesh position={[0, -0.39, 0]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial color="#788ba1" metalness={0.3} />
        </mesh>
      </group>

      {/* Left leg */}
      <group position={[-0.15, -0.48, 0]}>
        <mesh position={[0, -0.2, 0]}>
          <capsuleGeometry args={[0.105, 0.3, 6, 12]} />
          <meshStandardMaterial color="#dbe4ef" roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.42, 0.055]}>
          <boxGeometry args={[0.2, 0.13, 0.3]} />
          <meshStandardMaterial color="#8293a7" metalness={0.3} />
        </mesh>
      </group>

      {/* Right leg */}
      <group position={[0.15, -0.48, 0]}>
        <mesh position={[0, -0.2, 0]}>
          <capsuleGeometry args={[0.105, 0.3, 6, 12]} />
          <meshStandardMaterial color="#dbe4ef" roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.42, 0.055]}>
          <boxGeometry args={[0.2, 0.13, 0.3]} />
          <meshStandardMaterial color="#8293a7" metalness={0.3} />
        </mesh>
      </group>

      {/* Blue light around the astronaut */}
      <pointLight
        position={[0, 0.5, 0.8]}
        intensity={3}
        distance={2.5}
        color="#36cfff"
      />
    </group>
  );
}

// --------------------------------------------------
// COMPLETE SPACE SCENE
// --------------------------------------------------

function Scene() {
  return (
    <>
      <color attach="background" args={["#020611"]} />
      <fog attach="fog" args={["#020611", 10, 24]} />

      <ambientLight intensity={0.45} />

      <directionalLight
        position={[-4, 5, 5]}
        intensity={3.8}
        color="#d5eaff"
      />

      <pointLight
        position={[4, 1, 3]}
        intensity={55}
        color="#178cff"
      />

      <pointLight
        position={[-4, -1, 1]}
        intensity={24}
        color="#ffb36c"
      />

      <Stars
        radius={100}
        depth={65}
        count={6500}
        factor={4}
        saturation={0.2}
        fade
        speed={0.25}
      />

      <Earth />
      <Orbit />
      <Asteroid />
      <Debris />
      <Astronaut />

      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={4}
        maxDistance={10}
        rotateSpeed={0.55}
        zoomSpeed={0.7}
      />
    </>
  );
}

// --------------------------------------------------
// MAIN COMPONENT
// --------------------------------------------------

export default function AsteroidScene() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: 440,
        background: "#020611",
      }}
    >
      <Canvas
        camera={{ position: [0, 0.2, 8.2], fov: 43 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: false }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
