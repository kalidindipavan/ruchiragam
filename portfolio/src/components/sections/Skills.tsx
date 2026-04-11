import { motion } from 'framer-motion';

const skillCategories = [
  {
    name: "Frontend",
    skills: ["React", "TypeScript", "Next.js", "Vite", "Zustand", "React Query"]
  },
  {
    name: "Backend",
    skills: ["Node.js", "Express.js", "PostgreSQL", "Supabase", "Auth (JWT)"]
  },
  {
    name: "Tools",
    skills: ["Git", "Docker", "Linux", "Postman", "GitHub Actions"]
  }
];

const Skills = () => {
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
    hidden: { opacity: 0, x: -40 },
    show: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <section id="skills" className="section-wrap">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.1 }}
        className="w-full"
      >
        <motion.div variants={item} className="section-header text-center">
          <h2 className="text-4xl font-bold">Expertise & <span className="text-gradient">Tools</span></h2>
          <p className="text-[var(--text-secondary)] mt-4 max-w-xl mx-auto">
            A comprehensive overview of my technical stack and the technologies I use 
            to build modern, high-performance applications.
          </p>
        </motion.div>

        <div className="grid grid-cols-3 mt-8">
          {skillCategories.map((category) => (
            <motion.div
              key={category.name}
              variants={item}
              className="glass skill-category-card hover-lift"
            >
              <h3 className="category-title">
                {category.name}.
              </h3>
              <div className="skill-tags">
                {category.skills.map((skill) => (
                  <div 
                    key={skill}
                    className="skill-tag"
                  >
                    {skill}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default Skills;
