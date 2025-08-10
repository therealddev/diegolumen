export default function Hero() {
  return (
    <section className="min-h-screen flex items-center relative z-20">
      <div className="container mx-auto px-6 md:px-10 lg:px-16">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-bold mb-4">DNA-like Particle Sheet</h1>
          <p className="text-xl text-gray-300">
            Scroll to rotate the DNA helix and pan vertically. When you stop scrolling, watch it slowly auto-rotate. Notice the smooth interpolation and varying levels of torsion creating a DNA-like structure.
          </p>
          <div className="mt-8 text-gray-400">
            <p>Experience the mesmerizing spiral effect</p>
            <p>Scroll down to explore</p>
          </div>
        </div>
      </div>
    </section>
  );
} 