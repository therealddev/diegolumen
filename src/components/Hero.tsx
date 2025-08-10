import { motion } from 'motion/react';

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center relative z-20">
      <div className="container mx-auto px-6 md:px-10 lg:px-16">
        <div className="max-w-3xl">
          <motion.h1 
            className="text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            DNA-like Particle Sheet
          </motion.h1>
          
          <motion.p 
            className="text-xl text-gray-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          >
            Scroll to rotate the DNA helix and pan vertically. When you stop scrolling, watch it slowly auto-rotate. Notice the smooth interpolation and varying levels of torsion creating a DNA-like structure.
          </motion.p>
          
          <div className="mt-4 text-gray-400">
            <motion.button 
              className="bg-yellow-400 text-white px-4 py-2 rounded-md mt-4 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.2),inset_-2px_-2px_4px_rgba(255,255,255,0.1)] hover:shadow-[inset_2px_2px_6px_rgba(255,255,255,0.3),inset_-2px_-2px_6px_rgba(255,255,255,0.2)] transition-shadow duration-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            >
              Learn more
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
} 