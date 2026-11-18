'use client';

import { motion, type Variants } from 'framer-motion';
import { useSafeReducedMotion } from '@/hooks/useSafeReducedMotion';
import { ArrowRight, Mail, Download, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';

import { personalInfo, uiStrings } from '@/lib/config';

interface CTAButton {
  label: string;
  href: string;
  variant: 'primary' | 'secondary';
  icon?: React.ReactNode;
}

interface HeroProps {
  title?: string;
  subtitle?: string;
  typingPhrases?: string[];
  ctaButtons?: CTAButton[];
}

export function HeroClient({
  title = personalInfo.name,
  subtitle = personalInfo.bio,
  typingPhrases = personalInfo.typingPhrases,
  ctaButtons = [
    {
      label: uiStrings.hero.cta.projects,
      href: '#projects',
      variant: 'primary' as const,
      icon: <ArrowRight className="h-4 w-4" />,
    },
    {
      label: uiStrings.hero.cta.cv,
      href: personalInfo.resumeUrl,
      variant: 'secondary' as const,
      icon: <Download className="h-4 w-4" />,
    },
    {
      label: uiStrings.hero.cta.contact,
      href: '#contact',
      variant: 'secondary' as const,
      icon: <Mail className="h-4 w-4" />,
    },
  ],
}: HeroProps) {
  const [typingText, setTypingText] = useState(typingPhrases[0] ?? '');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const shouldReduceMotion = useSafeReducedMotion();

  // Typing animation effect
  useEffect(() => {
    const currentPhrase = typingPhrases[phraseIndex];
    const typingSpeed = isDeleting ? 50 : 100;
    const pauseTime = isDeleting ? 500 : 2000;

    const timer = setTimeout(
      () => {
        if (!isDeleting && typingText === currentPhrase) {
          // Pause at end of phrase
          setTimeout(() => setIsDeleting(true), pauseTime);
        } else if (isDeleting && typingText === '') {
          // Move to next phrase
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % typingPhrases.length);
        } else if (isDeleting) {
          // Delete character
          setTypingText(currentPhrase.substring(0, typingText.length - 1));
        } else {
          // Add character
          setTypingText(currentPhrase.substring(0, typingText.length + 1));
        }
      },
      isDeleting ? typingSpeed : typingSpeed
    );

    return () => clearTimeout(timer);
  }, [typingText, isDeleting, phraseIndex, typingPhrases]);

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.2,
        delayChildren: 0.1,
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

  const romanMarkers = ['I.', 'II.', 'III.', 'IV.'];

  return (
    <section
      id="hero"
      aria-labelledby="hero-title"
      className="relative min-h-screen flex items-center overflow-hidden px-4 sm:px-6 lg:px-8 pb-24 pt-28 sm:pt-32"
    >
      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="mb-12 border-t-2 border-b border-border py-2.5 flex flex-wrap items-center justify-between gap-4 font-serif italic text-sm text-muted-foreground">
          <span>Monograph &amp; Collected Works</span>
          <span>{personalInfo.location}</span>
          <span>Edition 2026 — Systems &amp; Full-Stack Architecture</span>
        </div>

        <div className="grid items-start gap-12 lg:grid-cols-12">
          <motion.div
            className="lg:col-span-8 text-left"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className="font-serif italic text-lg text-primary"
              variants={itemVariants}
            >
              — {uiStrings.hero.eyebrow}
            </motion.div>

            <motion.h1
              id="hero-title"
              className="mt-4 font-serif font-normal text-6xl sm:text-7xl lg:text-[5.25rem] leading-[0.98] tracking-[-0.03em] text-foreground"
              variants={itemVariants}
            >
              {title}
            </motion.h1>

            <motion.p
              className="mt-4 font-serif italic text-2xl sm:text-3xl text-primary/90"
              variants={itemVariants}
            >
              {personalInfo.role}
            </motion.p>

            <motion.p
              className="mt-6 max-w-2xl text-base sm:text-lg leading-8 text-foreground/80"
              variants={itemVariants}
            >
              {subtitle}
            </motion.p>

            <motion.ul
              aria-label={uiStrings.hero.focusLabel}
              className="mt-8 border-t border-border pt-6 grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm text-foreground"
              variants={itemVariants}
            >
              {personalInfo.focusAreas.map((area, index) => (
                <li key={area} className="flex items-baseline gap-3">
                  <span className="font-serif italic text-primary font-medium" aria-hidden="true">
                    {romanMarkers[index] ?? `${index + 1}.`}
                  </span>
                  <span>{area}</span>
                </li>
              ))}
            </motion.ul>

            <motion.div
              className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap"
              variants={itemVariants}
            >
              {ctaButtons.map((button, index) => (
                <motion.a
                  key={index}
                  href={button.href}
                  className={`group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-none transition-colors duration-200 sm:w-auto ${button.variant === 'primary'
                    ? 'bg-primary text-primary-foreground px-7 py-3.5 text-sm font-medium tracking-wide hover:bg-primary/90'
                    : 'border border-border bg-card/60 text-foreground hover:border-primary px-6 py-3.5 text-sm font-medium'
                    }`}
                  whileHover={shouldReduceMotion ? {} : { y: -2 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                >
                  {button.label}
                  {button.icon && (
                    <span className="transition-transform group-hover:translate-x-1">
                      {button.icon}
                    </span>
                  )}
                </motion.a>
              ))}
            </motion.div>

            <motion.div
              className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted-foreground"
              variants={itemVariants}
            >
              <a className="inline-flex items-center gap-2 hover:text-primary transition-colors" href={`mailto:${personalInfo.email}`}>
                <Mail className="h-4 w-4 text-primary" aria-hidden="true" />
                {personalInfo.email}
              </a>
              <span className="hidden text-border sm:inline" aria-hidden="true">/</span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
                {personalInfo.location}
              </span>
              <span className="hidden text-border sm:inline" aria-hidden="true">/</span>
              <div className="flex items-center gap-4">
                {personalInfo.socials.map((social) => (
                  <a
                    key={social.platform}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition-colors hover:text-primary"
                    aria-label={social.platform}
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </motion.div>
          </motion.div>

          <motion.aside
            aria-label={uiStrings.hero.snapshotLabel}
            className="lg:col-span-4 border-t-2 border-b-2 border-border bg-card/50 p-8 rounded-none shadow-none"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <p className="font-serif italic text-lg text-primary border-b border-border pb-3">
              {uiStrings.hero.snapshotLabel}
            </p>
            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8">
              {personalInfo.stats.map((stat) => (
                <div key={stat.label}>
                  <dd className="font-serif italic text-4xl sm:text-5xl text-foreground">{stat.value}</dd>
                  <dt className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{stat.label}</dt>
                </div>
              ))}
            </dl>

            <div className="mt-10 border-t border-border pt-6">
              <p className="font-serif italic text-sm text-primary">
                {uiStrings.hero.currentFocusLabel}
              </p>
              <p className="mt-2 text-sm leading-7 text-foreground/85">
                Building reliable full-stack applications, reporting workflows, and cross-platform products.
              </p>
            </div>

            <a
              href="#experience"
              className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-foreground underline decoration-primary/60 underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
            >
              Review professional experience
              <ArrowRight className="h-4 w-4 text-primary" aria-hidden="true" />
            </a>
          </motion.aside>
        </div>

        <motion.div
          className="mt-14 border-t border-border pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          data-testid="typing-animation"
        >
          <span className="font-serif italic text-muted-foreground">
            Current technical lens
          </span>
          <span className="font-mono text-xs tracking-wide text-foreground" aria-live="polite">
            {typingText}
            <span className="ml-1 inline-block h-3.5 w-0.5 animate-pulse bg-primary align-middle" aria-hidden="true" />
          </span>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden sm:block"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.4 }}
      >
        <a
          href="#skills"
          className="font-serif italic text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          Scroll to Chapter I ↓
        </a>
      </motion.div>
    </section>
  );
}
