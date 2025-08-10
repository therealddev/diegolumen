import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

// Inline shaders from the article
const vertexShader = `
uniform float time;
varying vec2 vUv;
varying vec3 vPosition;
varying float vColorRandom;

attribute float randoms;
attribute float colorRandoms;

void main(){
  vUv = uv;
  vColorRandom = colorRandoms;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = (30.0 * randoms + 5.0) * (1.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
`;

const fragmentShader = `
uniform float time;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;
varying float vColorRandom;

uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;

void main(){
  float alpha = 1.0 - smoothstep(-0.2, 0.5, length(gl_PointCoord - vec2(0.5)));

  vec3 finalColor = uColor1;
  if (vColorRandom > 0.33 && vColorRandom < 0.66) {
    finalColor = uColor2;
  }
  if (vColorRandom > 0.66) {
    finalColor = uColor3;
  }

  float gradient = smoothstep(0.3, 0.7, vUv.y);

  gl_FragColor = vec4(finalColor, alpha * gradient);
}
`;

function createProceduralDnaGeometry(params?: {
  radius?: number;
  height?: number;
  turns?: number;
  alongSegments?: number;
  widthSegments?: number;
  ribbonWidth?: number;
}): THREE.BufferGeometry {
  const radius = params?.radius ?? 0.9;
  const height = params?.height ?? 5.2;
  const turns = params?.turns ?? 7;
  const alongSegments = Math.max(400, params?.alongSegments ?? 1200);
  const widthSegments = Math.max(4, params?.widthSegments ?? 14);
  const ribbonWidth = params?.ribbonWidth ?? 0.28; // visual sheet width per strand

  const twoPi = Math.PI * 2;
  const positions: number[] = [];
  const uvs: number[] = [];

  const baseUp = new THREE.Vector3(0, 1, 0);

  const pushRibbonStrip = (phase: number) => {
    for (let i = 0; i <= alongSegments; i += 1) {
      const t = i / alongSegments; // 0..1
      const theta = t * turns * twoPi + phase;
      const center = new THREE.Vector3(
        radius * Math.cos(theta),
        (t - 0.5) * height,
        radius * Math.sin(theta)
      );

      // Tangent dp/dt
      const dThetaDt = turns * twoPi;
      const tangent = new THREE.Vector3(
        -radius * Math.sin(theta) * dThetaDt,
        height,
        radius * Math.cos(theta) * dThetaDt
      ).normalize();

      // Build a stable normal axis for ribbon width using Gram-Schmidt with baseUp
      const bitangent = new THREE.Vector3().crossVectors(tangent, baseUp).normalize();
      const normal = new THREE.Vector3().crossVectors(bitangent, tangent).normalize();

      for (let j = 0; j <= widthSegments; j += 1) {
        const s = j / widthSegments; // 0..1 across width
        const offset = (s - 0.5) * ribbonWidth;
        const pos = new THREE.Vector3().copy(center).addScaledVector(normal, offset);
        positions.push(pos.x, pos.y, pos.z);
        const uvY = (pos.y + height * 0.5) / height; // 0..1 for gradient
        uvs.push(s, uvY);
      }
    }
  };

  // Two helical ribbons (A and B, out of phase by PI)
  pushRibbonStrip(0);
  pushRibbonStrip(Math.PI);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
  geometry.computeBoundingSphere();
  return geometry;
}

export default function DNAStarsScene() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scene = new THREE.Scene();

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x141414, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(
      70,
      container.clientWidth / container.clientHeight,
      0.001,
      1000
    );
    camera.position.set(-1.5, 3, 4);

    let time = 0;
    let dna: THREE.Points | null = null;
    let starsMesh: THREE.Points | null = null;
    let material: THREE.ShaderMaterial | null = null;

    // Stars
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 500;
    const posArray = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount * 3; i += 1) {
      posArray[i] = (Math.random() + 0.5) * 10 - 10;
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const starsMaterial = new THREE.PointsMaterial({ size: 0.006, color: 0xa9a9a9 });
    starsMesh = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starsMesh);

    const buildMaterial = () =>
      new THREE.ShaderMaterial({
        side: THREE.DoubleSide,
        uniforms: {
          time: { value: 0 },
          uColor1: { value: new THREE.Color(0x0c0317) },
          uColor2: { value: new THREE.Color(0x170624) },
          uColor3: { value: new THREE.Color(0x07112e) },
          resolution: { value: new THREE.Vector4() },
        },
        transparent: true,
        vertexShader,
        fragmentShader,
        depthTest: false,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

    const createPointsFromGeometry = (geometry: THREE.BufferGeometry) => {
      material = buildMaterial();
      const count = geometry.getAttribute('position').array.length as number;
      const randoms = new Float32Array(count / 3);
      const colorRandoms = new Float32Array(count / 3);
      for (let i = 0; i < count / 3; i += 1) {
        randoms[i] = Math.random();
        colorRandoms[i] = Math.random();
      }
      geometry.setAttribute('randoms', new THREE.BufferAttribute(randoms, 1));
      geometry.setAttribute('colorRandoms', new THREE.BufferAttribute(colorRandoms, 1));

      dna = new THREE.Points(geometry, material);
      scene.add(dna);
    };

    // Load DNA GLTF with DRACO. If it fails, use procedural fallback.
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/gltf/');
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    let loaded = false;
    gltfLoader.load(
      '/assets/model/dna.gltf',
      (gltf) => {
        loaded = true;
        const mesh = gltf.scene.children[0] as THREE.Mesh;
        const geometry = (mesh.geometry as THREE.BufferGeometry).clone();
        geometry.center();
        if (!geometry.getAttribute('uv')) {
          // Provide UV.y for gradient if missing
          const pos = geometry.getAttribute('position') as THREE.BufferAttribute;
          const uv = new Float32Array((pos.count) * 2);
          // estimate y range
          let minY = Infinity, maxY = -Infinity;
          for (let i = 0; i < pos.count; i++) {
            const y = pos.getY(i);
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
          const range = Math.max(0.0001, maxY - minY);
          for (let i = 0; i < pos.count; i++) {
            const y = pos.getY(i);
            const ny = (y - minY) / range;
            uv[i * 2 + 0] = 0;
            uv[i * 2 + 1] = ny;
          }
          geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
        }
        createPointsFromGeometry(geometry);
      },
      undefined,
      () => {
        // Fallback to procedural
        const geometry = createProceduralDnaGeometry();
        createPointsFromGeometry(geometry);
      }
    );

    const onResize = () => {
      if (!container) return;
      renderer.setSize(container.clientWidth, container.clientHeight);
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    const onWheel = (event: WheelEvent) => {
      if (dna) dna.rotation.y += event.deltaY * 0.002;
    };
    window.addEventListener('wheel', onWheel, { passive: true });

    let rafId = 0;
    const renderLoop = () => {
      time += 0.05;
      if (dna) dna.rotation.y += 0.001;
      if (starsMesh) starsMesh.rotation.y = time / 25;
      if (material) material.uniforms.time.value = time;

      rafId = requestAnimationFrame(renderLoop);
      renderer.render(scene, camera);
    };
    renderLoop();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('wheel', onWheel);

      if (dna) {
        (dna.geometry as THREE.BufferGeometry).dispose();
      }
      starsGeometry.dispose();
      starsMaterial.dispose();
      material?.dispose();
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
} 