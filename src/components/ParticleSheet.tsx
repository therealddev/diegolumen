import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

type ParticleSheetProps = {
  width?: number;
  height?: number;
  particleCount?: number;
  torsionStrength?: number; // global multiplier
  color1?: string;
  color2?: string;
  rotationY?: number;
  offsetX?: number;
  offsetY?: number;
  // Node-based torsion controls
  nodesCount?: number; // number of torsion nodes
  nodeWidth?: number; // Gaussian width in normalized units (0..1)
  nodeStrength?: number; // base angle per node in radians
  alternateDirection?: boolean; // alternate +/− for neighboring nodes
  nodesPositions?: number[]; // optional explicit positions in [-1, 1]
  maxAngleRadians?: number; // clamp per-particle angle
  dnaMode?: boolean; // enable DNA-like torsion pattern
  baseTorsion?: number; // minimal torsion present everywhere (DNA backbone)
  // Color palette controls
  colorPalette?: string[];
  paletteMode?: 'random' | 'striped';
  paletteBands?: number; // number of vertical bands when striped
  intensityJitter?: number; // 0..1 amplitude for brightness variation
};

export default function ParticleSheet({
  width = 10,
  height = 20,
  particleCount = 10000,
  torsionStrength = 1.0,
  color1 = '#60a5fa',
  color2 = '#ff0080', // Changed to bright fluorescent pink
  rotationY = 0,
  offsetX = 0,
  offsetY = 0,
  nodesCount = 5,
  nodeWidth = 0.16,
  nodeStrength = 1.4, // ~80 degrees
  alternateDirection = true,
  nodesPositions,
  maxAngleRadians = 1.57, // ~90 degrees
  dnaMode = true, // Default to DNA mode
  baseTorsion = 0.3, // Default base torsion
  colorPalette,
  paletteMode = 'striped',
  paletteBands = 12,
  intensityJitter = 0.55,
}: ParticleSheetProps) {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.Material | null>(null);
  const geometryRef = useRef<THREE.BufferGeometry | null>(null);
  const originalColorsRef = useRef<Float32Array | null>(null);
  const originalSizesRef = useRef<Float32Array | null>(null);
  const particleStatesRef = useRef<Array<{
    isLit: boolean;
    targetLit: boolean;
    litAmount: number; // 0 to 1, current interpolation
    fadeSpeed: number; // how fast this particle fades
    nextChangeTime: number; // when this particle should change state
  }> | null>(null);

  // Rotation is now handled directly in the group rotation prop

  type TorsionNode = { position: number; width: number; strength: number; direction: number };

  const torsionNodes: TorsionNode[] = useMemo(() => {
    const result: TorsionNode[] = [];

    if (dnaMode) {
      // Create uniform spiral - consistent torsion throughout entire structure
      result.push({ 
        position: 0, 
        width: 2.0, // Wide coverage for entire structure
        strength: baseTorsion * 1.2, // Stronger uniform spiral strength (was 0.6)
        direction: 1 
      });

      // Add smooth variation along the height for natural spiral look
      const spiralNodes = 20;
      for (let i = 0; i < spiralNodes; i++) {
        const t = i / (spiralNodes - 1);
        const position = -0.9 + t * 1.8;
        
        result.push({
          position,
          width: nodeWidth * 1.2, // Tighter nodes for more focused effect
          strength: nodeStrength * 1.0, // Much stronger - increased from 0.4 to 1.0
          direction: 1 // Same direction throughout for uniform spiral
        });
      }
      
    } else {
      // Original torsion node logic
      const positions: number[] = nodesPositions && nodesPositions.length > 0
        ? nodesPositions
        : Array.from({ length: nodesCount }, (_, i) => {
            // Evenly spaced in [-0.85, 0.85]
            const t = nodesCount === 1 ? 0.5 : i / (nodesCount - 1);
            return -0.85 + t * (0.85 - -0.85);
          });
      positions.forEach((pos, idx) => {
        const direction = alternateDirection ? (idx % 2 === 0 ? 1 : -1) : 1;
        result.push({ position: pos, width: nodeWidth, strength: nodeStrength, direction });
      });
    }

    return result;
  }, [nodesCount, nodeWidth, nodeStrength, alternateDirection, nodesPositions, dnaMode, baseTorsion]);

  // Precompute palette colors
  const paletteColors = useMemo(() => {
    if (!colorPalette || colorPalette.length === 0) return null;
    try {
      return colorPalette.map(hex => new THREE.Color(hex));
    } catch {
      return null;
    }
  }, [colorPalette]);

  // Create particles in a sheet formation with node-based torsion
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();

    // Calculate a grid size that produces approximately the requested number of particles
    const aspectRatio = width / height;
    const gridHeight = Math.sqrt(particleCount / aspectRatio);
    const gridWidth = gridHeight * aspectRatio;

    const rows = Math.max(2, Math.ceil(gridHeight));
    const cols = Math.max(2, Math.ceil(gridWidth));
    const totalParticles = rows * cols;

    const positions = new Float32Array(totalParticles * 3);
    const colors = new Float32Array(totalParticles * 3);
    const sizes = new Float32Array(totalParticles);

    const color1Obj = new THREE.Color(color1);
    const color2Obj = new THREE.Color(color2);

    // Precompute forward-only torsion via positive rate integration and normalized scaling
    let rowAngles: number[] | null = null;
    if (dnaMode) {
      const rates = new Array<number>(rows).fill(0);
      const stepNy = rows > 1 ? 2 / (rows - 1) : 0; // normalized y step size

      for (let row = 0; row < rows; row++) {
        const yPercent = row / (rows - 1);
        const ny = (yPercent - 0.5) * 2; // [-1,1]

        let rate = 0;
        rate += Math.max(0, baseTorsion);

        for (const node of torsionNodes) {
          const dy = ny - node.position;
          const g = Math.exp(-0.5 * (dy / node.width) * (dy / node.width));
          rate += Math.max(0, node.strength) * g;
        }

        const waveFreq = 10;
        const waveAmp = 0.15;
        const waveNormalized = 0.5 * (Math.sin(ny * Math.PI * waveFreq) + 1); // [0,1]
        rate += waveNormalized * waveAmp;

        rates[row] = rate * Math.max(0, torsionStrength);
      }

      // Integrate and normalize to avoid early saturation and ensure visible twist
      const cumulative = new Array<number>(rows).fill(0);
      for (let row = 1; row < rows; row++) {
        cumulative[row] = cumulative[row - 1] + rates[row] * stepNy;
      }
      const total = cumulative[rows - 1];
      const scale = total > 0 ? (maxAngleRadians / total) : 0;

      rowAngles = cumulative.map(v => v * scale);
    }

    let particleIndex = 0;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const idx = particleIndex * 3;

        // Uniform grid positions
        const xPercent = col / (cols - 1);
        const yPercent = row / (rows - 1);

        const baseX = (xPercent - 0.5) * width;
        const baseZ = 0;
        const y = (yPercent - 0.5) * height;

        // Normalized y in [-1, 1]
        const ny = (y / (height * 0.5));

        // Compute angle
        let angle: number;
        if (dnaMode && rowAngles) {
          angle = rowAngles[row];
        } else {
          // Original per-row angle (can be positive/negative)
          let tmp = 0;
          for (const node of torsionNodes) {
            const dy = ny - node.position; // distance in normalized units
            const gaussian = Math.exp(-0.5 * (dy / node.width) * (dy / node.width));
            tmp += node.direction * node.strength * gaussian;
          }
          tmp *= torsionStrength;
          angle = Math.max(-maxAngleRadians, Math.min(maxAngleRadians, tmp));
        }

        // Rotate around Y by angle
        const newX = baseX * Math.cos(angle) - baseZ * Math.sin(angle);
        const newZ = baseX * Math.sin(angle) + baseZ * Math.cos(angle);

        positions[idx] = newX;
        positions[idx + 1] = y;
        positions[idx + 2] = newZ;

        // Color assignment: palette if provided, else gradient
        if (paletteColors && paletteColors.length > 0) {
          let baseColor: THREE.Color;
          
          // Reduced chance for pure white highlight - only 1% instead of 5%
          if (Math.random() < 0.01) {
            baseColor = new THREE.Color(1, 1, 1); // Pure white
            sizes[particleIndex] = 0.12 + Math.random() * 0.06; // Larger size for highlights
          } else {
            // Existing color logic - exclude white from random selection
            const nonWhitePalette = paletteColors.slice(0, -1); // Remove white from selection
            if (paletteMode === 'striped') {
              const bandIndex = Math.floor(yPercent * paletteBands);
              const paletteIndex = bandIndex % nonWhitePalette.length;
              baseColor = nonWhitePalette[paletteIndex];
            } else {
              const paletteIndex = Math.floor(Math.random() * nonWhitePalette.length);
              baseColor = nonWhitePalette[paletteIndex];
            }
          }

          // Per-particle intensity/brightness variation controlled by intensityJitter
          const amp = Math.max(0, Math.min(1, intensityJitter));
          const bias = (Math.random() * 2 - 1) * amp; // [-amp, amp]
          let r = baseColor.r;
          let g = baseColor.g;
          let b = baseColor.b;
          
          if (bias < 0) {
            const f = 1 + bias; // dims to [1-amp, 1]
            r *= f; g *= f; b *= f;
          } else {
            r = r + (1 - r) * bias;
            g = g + (1 - g) * bias;
            b = b + (1 - b) * bias;
          }

          colors[idx] = r;
          colors[idx + 1] = g;
          colors[idx + 2] = b;
        } else {
          const t = yPercent;
          const colorMix = new THREE.Color().lerpColors(color1Obj, color2Obj, t);
          
          colors[idx] = colorMix.r;
          colors[idx + 1] = colorMix.g;
          colors[idx + 2] = colorMix.b;
        }

        sizes[particleIndex] = 0.25 + Math.random() * 0.1; // Much bigger base size: 0.25-0.35
        particleIndex++;
      }
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Store original colors and sizes for animation
    originalColorsRef.current = colors.slice();
    originalSizesRef.current = sizes.slice();

    // Initialize particle states for smooth lighting animation
    particleStatesRef.current = Array.from({ length: totalParticles }, () => ({
      isLit: false,
      targetLit: false,
      litAmount: 0,
      fadeSpeed: 0.8 + Math.random() * 0.4, // Random fade speed between 0.8-1.2
      nextChangeTime: Math.random() * 10, // Random initial change time
    }));

    return geo;
  }, [particleCount, width, height, color1, color2, torsionStrength, torsionNodes, maxAngleRadians, dnaMode, baseTorsion, paletteColors, paletteMode, paletteBands, intensityJitter]);

  // Create a subtle blurred dot texture
  const pointTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;

    const context = canvas.getContext('2d');
    if (!context) return null;

    // Apply heavy blur to the entire canvas
    context.filter = 'blur(3.5px)';

    // Create a tighter gradient for just a blurred dot
    const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 12);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    context.fillStyle = gradient;
    context.beginPath();
    context.arc(16, 16, 12, 0, Math.PI * 2);
    context.fill();

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  const material = useMemo(() => {
    if (!pointTexture) {
      return new THREE.PointsMaterial({ size: 0.1, vertexColors: true });
    }

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        pointTexture: { value: pointTexture },
        size: { value: 800.0 }, // Much higher base size multiplier
      },
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (800.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D pointTexture;
        varying vec3 vColor;
        
        void main() {
          gl_FragColor = vec4(vColor, 1.0);
          gl_FragColor = gl_FragColor * texture2D(pointTexture, gl_PointCoord);
          if (gl_FragColor.a < 0.001) discard;
        }
      `,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
      vertexColors: true,
    });

    materialRef.current = mat;
    return mat;
  }, [pointTexture]);

  // Smooth animation system for dynamic lighting
  useFrame((state, delta) => {
    const currentTime = state.clock.elapsedTime;
    
    if (geometryRef.current && originalColorsRef.current && originalSizesRef.current && particleStatesRef.current) {
      const colorAttribute = geometryRef.current.getAttribute('color') as THREE.BufferAttribute;
      const sizeAttribute = geometryRef.current.getAttribute('size') as THREE.BufferAttribute;
      
      if (colorAttribute && sizeAttribute) {
        const colors = colorAttribute.array as Float32Array;
        const sizes = sizeAttribute.array as Float32Array;
        const originalColors = originalColorsRef.current;
        const originalSizes = originalSizesRef.current;
        const particleStates = particleStatesRef.current;
        
        let needsUpdate = false;
        
        // Update each particle's state
        for (let i = 0; i < particleStates.length; i++) {
          const state = particleStates[i];
          
                     // Check if it's time to change this particle's target state
           if (currentTime > state.nextChangeTime) {
             // Randomly decide if this particle should be lit (0.3% chance for very subtle effect)
             state.targetLit = Math.random() < 0.001;
             // Set next change time (1-3 seconds from now for shorter intervals)
             state.nextChangeTime = currentTime + 1 + Math.random() * 2;
           }
          
                     // Smoothly interpolate towards target state (faster fade)
           const targetAmount = state.targetLit ? 1 : 0;
           const fadeSpeed = state.fadeSpeed * delta * 6; // Much faster fade speed
          
          if (Math.abs(state.litAmount - targetAmount) > 0.01) {
            if (state.litAmount < targetAmount) {
              state.litAmount = Math.min(1, state.litAmount + fadeSpeed);
            } else {
              state.litAmount = Math.max(0, state.litAmount - fadeSpeed);
            }
            needsUpdate = true;
          }
          
                     // Apply the interpolated lighting effect
           const colorIndex = i * 3;
           const litFactor = state.litAmount;
           
           // Make lit particles pure white (stronger effect)
           if (litFactor > 0) {
             colors[colorIndex] = originalColors[colorIndex] + (1 - originalColors[colorIndex]) * litFactor;
             colors[colorIndex + 1] = originalColors[colorIndex + 1] + (1 - originalColors[colorIndex + 1]) * litFactor;
             colors[colorIndex + 2] = originalColors[colorIndex + 2] + (1 - originalColors[colorIndex + 2]) * litFactor;
           } else {
             colors[colorIndex] = originalColors[colorIndex];
             colors[colorIndex + 1] = originalColors[colorIndex + 1];
             colors[colorIndex + 2] = originalColors[colorIndex + 2];
           }
           
           // Scale sizes appropriately for shader
           const originalSize = originalSizes[i];
           const litSize = 0.4 + Math.random() * 0.15; // Lit: 0.4-0.55 (a little bigger than normal 0.25-0.35)
           sizes[i] = originalSize + (litSize - originalSize) * litFactor;
        }
        
        // Mark attributes as needing update if any particle changed
        if (needsUpdate) {
          colorAttribute.needsUpdate = true;
          sizeAttribute.needsUpdate = true;
        }
      }
    }
  });

  return (
    <group ref={groupRef} position={[offsetX, offsetY, 0]} rotation={[0, rotationY, 0]}>
      <points 
        geometry={geometry} 
        material={material}
        ref={(points) => {
          if (points) {
            geometryRef.current = points.geometry;
          }
        }}
      />
    </group>
  );
} 