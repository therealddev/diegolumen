import radiologyImg from '../assets/projects/radiology.png';
import trackingImg from '../assets/projects/tracking.png';
import taskyImg from '../assets/projects/tasky.png';

export default function AllProjects() {
  return (
    <div className="min-h-screen bg-white py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-light mb-12 text-left">All Projects</h1>
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
            },
            {
              name: "Heart AI",
              placeholder: true
            },
            {
              name: "Dental AI",
              placeholder: true
            },
            {
              name: "Microplastics",
              placeholder: true
            },
            {
              name: "Bioworms",
              placeholder: true
            },
            {
              name: "Cortisol",
              placeholder: true
            },
            {
              name: "FaceAge",
              placeholder: true
            },
            {
              name: "AR Surgery",
              placeholder: true
            },
            {
              name: "Game",
              placeholder: true
            },
            {
              name: "GlucoseLaser",
              placeholder: true
            },
            {
              name: "AlzheimerEye",
              placeholder: true
            },
            {
              name: "XDefense",
              placeholder: true
            },
            {
              name: "CleanAir",
              placeholder: true
            },
            {
              name: "HealthAlgorithm",
              placeholder: true
            },
            {
              name: "AstroMind",
              placeholder: true
            },
            {
              name: "BacterAI",
              placeholder: true
            },
            {
              name: "Vertigo",
              placeholder: true
            },
            {
              name: "Youth",
              placeholder: true
            },
            {
              name: "CureMiopia",
              placeholder: true
            }
          ].map((project) => (
            <div key={project.name} className="group cursor-pointer">
              <div className={`mb-4 overflow-hidden rounded-lg shadow-sm group-hover:shadow-md transition-shadow ${
                project.isTasky ? 'p-8' : ''
              }`} style={project.isTasky ? { backgroundColor: '#f0f0f0' } : {}}>
                {project.placeholder ? (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">Coming Soon</span>
                  </div>
                ) : (
                  <img 
                    src={project.image} 
                    alt={project.name}
                    className={`object-cover group-hover:scale-105 transition-transform duration-300 ${
                      project.isTasky ? 'w-32 h-32 mx-auto' : 'w-full h-48'
                    }`}
                  />
                )}
              </div>
              <p className="text-lg font-light text-gray-700 text-left">{project.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 