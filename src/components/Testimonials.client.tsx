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
          <p className="font-mono text-xs text-primary mb-2">
            truongdq@oxide-node:~$ tail -n 3 /var/log/peer-reviews.log
          </p>
          <div className="flex items-center gap-3 mb-3">
            <Quote className="h-7 w-7 text-primary flex-shrink-0" />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-mono">
              Testimonials
            </h2>
          </div>
          <p className="text-sm text-muted-foreground font-mono">
            # What People Say About Working With Me
          </p>
        </motion.div>

        {/* Testimonials grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {testimonialsData.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-card p-6 rounded-none border border-border hover:border-primary/60 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-border pb-3 mb-4 font-mono text-xs">
                  <span className="text-primary font-bold">[ACK // PEER_REVIEW]</span>
                  <Quote className="h-4 w-4 text-primary" />
                </div>
                <p className="text-muted-foreground font-mono text-sm mb-6 leading-relaxed">"{testimonial.quote}"</p>
              </div>
              <div className="pt-3 border-t border-border font-mono">
                <p className="font-bold text-sm text-foreground">{testimonial.author}</p>
                <p className="text-xs text-primary mt-0.5">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
