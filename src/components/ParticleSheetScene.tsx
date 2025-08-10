import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import ParticleSheet from './ParticleSheet';
import Galaxy from './Galaxy';

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

// Background vertical lines component
function BackgroundLines() {
  return (
    <>
      {/* Left line */}
      <mesh position={[-15, 0, -10]}>
        <planeGeometry args={[0.05, 100]} />
        <meshBasicMaterial color="#4b5563" transparent opacity={0.3} />
      </mesh>
      
      {/* Center line */}
      <mesh position={[0, 0, -10]}>
        <planeGeometry args={[0.05, 100]} />
        <meshBasicMaterial color="#4b5563" transparent opacity={0.3} />
      </mesh>
      
      {/* Right line */}
      <mesh position={[15, 0, -10]}>
        <planeGeometry args={[0.05, 100]} />
        <meshBasicMaterial color="#4b5563" transparent opacity={0.3} />
      </mesh>
    </>
  );
}

export default function ParticleSheetScene({
  width = 5,
  height = 20,
  particleCount = 10000,
  torsionStrength = 3.0,
  color1 = '#60a5fa',
  color2 = '#ff0080', // Changed to bright fluorescent pink
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
          position: [0, 0, 30],
          fov: 75,
          near: 0.1,
          far: 1000
        }}
        dpr={[1, 2]}
        style={{ background: '#1d1d1d' }}
      >
        {/* Galaxy background - furthest back */}
        <Galaxy 
          count={150000}
          size={0.1}
          radius={50}
          branches={4}
          spin={0.2}
          randomness={0.8}
          randomnessPower={1}
          insideColor="#ffffff"
          outsideColor="#e5e7eb"
        />
        
        {/* Background lines - middle layer */}
        <BackgroundLines />
        
        {/* DNA Particle Sheet - foreground */}
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