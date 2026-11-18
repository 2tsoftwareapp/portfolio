'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { personalInfo, navLinks, uiStrings } from '@/lib/config';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  // Close menu on resize if screen becomes large
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] border-b border-border bg-background/95 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="bg-primary text-primary-foreground px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider">
              NORMAL
            </span>
            <a href="/" className="text-base sm:text-lg font-bold font-mono tracking-tight text-foreground hover:text-primary transition-colors duration-200">
              ~/{uiStrings.common.logo.toLowerCase()}
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-5">
            {navLinks.map(({ label, href }, index) => (
              <a
                key={label}
                href={href}
                className="relative font-mono text-xs text-muted-foreground hover:text-primary transition-colors group"
              >
                [{index + 1}:{label}]
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary transition-all duration-200 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: '100vh' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-0 top-16 z-[90] bg-background md:hidden overflow-hidden"
          >
            <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] px-4">
              <div className="flex flex-col items-start gap-8 min-w-[200px]">
                {navLinks.map(({ label, href }, index) => (
                  <motion.a
                    key={label}
                    href={href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setIsOpen(false)}
                    className="text-2xl font-mono font-bold uppercase tracking-widest text-foreground hover:text-primary transition-all duration-300 text-left flex items-baseline group"
                  >
                    <span className="text-muted-foreground/20 mr-4 text-sm font-medium">0{index + 1} //</span>
                    <span className="relative">
                      {label}
                      <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full" />
                    </span>
                  </motion.a>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-12 left-0 right-0 text-center"
              >
                <p className="text-xs font-mono text-muted-foreground/50 uppercase tracking-[0.2em]">
                  {personalInfo.email}
                </p>
              </motion.div>


            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}