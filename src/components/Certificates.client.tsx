'use client';

import { motion, type Variants } from 'framer-motion';
import { useSafeReducedMotion } from '@/hooks/useSafeReducedMotion';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { BadgeCheck } from 'lucide-react';
import { certificatesData } from '@/lib/config';

export function CertificatesClient() {
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
      id="certificates"
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
              Chapter III — Credentials
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl font-medium mb-4">
              Certifications
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Professional Credentials &amp; Training
            </p>
            <div className="w-12 h-0.5 bg-primary mt-6" aria-hidden="true" />
          </motion.div>

          {/* Certificates catalog */}
          <motion.div
            className="lg:col-span-8 border-b border-border"
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            {certificatesData.map((cert, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="border-t border-border py-8"
              >
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <BadgeCheck className="h-5 w-5 text-primary flex-shrink-0" />
                    <h3 className="font-serif text-2xl font-medium text-foreground">{cert.title}</h3>
                  </div>
                  <span className="font-serif italic text-sm text-muted-foreground shrink-0">
                    {cert.issuer} · {cert.year}
                  </span>
                </div>
                <p className="text-foreground/80 text-base leading-relaxed mb-4">{cert.description}</p>
                {cert.credentialUrl && (
                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-serif italic text-sm text-primary underline decoration-primary/50 underline-offset-4 hover:decoration-primary"
                  >
                    Verify Credential →
                  </a>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
