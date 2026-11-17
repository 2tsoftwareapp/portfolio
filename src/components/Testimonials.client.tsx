'use client';

import { motion, type Variants } from 'framer-motion';
import { useSafeReducedMotion } from '@/hooks/useSafeReducedMotion';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Quote } from 'lucide-react';
import { testimonialsData } from '@/lib/config';

export function TestimonialsClient() {
  const { ref: sectionRef, isIntersecting: isInView } = useIntersectionObserver<HTMLElement>({
    threshold: 0.1,
    freezeOnceVisible: true,
  });
  const shouldReduceMotion = useSafeReducedMotion();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.5,
        ease: 'easeOut',
      },
    },
  };

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-border bg-background"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-4 flex items-center gap-4">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary">
              [05 // ENDORSEMENTS]
            </span>
            <div className="h-px flex-1 bg-border" aria-hidden="true" />
          </div>
          <div className="flex items-center gap-3 mb-3">
            <Quote className="h-7 w-7 text-primary flex-shrink-0" />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              Testimonials
            </h2>
          </div>
          <p className="text-sm text-muted-foreground uppercase tracking-widest font-mono">
            What People Say About Working With Me
          </p>
        </motion.div>

        {/* Testimonials grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-l border-border"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {testimonialsData.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="border-r border-b border-border bg-card p-6 rounded-none flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/60">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                    REF.0{index + 1}
                  </span>
                  <Quote className="h-4 w-4 text-primary" />
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">"{testimonial.quote}"</p>
              </div>
              <div className="pt-4 border-t border-border/60">
                <p className="font-bold font-mono text-sm text-foreground">{testimonial.author}</p>
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mt-1">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
