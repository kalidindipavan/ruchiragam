import { motion } from 'framer-motion';
import { ArrowRight, Download, Sparkles } from 'lucide-react';

const Hero = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <section className="hero-content section-wrap">
      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.1 }}
        className="flex flex-col items-center text-center gap-8"
      >
        <motion.div variants={item} className="glass-pill">
          <Sparkles size={14} />
          Available for 2026 Campus Drive
        </motion.div>

        <motion.h1 variants={item} className="hero-title">
          Crafting <span className="text-gradient">Intelligent</span> & <br />
          Scalable Systems.
        </motion.h1>

        <motion.p variants={item} className="hero-desc">
          Full-Stack Developer specializing in high-performance TypeScript applications 
          and AI-driven user experiences. Currently building the future of 
          at <span className="text-white accent-underline">Ruchi Ragam.</span>
        </motion.p>

        <motion.div variants={item} className="flex items-center justify-center gap-4 mt-4">
          <a href="#projects" className="btn-primary">
            View Projects <ArrowRight size={18} />
          </a>
          <a href="#resume" className="btn-glass">
            Get Resume <Download size={18} />
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
