import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import Lenis from 'lenis';
import ParticleSheetScene from '../components/ParticleSheetScene';
import Hero from '../components/Hero';
import ProblemSection from '../components/ProblemSection';
import SolutionSection from '../components/SolutionSection';
import Team from '../components/Team';
import Hero2 from '../components/Hero2';

export default function Home() {
  const [scrollPercent, setScrollPercent] = useState(0);
  const [rotationY, setRotationY] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  
  // Refs to access current state values in stable callbacks
  const setScrollPercentRef = useRef(setScrollPercent);
  const setRotationYRef = useRef(setRotationY);
  const setOffsetYRef = useRef(setOffsetY);
  
  // Update refs when setters change
  setScrollPercentRef.current = setScrollPercent;
  setRotationYRef.current = setRotationY;
  setOffsetYRef.current = setOffsetY;

  const palette = useMemo(() => [
    "#22c55e",   // Green
    "#3b82f6",   // Blue
    "#ec4899",   // Pink
    "#22d3ee",   // Cyan
    "#ffffff"    // White (new)
  ], []);

  // Smooth scrolling data - not state to avoid re-renders
  const smoothData = useRef({
    ease: 0.001, // Ultra-slow interpolation for settling (was 0.0015)
    activeScrollEase: 0.15, // Fast response during active scrolling
    current: 0,
    target: 0,
    rounded: 0,
    // Rotation smoothing
    currentRotation: 0,
    targetRotation: 0,
    // Offset smoothing  
    currentOffset: 0,
    targetOffset: 0,
    // Auto-rotation when idle
    lastScrollTime: Date.now(),
    autoRotationSpeed: -0.00015, // Ultra-slow auto-rotation (was -0.0002)
    isScrolling: false,
    autoRotationOffset: 0, // Additional rotation for auto-rotate
  });

  // Update scroll targets on Lenis scroll
  const handleScrollRef = useRef((lenis: Lenis) => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const currentScroll = lenis.scroll;
    const newScrollPercent = Math.min(100, Math.max(0, (currentScroll / scrollHeight) * 100));
    
    // Update targets (what we want to reach)
    smoothData.current.target = currentScroll;
    
    // Calculate target rotation and offset
    const turnsPerPx = 1 / 800; // Reduced from 1200 to 800 for more rotation
    smoothData.current.targetRotation = currentScroll * turnsPerPx * Math.PI * -1.2; // Increased from -0.7 to -1.2
    
    const worldUnitsPerPx = 0.02;
    smoothData.current.targetOffset = currentScroll * worldUnitsPerPx;
    
    // Track scrolling state
    smoothData.current.lastScrollTime = Date.now();
    smoothData.current.isScrolling = true;
    
    setScrollPercentRef.current(newScrollPercent);
  });

  const handleScroll = handleScrollRef.current;

  // Animation loop using useRef to avoid infinite recursion
  const animationRef = useRef<number>();
  
  const smoothScrollLoopRef = useRef(() => {
    const data = smoothData.current;
    const now = Date.now();
    
    // Check if we've stopped scrolling (no scroll for 200ms)
    if (now - data.lastScrollTime > 200) {
      data.isScrolling = false;
    }
    
    // Use different ease values: fast during scroll, slow when settling
    const currentEase = data.isScrolling ? data.activeScrollEase : data.ease;
    
    // Lerp (linear interpolation) towards targets
    data.current += (data.target - data.current) * currentEase;
    data.currentRotation += (data.targetRotation - data.currentRotation) * currentEase;
    data.currentOffset += (data.targetOffset - data.currentOffset) * currentEase;
    
    // Add automatic rotation when not scrolling
    if (!data.isScrolling) {
      data.autoRotationOffset += data.autoRotationSpeed;
    }
    
    data.rounded = Math.round(data.current * 100) / 100;
    
    // Update states with smoothed values + auto rotation
    setRotationYRef.current(data.currentRotation + data.autoRotationOffset);
    setOffsetYRef.current(data.currentOffset);
    
    // Continue the loop with proper cleanup
    animationRef.current = requestAnimationFrame(smoothScrollLoopRef.current);
  });

  const smoothScrollLoop = smoothScrollLoopRef.current;

  useEffect(() => {
    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    // Start the smooth animation loop
    animationRef.current = requestAnimationFrame(smoothScrollLoop);
    
    // Handle Lenis scroll events
    lenis.on('scroll', (e) => {
      handleScroll(e);
    });

    // Initial call with current scroll position
    handleScroll(lenis);
    
    // Lenis animation loop
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    
    return () => {
      lenis.destroy();
      // Clean up animation loop
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []); // Empty dependency array - only run once!

  return (
    <div className="min-h-screen text-white relative bg-[#1d1d1d]">
      {/* Background Scene across the whole page */}
      <ParticleSheetScene 
        width={10}
        height={100}
        particleCount={50000} 
        torsionStrength={45.0}
        color1="#3b82f6" 
        color2="#ec4899"
        rotationY={rotationY}
        offsetX={3}
        offsetY={offsetY}
        // DNA-like torsion parameters - much more spiraly
        dnaMode={true}
        baseTorsion={8.5}
        nodesCount={35}
        nodeWidth={0.025}
        nodeStrength={16.0}
        alternateDirection={true}
        maxAngleRadians={10.0}
        // Random multi-hue palette with stable list and intensity variation
        colorPalette={palette}
        paletteMode="random"
        paletteBands={18}
        intensityJitter={0.6}
      />

      {/* Space Section 1 */}
      <section className="min-h-screen flex items-center relative z-20">
        <div className="container mx-auto px-6 md:px-10 lg:px-16">
          <div className="max-w-4xl">
            <h2 className="text-4xl font-bold mb-6">DNA Particle Visualization</h2>
            <p className="text-xl mb-6 text-gray-300">
              Scroll to rotate and explore the DNA helix structure. Watch the particles twist and flow in response to your movement.
            </p>
          </div>
        </div>
      </section>

      {/* Space Section 2 */}
      <section className="min-h-screen flex items-center relative z-20">
        <div className="container mx-auto px-6 md:px-10 lg:px-16">
          <div className="max-w-4xl">
            <h2 className="text-4xl font-bold mb-6">Interactive Animation</h2>
            <p className="text-xl mb-6 text-gray-300">
              The smooth interpolation creates fluid motion. Try different scroll speeds to see various rotation effects.
            </p>
          </div>
        </div>
      </section>

      {/* Space Section 3 */}
      <section className="min-h-screen flex items-center relative z-20">
        <div className="container mx-auto px-6 md:px-10 lg:px-16">
          <div className="max-w-4xl">
            <h2 className="text-4xl font-bold mb-6">Keep Scrolling</h2>
            <p className="text-xl mb-6 text-gray-300">
              More space to explore the DNA structure. Notice how the auto-rotation continues when you stop scrolling.
            </p>
          </div>
        </div>
      </section>

      {/* Space Section 4 */}
      <section className="min-h-screen flex items-center relative z-20">
        <div className="container mx-auto px-6 md:px-10 lg:px-16">
          <div className="max-w-4xl">
            <h2 className="text-4xl font-bold mb-6">Extended View</h2>
            <p className="text-xl mb-6 text-gray-300">
              Even more space to appreciate the full range of the DNA helix animation and particle effects.
            </p>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      {/* <Hero /> */}
      {/* <Hero2 /> */}

      {/* Problem Section */}
      {/* <ProblemSection /> */}

      {/* Solution Section */}
      {/* <SolutionSection /> */}

      {/* Team Section */}
      {/* <Team /> */}

      {/* Additional Content */}
      {/* <section className="min-h-screen flex items-center relative z-20">
        <div className="container mx-auto px-6 md:px-10 lg:px-16">
          <div className="max-w-4xl">
            <h2 className="text-3xl font-bold mb-6">About This DNA Visualization</h2>
            <p className="text-xl mb-6 text-gray-300">
              The sheet uses a combination of continuous base torsion with stronger localized torsion at specific points, enhanced with smooth scroll interpolation and automatic rotation.
            </p>
            <p className="text-xl mb-6 text-gray-300">
              This creates areas of little torsion with specific points of stronger torsion, mimicking the characteristic structure of DNA with buttery smooth animations that continue even when you're not scrolling.
            </p>
          </div>
        </div>
      </section> */}
    </div>
  );
}