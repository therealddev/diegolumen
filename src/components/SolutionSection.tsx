import { motion } from 'motion/react';

export default function SolutionSection() {
  return (
    <section className="py-32 relative z-20 min-h-screen bg-purple-600">
      <div className="container mx-auto px-6 md:px-10 lg:px-16">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            className="text-8xl font-base mb-8 text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            The Solution
          </motion.h2>
          
          <motion.p 
            className="text-xl text-gray-300 mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            We've developed an advanced particle system that mimics the natural structure 
            and movement of DNA, creating truly interactive and immersive visualizations.
          </motion.p>
          
          <motion.p 
            className="text-lg text-gray-400"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            Through innovative torsion algorithms and smooth animation techniques, 
            our system brings complex data structures to life, making them intuitive 
            to understand and explore.
          </motion.p>
        </div>
      </div>
    </section>
  );
} 