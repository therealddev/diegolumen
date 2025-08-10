import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

type DnaHelixProps = {
  radius?: number;
  height?: number;
  turns?: number;
  segmentsPerTurn?: number;
  beadRadius?: number;
  pairSpacing?: number;
  rotationSpeed?: number;
};

function createHelixPoints(
  radius: number,
  height: number,
  turns: number,
  segmentsPerTurn: number,
  phaseOffsetRadians: number
): THREE.Vector3[] {
  const totalSegments = Math.max(1, Math.floor(turns * segmentsPerTurn));
  const points: THREE.Vector3[] = [];
  const totalAngle = turns * Math.PI * 2;
  for (let segmentIndex = 0; segmentIndex <= totalSegments; segmentIndex += 1) {
    const t = segmentIndex / totalSegments;
    const angle = t * totalAngle + phaseOffsetRadians;
    const y = (t - 0.5) * height;
    const x = radius * Math.cos(angle);
    const z = radius * Math.sin(angle);
    points.push(new THREE.Vector3(x, y, z));
  }
  return points;
}

export default function DNAHelix({
  radius = 0.8,
  height = 5,
  turns = 6,
  segmentsPerTurn = 30,
  beadRadius = 0.06,
  pairSpacing = 0.25,
  rotationSpeed = 0.3,
}: DnaHelixProps) {
  const groupRef = useRef<THREE.Group>(null);

  const { helixA, helixB, pairs } = useMemo(() => {
    const helixPointsA = createHelixPoints(radius, height, turns, segmentsPerTurn, 0);
    const helixPointsB = createHelixPoints(radius, height, turns, segmentsPerTurn, Math.PI);

    // Compute base-pair connectors: link corresponding points inward towards center line
    const connectors: Array<{ start: THREE.Vector3; end: THREE.Vector3 }> = [];
    const minCount = Math.min(helixPointsA.length, helixPointsB.length);
    for (let i = 0; i < minCount; i += Math.max(1, Math.floor(segmentsPerTurn / 4))) {
      const a = helixPointsA[i];
      const b = helixPointsB[i];
      // Move slightly towards the center to create a ladder rung
      const midpoint = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
      const dirAToMid = new THREE.Vector3().subVectors(midpoint, a).normalize();
      const dirBToMid = new THREE.Vector3().subVectors(midpoint, b).normalize();
      const start = new THREE.Vector3().copy(a).addScaledVector(dirAToMid, pairSpacing);
      const end = new THREE.Vector3().copy(b).addScaledVector(dirBToMid, pairSpacing);
      connectors.push({ start, end });
    }

    return { helixA: helixPointsA, helixB: helixPointsB, pairs: connectors };
  }, [radius, height, turns, segmentsPerTurn, pairSpacing]);

  useFrame((_state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  // Materials
  const materialHelixA = useMemo(() => new THREE.MeshStandardMaterial({ color: new THREE.Color('#60a5fa'), emissive: new THREE.Color('#1d4ed8'), roughness: 0.3, metalness: 0.1 }), []);
  const materialHelixB = useMemo(() => new THREE.MeshStandardMaterial({ color: new THREE.Color('#f472b6'), emissive: new THREE.Color('#9d174d'), roughness: 0.3, metalness: 0.1 }), []);
  const materialPair = useMemo(() => new THREE.MeshStandardMaterial({ color: new THREE.Color('#a3e635'), emissive: new THREE.Color('#3f6212'), roughness: 0.4, metalness: 0.05 }), []);

  const sphereGeom = useMemo(() => new THREE.SphereGeometry(beadRadius, 16, 16), [beadRadius]);

  return (
    <group ref={groupRef}>
      {/* Helix A beads */}
      {helixA.map((point, index) => (
        <mesh key={`ha-${index}`} position={point} geometry={sphereGeom} material={materialHelixA} />
      ))}

      {/* Helix B beads */}
      {helixB.map((point, index) => (
        <mesh key={`hb-${index}`} position={point} geometry={sphereGeom} material={materialHelixB} />
      ))}

      {/* Base-pair connectors as cylinders */}
      {pairs.map(({ start, end }, index) => {
        const direction = new THREE.Vector3().subVectors(end, start);
        const length = direction.length();
        const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        // Align cylinder along the connector direction
        const orientation = new THREE.Matrix4();
        const up = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction.clone().normalize());
        orientation.makeRotationFromQuaternion(quaternion);
        return (
          <mesh key={`pair-${index}`} position={midpoint} material={materialPair}>
            <cylinderGeometry args={[beadRadius * 0.5, beadRadius * 0.5, length, 8]} />
            <primitive object={new THREE.AxesHelper(0)} visible={false} />
            <primitive object={new THREE.Object3D()} matrix={orientation} matrixAutoUpdate={false} />
          </mesh>
        );
      })}
    </group>
  );
} 