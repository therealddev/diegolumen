import { motion } from 'motion/react';
import marcosImg from '../assets/team/marcos.png';
import franciscoImg from '../assets/team/francisco.png';
import juliaImg from '../assets/team/julia.png';
import nicolasImg from '../assets/team/nicolas.png';

const teamMembers = [
  { name: 'Marcos', image: marcosImg },
  { name: 'Francisco', image: franciscoImg },
  { name: 'Julia', image: juliaImg },
  { name: 'Nicolas', image: nicolasImg },
];

export default function Team() {
  return (
    <section className="py-20 bg-gray-100 relative z-20">
      <div className="container mx-auto px-6 md:px-10 lg:px-16">
        <motion.h2 
          className="text-4xl font-medium mb-12 text-center text-gray-800"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          Our Team
        </motion.h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {teamMembers.map((member, index) => (
            <motion.div 
              key={member.name}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <div className="aspect-[3/4] mb-4 overflow-hidden">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-medium text-gray-800 text-left">
                {member.name}
              </h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 