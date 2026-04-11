import { motion } from 'framer-motion';
import { Download, FileText, CheckCircle2 } from 'lucide-react';

const ResumeSection = () => {
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
    hidden: { opacity: 0, y: 40 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <section id="resume" className="section-wrap">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.1 }}
        className="w-full"
      >
        <motion.div variants={item} className="section-header text-center" style={{ marginBottom: '4rem' }}>
          <h2 className="text-4xl font-bold">Professional <span className="text-gradient">Resume</span></h2>
          <p className="text-[var(--text-secondary)] mt-4 max-w-xl mx-auto">
            A summary of my engineering background, technical expertise, and 
            career readiness as a 2026 graduate.
          </p>
        </motion.div>

        <motion.div variants={item} className="glass resume-card">
          {/* Glow decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-purple)] opacity-10 blur-[100px]" />
          
          <div className="resume-layout">
            <div className="resume-info">
              <div className="glass-pill">
                <FileText size={14} /> Resume Summary
              </div>
              
              <h2 className="text-4xl mt-4">
                Ready to bring <span className="text-gradient">Innovation</span> to your engineering team.
              </h2>
              
              <p className="text-[var(--text-secondary)] mt-4">
                Based on my 2026 graduation as a Software Developer, I've specialized in full-stack 
                development with a strong emphasis on scalable background systems and intuitive frontend design.
              </p>

              <ul className="skill-list-bullets mt-8">
                {['B.Tech in Computer Science', 'Specialization in Full Stack Development', 'Proficient in Night-Shift US Projects'].map(item => (
                  <li key={item} className="bullet-item">
                    <CheckCircle2 size={18} color="var(--accent-cyan)" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <a 
                  href="/formal_resume.pdf" 
                  download
                  className="btn-primary"
                >
                  Download Master Resume <Download size={18} />
                </a>
              </div>
            </div>

            <div className="glass mock-resume-preview">
               <div className="mock-content-shim">
                  <div className="shim-line" style={{ width: '80%' }} />
                  <div className="shim-line" style={{ width: '60%' }} />
                  <div className="shim-line mt-4" style={{ width: '100%' }} />
                  <div className="shim-line" style={{ width: '90%' }} />
               </div>
               <div className="text-center">
                  <p className="text-lg font-bold">2026 Graduate <br/> <span className="text-[var(--accent-cyan)]">Software Developer</span></p>
               </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default ResumeSection;
