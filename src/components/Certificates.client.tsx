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
          <p className="font-mono text-xs text-primary mb-2">
            truongdq@oxide-node:~$ gpg --verify-credentials --all
          </p>
          <div className="flex items-center gap-3 mb-3">
            <BadgeCheck className="h-7 w-7 text-primary flex-shrink-0" />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-mono">
              Certifications
            </h2>
          </div>
          <p className="text-sm text-muted-foreground font-mono">
            # Professional Credentials &amp; Training
          </p>
        </motion.div>

        {/* Certificates grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {certificatesData.map((cert, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-card p-6 rounded-none border border-border hover:border-primary/60 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-border pb-3 mb-4 font-mono text-xs">
                  <span className="text-primary font-bold">[GPG:VERIFIED]</span>
                  <span className="text-muted-foreground bg-secondary border border-border px-2 py-0.5 rounded-none">
                    {cert.year}
                  </span>
                </div>
                <div className="flex items-start mb-4">
                  <BadgeCheck className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-bold font-mono text-foreground">{cert.title}</h3>
                    <p className="text-primary font-mono text-xs mt-1">{cert.issuer}</p>
                  </div>
                </div>
                <p className="text-muted-foreground font-mono text-sm mb-4 leading-relaxed">{cert.description}</p>
              </div>
              {cert.credentialUrl && (
                <div className="pt-3 border-t border-border">
                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs font-bold text-primary hover:underline"
                  >
                    $ verify --credential -&gt;
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
