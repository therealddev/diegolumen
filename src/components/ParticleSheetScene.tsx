import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import ParticleSheet from './ParticleSheet';

type ParticleSheetSceneProps = {
  width?: number;
  height?: number;
  particleCount?: number;
  torsionStrength?: number;
  color1?: string;
  color2?: string;
  rotationY?: number;
  offsetX?: number;
  offsetY?: number;
  className?: string;
  // node-based torsion passthrough
  nodesCount?: number;
  nodeWidth?: number;
  nodeStrength?: number;
  alternateDirection?: boolean;
  nodesPositions?: number[];
  maxAngleRadians?: number;
  // DNA mode properties
  dnaMode?: boolean;
  baseTorsion?: number;
  // Palette
  colorPalette?: string[];
  paletteMode?: 'random' | 'striped';
  paletteBands?: number;
  intensityJitter?: number;
};

export default function ParticleSheetScene({
  width = 5,
  height = 20,
  particleCount = 10000,
  torsionStrength = 3.0,
  color1 = '#60a5fa',
  color2 = '#f472b6',
  rotationY = 0,
  offsetX = 8,
  offsetY = 0,
  className = 'pointer-events-none fixed inset-0 z-10',
  nodesCount,
  nodeWidth,
  nodeStrength,
  alternateDirection,
  nodesPositions,
  maxAngleRadians,
  dnaMode,
  baseTorsion,
  colorPalette,
  paletteMode,
  paletteBands,
  intensityJitter,
}: ParticleSheetSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className={className}>
      <Canvas
        camera={{
          position: [0, 0, 20],
          fov: 75,
          near: 0.1,
          far: 1000
        }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#1d1d1d']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <ParticleSheet
          width={width}
          height={height}
          particleCount={particleCount}
          torsionStrength={torsionStrength}
          color1={color1}
          color2={color2}
          rotationY={rotationY}
          offsetX={offsetX}
          offsetY={offsetY}
          nodesCount={nodesCount}
          nodeWidth={nodeWidth}
          nodeStrength={nodeStrength}
          alternateDirection={alternateDirection}
          nodesPositions={nodesPositions}
          maxAngleRadians={maxAngleRadians}
          dnaMode={dnaMode}
          baseTorsion={baseTorsion}
          colorPalette={colorPalette}
          paletteMode={paletteMode}
          paletteBands={paletteBands}
          intensityJitter={intensityJitter}
        />
      </Canvas>
    </div>
  );
} 