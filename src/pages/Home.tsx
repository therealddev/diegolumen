import { Link } from 'react-router-dom';
import radiologyImg from '../assets/projects/radiology.png';
import trackingImg from '../assets/projects/tracking.png';
import taskyImg from '../assets/projects/tasky.png';

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-5xl md:text-7xl font-light mb-6 leading-tight">
          Diego Lumen
        </h1>
      </div>
      
      <div className="max-w-4xl mx-auto mb-12">
        <h2 className="text-3xl font-light mb-8 text-center">Featured Projects</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: "Radiology",
              image: radiologyImg
            },
            {
              name: "Tracking", 
              image: trackingImg
            },
            {
              name: "Tasky",
              image: taskyImg,
              isTasky: true
            }
          ].map((project) => (
            <div key={project.name} className="text-center group cursor-pointer">
              <div className={`mb-4 overflow-hidden rounded-lg shadow-sm group-hover:shadow-md transition-shadow ${
                project.isTasky ? 'p-8' : ''
              }`} style={project.isTasky ? { backgroundColor: '#f0f0f0' } : {}}>
                <img 
                  src={project.image} 
                  alt={project.name}
                  className={`object-cover group-hover:scale-105 transition-transform duration-300 ${
                    project.isTasky ? 'w-32 h-32 mx-auto' : 'w-full h-48'
                  }`}
                />
              </div>
              <p className="text-lg font-light text-gray-700">{project.name}</p>
            </div>
          ))}
        </div>
      </div>

      <Link 
        to="/all-projects" 
        className="text-gray-600 hover:text-gray-900 transition-colors border-b border-gray-300 hover:border-gray-900"
      >
        View All Projects →
      </Link>
    </div>
  );
}