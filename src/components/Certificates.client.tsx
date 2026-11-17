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
        {/* Section header */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-4 flex items-center gap-4">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary">
              [03 // CREDENTIALS]
            </span>
            <div className="h-px flex-1 bg-border" aria-hidden="true" />
          </div>
          <div className="flex items-center gap-3 mb-3">
            <BadgeCheck className="h-7 w-7 text-primary flex-shrink-0" />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              Certifications
            </h2>
          </div>
          <p className="text-sm text-muted-foreground uppercase tracking-widest font-mono">
            Professional Credentials & Training
          </p>
        </motion.div>

        {/* Certificates grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-border"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {certificatesData.map((cert, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="border-r border-b border-border bg-card p-6 rounded-none hover:bg-secondary/20 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 pb-4 mb-4 border-b border-border/60">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                    CERT.{String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground bg-secondary/50 border border-border px-2 py-0.5 rounded-none">
                    {cert.year}
                  </span>
                </div>
                <div className="flex items-start mb-4">
                  <BadgeCheck className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-bold text-foreground font-mono tracking-tight">{cert.title}</h3>
                    <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mt-1">{cert.issuer}</p>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm mb-6 leading-relaxed">{cert.description}</p>
              </div>
              {cert.credentialUrl && (
                <div className="pt-4 border-t border-border/60">
                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs font-bold uppercase tracking-wider text-primary hover:underline"
                  >
                    Verify Credential →
                  </a>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
