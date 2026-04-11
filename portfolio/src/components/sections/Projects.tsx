import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, ExternalLink, Info, X, Cpu, Code2, Rocket } from 'lucide-react';

interface Project {
  title: string;
  description: string;
  image: string;
  tech: string[];
  github: string;
  link: string;
  details: {
    architecture: string;
    features: string[];
    stack: string[];
  };
}

const projects: Project[] = [
  {
    title: "Career Compass AI",
    description: "Production-grade career guidance platform with AI-powered skill assessments, personalized learning paths, and an intelligent career assistant. Built with a scalable microservices architecture.",
    image: "/src/assets/career_compass.png",
    tech: ["FastAPI", "React", "Docker", "MySQL", "Redis"],
    github: "#",
    link: "#",
    details: {
      architecture: "Microservices-based architecture focused on AI scalability and high-availability data processing.",
      features: [
        "Natural Language Skill Analysis",
        "Personalized Learning Path Generation",
        "Floating GPT-4o Career Assistant",
        "Admin Dashboard with Bulk Analytics"
      ],
      stack: ["Python (FastAPI)", "React 18 + Vite", "Docker Compose", "Redis Caching", "Nginx Load Balancing"]
    }
  },
  {
    title: "Ruchi Ragam",
    description: "Full-stack SaaS marketplace for authentic Indian food. Features dual-gateway payments (Stripe/Razorpay), AI-driven search, and robust JWT auth. Built with a clean microservices-ready architecture.",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080&auto=format&fit=crop",
    tech: ["Node.js", "Express", "Supabase", "TypeScript", "OpenAI"],
    github: "#",
    link: "#",
    details: {
      architecture: "Clean Architecture implementation in Node.js with a monorepo structure and Supabase/Postgres backend.",
      features: [
        "AI-Powered Smart Search",
        "Dual Payment Gateway Integration",
        "Automated Product Descriptions",
        "Real-time Order Tracking & State Management"
      ],
      stack: ["Node.js 20 LTS", "Express.js", "TypeScript", "Supabase (Postgres)", "OpenAI GPT-4o"]
    }
  },
  {
    title: "Portfolio (Current)",
    description: "This very developer portfolio featuring glassmorphism, Aurora backgrounds, and full-page scroll snapping. Optimized for 60 FPS performance.",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
    tech: ["Vite", "React", "TypeScript", "Framer Motion"],
    github: "#",
    link: "#",
    details: {
      architecture: "Single Page Application (SPA) optimized for high-fidelity animations and scroll-snap synchronization.",
      features: [
        "Full-Page Scroll Snapping",
        "Aurora Mesh Gradient Engine",
        "Staggered Wave Animations",
        "Glassmorphism Design System"
      ],
      stack: ["Vite + React", "Framer Motion", "Vanilla CSS3", "Lucide React"]
    }
  }
];

const Projects = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: 40 },
    show: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <section id="projects" className="section-wrap">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.1 }}
        className="w-full"
      >
        <motion.div variants={item} className="section-header text-center">
          <h2 className="text-4xl font-bold">Featured <span className="text-gradient">Projects</span></h2>
          <p className="text-[var(--text-secondary)] mt-4 max-w-xl mx-auto">
            A selection of projects that showcase my ability to solve complex technical problems 
            and deliver beautiful user experiences.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 mt-8">
          {projects.map((project) => (
            <motion.div
              key={project.title}
              variants={item}
              className="glass project-card hover-lift"
            >
              <div className="project-img-wrap">
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="project-img"
                />
              </div>

              <div className="project-info">
                <div className="project-text">
                  <h3 className="text-2xl font-bold">{project.title}</h3>
                  <p className="text-[var(--text-secondary)] text-sm mt-4">
                    {project.description}
                  </p>
                </div>

                <div className="tech-list flex gap-2">
                  {project.tech.map(t => (
                    <span key={t} className="tech-pill">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="project-links flex items-center justify-between mt-4">
                  <div className="flex gap-4">
                    <a href={project.github} className="social-icon">
                      <Github size={20} />
                    </a>
                    <a href={project.link} className="social-icon">
                      <ExternalLink size={20} />
                    </a>
                  </div>
                  <button 
                    onClick={() => setSelectedProject(project)}
                    className="flex items-center gap-2 text-[var(--accent-cyan)] font-bold text-sm bg-transparent border-none cursor-pointer hover:brightness-125"
                  >
                    View Details <Info size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedProject && (
          <div className="modal-overlay" onClick={() => setSelectedProject(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass modal-content" 
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close" onClick={() => setSelectedProject(null)}>
                <X size={20} />
              </button>

              <div className="modal-section">
                <p className="modal-subtitle">Project Overview</p>
                <h2 className="modal-title">{selectedProject.title}</h2>
                <p className="modal-desc">{selectedProject.description}</p>
              </div>

              <div className="modal-section">
                <p className="modal-subtitle">Architecture & Core Logic</p>
                <div className="detail-item mb-4" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--accent-cyan)' }}>
                  <Cpu size={18} />
                  {selectedProject.details.architecture}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="modal-section">
                  <p className="modal-subtitle">Key Features</p>
                  <ul className="detail-list" style={{ gridTemplateColumns: '1fr' }}>
                    {selectedProject.details.features.map(f => (
                      <li key={f} className="detail-item">
                        <Rocket size={14} color="var(--accent-cyan)" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="modal-section">
                  <p className="modal-subtitle">Technical Stack</p>
                  <ul className="detail-list" style={{ gridTemplateColumns: '1fr' }}>
                    {selectedProject.details.stack.map(s => (
                      <li key={s} className="detail-item">
                        <Code2 size={14} color="var(--accent-cyan)" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                 <a href={selectedProject.github} className="btn-glass" style={{ padding: '0.75rem 1.5rem' }}>
                   Github Source <Github size={18} />
                 </a>
                 <a href={selectedProject.link} className="btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                   Live Demo <ExternalLink size={18} />
                 </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Projects;
