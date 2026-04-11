import { motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/sections/Hero';
import Projects from './components/sections/Projects';
import Skills from './components/sections/Skills';
import ResumeSection from './components/sections/ResumeSection';

function App() {
  return (
    <div className="relative min-h-screen">
      {/* 🔮 Background Effects */}
      <div className="aurora-bg" />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,var(--accent-cyan)_0%,transparent_20%)] opacity-20" />
      
      <Navbar />
      
      <main className="container">
        <Hero />
        <Projects />
        <Skills />
        <ResumeSection />
        
        <footer className="section-wrap flex items-center justify-center text-center text-sm text-[var(--text-secondary)] border-t border-[var(--border-glass)]" style={{ minHeight: '30vh' }}>
          <p>© 2026 Developer Portfolio. Built with React & TypeScript.</p>
        </footer>
      </main>
    </div>
  );
}

export default App;
