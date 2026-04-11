import { motion } from 'framer-motion';
import { Menu, X, Github, Linkedin, Mail } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = ['Projects', 'Skills', 'Resume'];

  return (
    <nav className="fixed-nav-wrapper">
      <div className="glass navbar-inner">
        <span className="nav-logo text-gradient">Devendra</span>
        
        <div className="nav-links flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="nav-item"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="nav-actions flex items-center gap-4">
          <Github className="social-icon" />
          <div className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
