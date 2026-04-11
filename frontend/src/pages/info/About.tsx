import { motion } from 'framer-motion';
import { Heart, Leaf, ShieldCheck, Utensils } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';

export default function About() {
  const values = [
    {
      icon: <Leaf className="h-6 w-6 text-[var(--saffron-500)]" />,
      title: '100% Natural Ingredients',
      description: 'We source only the freshest organic spices and farm-grown produce. No artificial preservatives or colors—ever.',
    },
    {
      icon: <Utensils className="h-6 w-6 text-[var(--saffron-500)]" />,
      title: 'Authentic Heritage',
      description: 'Every jar contains centuries-old recipes passed down through generations of grandmothers, capturing the true essence of India.',
    },
    {
      icon: <Heart className="h-6 w-6 text-[var(--saffron-500)]" />,
      title: 'Handcrafted with Love',
      description: 'Our products are not made in a massive factory. They are sun-dried, hand-mixed, and bottled in small batches with absolute care.',
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-[var(--saffron-500)]" />,
      title: 'Uncompromising Quality',
      description: 'From the quality of the cold-pressed oils to the tightly sealed glass jars, we guarantee hygiene and premium quality.',
    },
  ];

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-primary)] via-transparent to-[var(--bg-primary)] z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1596541617429-083ae89e24ec?q=80&w=2670&auto=format&fit=crop" 
            alt="Indian spices and ingredients" 
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <div className="inline-block px-4 py-1.5 mb-6 rounded-full border border-[var(--saffron-500)] bg-[var(--saffron-500)]/10 text-[var(--saffron-500)] text-sm font-bold tracking-widest uppercase">
              Our Heritage
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-black text-[var(--text-primary)] mb-6 leading-tight">
              The Taste of <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--saffron-400)] to-[var(--saffron-600)]">Tradition</span>
            </h1>
            <p className="text-xl text-[var(--text-secondary)] leading-relaxed">
              At Ruchi Ragam, we aren't just selling food. We are preserving the rich, vibrant, and incredibly diverse culinary artistry of authentic Indian homes.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full md:w-1/2 relative group"
          >
             <div className="absolute -inset-4 bg-gradient-to-r from-[var(--saffron-500)]/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition duration-500 opacity-70"></div>
             <img 
               src="https://images.unsplash.com/photo-1628294895950-9805252327bc?q=80&w=2670&auto=format&fit=crop" 
               alt="Aged pickles in a jar" 
               className="relative rounded-2xl shadow-2xl border border-[var(--border-subtle)] w-full object-cover h-[500px]"
             />
             <div className="absolute -bottom-6 -right-6 bg-[var(--bg-elevated)] p-6 rounded-xl border border-[var(--border-strong)] shadow-xl hidden md:block">
                <div className="text-4xl font-display font-black text-[var(--saffron-500)]">25+</div>
                <div className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Years of Heritage</div>
             </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full md:w-1/2 space-y-6"
          >
            <h2 className="text-4xl font-display font-bold text-[var(--text-primary)]">Rooted in Authenticity</h2>
            <div className="space-y-4 text-lg text-[var(--text-secondary)] leading-relaxed">
              <p>
                Ruchi Ragam was born from a simple realization: the true magic of Indian cuisine isn't found in a factory aisle; it's found in the ceramic jaadis (jars) sitting in a grandmother's sunny courtyard.
              </p>
              <p>
                What started as a small endeavor to share our family's secret Mango pickle recipe has blossomed into a marketplace celebrating homemade culinary mastery. We work directly with generational home-chefs, empowering them to bottle their regional specialties.
              </p>
              <p>
                Whether it is the fiery red Avakaya from Andhra or the deeply aromatic Garam Masala from the North, every single product we curate represents an authentic slice of Indian nostalgia.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-[var(--bg-elevated)] border-y border-[var(--border-subtle)] mt-12">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-display font-bold text-[var(--text-primary)] mb-4">Our Promise to You</h2>
            <p className="text-[var(--text-secondary)]">We refuse to cut corners. Here is the philosophy that goes into every jar we ship.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-[var(--bg-card)] p-8 rounded-2xl border border-[var(--border-subtle)] hover:border-[var(--saffron-500)]/50 transition-colors shadow-sm hover:shadow-md"
              >
                <div className="h-14 w-14 rounded-full bg-[var(--saffron-500)]/10 flex items-center justify-center mb-6">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">{item.title}</h3>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-card)] p-12 rounded-3xl border border-[var(--border-strong)] relative overflow-hidden">
           <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-[var(--saffron-500)] blur-[100px] opacity-20 rounded-full"></div>
           <h2 className="text-3xl md:text-5xl font-display font-black text-[var(--text-primary)] mb-6 relative z-10">Taste the Difference</h2>
           <p className="text-lg text-[var(--text-secondary)] mb-8 relative z-10 max-w-xl mx-auto">
             Ready to elevate your meals with authentic, traditional flavors? Explore our handcrafted catalog right now.
           </p>
           <Link to="/products" className="relative z-10 inline-block">
             <Button className="h-14 px-8 text-lg font-bold bg-[var(--saffron-500)] hover:bg-[var(--saffron-600)] text-black rounded-full shadow-lg shadow-[var(--saffron-500)]/20 hover:scale-105 transition-transform">
                Explore Our Menu
             </Button>
           </Link>
        </div>
      </section>
    </div>
  );
}
