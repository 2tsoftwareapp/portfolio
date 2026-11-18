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
      className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-border"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sticky Chapter Header */}
          <motion.div
            className="lg:col-span-4 lg:sticky lg:top-28 lg:self-start"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <p className="font-serif italic text-lg text-primary mb-3">
              Chapter V — Critical Reception
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl font-medium mb-4">
              Testimonials
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              What People Say About Working With Me
            </p>
            <div className="w-12 h-0.5 bg-primary mt-6" aria-hidden="true" />
          </motion.div>

          {/* Literary blockquotes */}
          <motion.div
            className="lg:col-span-8 border-b border-border"
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            {testimonialsData.map((testimonial, index) => (
              <motion.blockquote
                key={index}
                variants={itemVariants}
                className="border-t border-border py-8"
              >
                <Quote className="h-5 w-5 text-primary mb-4" aria-hidden="true" />
                <p className="font-serif italic text-xl sm:text-2xl leading-relaxed text-foreground/90 mb-6">
                  "{testimonial.quote}"
                </p>
                <footer className="flex items-baseline gap-3">
                  <span className="font-medium text-foreground">{testimonial.author}</span>
                  <span className="font-serif italic text-sm text-muted-foreground">— {testimonial.role}</span>
                </footer>
              </motion.blockquote>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
