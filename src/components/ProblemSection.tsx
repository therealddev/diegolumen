import { motion } from 'motion/react';

export default function ProblemSection() {
  return (
    <section className="py-32 relative z-20 min-h-screen">
      <div className="container mx-auto px-6 md:px-10 lg:px-16">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            className="text-8xl font-base mb-8 text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            The Problem
          </motion.h2>
          
          <motion.p 
            className="text-xl text-gray-300 mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            Traditional approaches to data visualization often fail to capture the dynamic, 
            interconnected nature of complex biological structures.
          </motion.p>
          
          <motion.p 
            className="text-lg text-gray-400"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            Our DNA-like particle system addresses this by creating immersive, 
            interactive visualizations that reveal patterns and relationships 
            in ways static representations cannot.
          </motion.p>
        </div>
      </div>
    </section>
  );
} 