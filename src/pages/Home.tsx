import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import ParticleSheetScene from '../components/ParticleSheetScene';
import Hero from '../components/Hero';

export default function Home() {
  const [scrollPercent, setScrollPercent] = useState(0);
  const [rotationY, setRotationY] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

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

  // Update scroll targets on actual scroll
  const handleScroll = useCallback(() => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const currentScroll = window.scrollY;
    const newScrollPercent = Math.min(100, Math.max(0, (currentScroll / scrollHeight) * 100));
    
    // Update targets (what we want to reach)
    smoothData.current.target = currentScroll;
    
    // Calculate target rotation and offset
    const turnsPerPx = 1 / 1200;
    smoothData.current.targetRotation = currentScroll * turnsPerPx * Math.PI * -0.7;
    
    const worldUnitsPerPx = 0.02;
    smoothData.current.targetOffset = currentScroll * worldUnitsPerPx;
    
    // Track scrolling state
    smoothData.current.lastScrollTime = Date.now();
    smoothData.current.isScrolling = true;
    
    setScrollPercent(newScrollPercent);
  }, []);

  // Smooth animation loop
  const smoothScrollLoop = useCallback(() => {
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
    setRotationY(data.currentRotation + data.autoRotationOffset);
    setOffsetY(data.currentOffset);
    
    // Continue the loop
    requestAnimationFrame(smoothScrollLoop);
  }, []);

  useEffect(() => {
    // Start the smooth animation loop
    requestAnimationFrame(smoothScrollLoop);
    
    // Handle scroll events (just updates targets, doesn't directly update visuals)
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll(); // Initial call
    window.addEventListener('scroll', throttledScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, [handleScroll, smoothScrollLoop]);

  return (
    <div className="min-h-screen text-white relative bg-[#1d1d1d]">
      {/* Background Scene across the whole page */}
      <ParticleSheetScene 
        width={20}
        height={80}
        particleCount={20000} 
        torsionStrength={45.0}
        color1="#3b82f6" 
        color2="#ec4899"
        rotationY={rotationY}
        offsetX={6}
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

      {/* Hero Section */}
      <Hero />

      {/* Additional Content */}
      <section className="min-h-screen flex items-center relative z-20">
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
      </section>
    </div>
  );
}