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

  return (
    <section
      id="hero"
      aria-labelledby="hero-title"
      className="relative min-h-screen flex items-center overflow-hidden px-4 sm:px-6 lg:px-8 pb-24 pt-28 sm:pt-32"
    >
      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="mb-10 border border-border bg-card px-4 py-2.5 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
          <div className="truncate">
            <span className="text-primary font-bold">truongdq@oxide-node</span>
            <span className="text-muted-foreground">:~/portfolio$ ./inspect --profile --live</span>
          </div>
          <span className="text-muted-foreground hidden sm:inline">
            SESSION: tty1 | LATENCY: <span className="text-primary">-50%</span> | TESTS: <span className="text-primary">183 PASS</span>
          </span>
        </div>

        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
          <motion.div
            className="max-w-3xl text-left"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary"
              variants={itemVariants}
            >
              <span className="text-primary">&gt;</span>
              {uiStrings.hero.eyebrow}
            </motion.div>

            <motion.h1
              id="hero-title"
              className="mt-4 font-mono text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground"
              variants={itemVariants}
            >
              {title}
            </motion.h1>

            <motion.p
              className="mt-4 font-mono text-lg sm:text-xl text-primary"
              variants={itemVariants}
            >
              // {personalInfo.role}
            </motion.p>

            <motion.p
              className="mt-5 max-w-2xl font-mono text-sm sm:text-base leading-7 text-muted-foreground"
              variants={itemVariants}
            >
              {subtitle}
            </motion.p>

            <motion.ul
              aria-label={uiStrings.hero.focusLabel}
              className="mt-8 border border-border bg-card/80 p-4 grid sm:grid-cols-2 gap-3 font-mono text-xs text-foreground"
              variants={itemVariants}
            >
              {personalInfo.focusAreas.map((area) => (
                <li key={area} className="flex items-center gap-2.5">
                  <span className="text-primary font-bold" aria-hidden="true">[OK]</span>
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
                  className={`group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-none px-6 py-3 font-mono text-xs uppercase tracking-wider font-bold transition-colors duration-200 sm:w-auto ${button.variant === 'primary'
                    ? 'bg-primary text-primary-foreground border border-primary hover:bg-primary/90'
                    : 'border border-border bg-card text-foreground hover:border-primary/70'
                    }`}
                  whileHover={shouldReduceMotion ? {} : { y: -2 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                >
                  {button.variant === 'primary' && <span aria-hidden="true">[⏎]</span>}
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
              className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 font-mono text-xs text-muted-foreground"
              variants={itemVariants}
            >
              <a className="inline-flex items-center gap-2 hover:text-primary transition-colors" href={`mailto:${personalInfo.email}`}>
                <Mail className="h-4 w-4 text-primary" aria-hidden="true" />
                {personalInfo.email}
              </a>
              <span className="hidden text-border sm:inline" aria-hidden="true">|</span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
                {personalInfo.location}
              </span>
              <span className="hidden text-border sm:inline" aria-hidden="true">|</span>
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
            className="relative overflow-hidden rounded-none border border-border bg-card p-0 shadow-none"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="border-b border-border bg-secondary px-5 py-2.5 flex items-center justify-between gap-2 font-mono text-xs">
              <span className="text-foreground font-semibold truncate">
                ┌─ [ sys.telemetry // {uiStrings.hero.snapshotLabel} ]
              </span>
              <span className="text-primary font-bold shrink-0">● ONLINE</span>
            </div>

            <dl className="p-6 grid grid-cols-2 gap-6 border-b border-border">
              {personalInfo.stats.map((stat) => (
                <div key={stat.label}>
                  <dd className="font-mono text-3xl sm:text-4xl font-bold text-primary">{stat.value}</dd>
                  <div className="font-mono text-[10px] text-primary/60 tracking-tighter mt-1" aria-hidden="true">
                    ████████░░
                  </div>
                  <dt className="font-mono text-xs text-muted-foreground mt-1 leading-5">{stat.label}</dt>
                </div>
              ))}
            </dl>

            <div className="p-6 font-mono">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">
                # {uiStrings.hero.currentFocusLabel}
              </p>
              <p className="mt-2.5 text-xs leading-6 text-foreground/90">
                Building reliable full-stack applications, reporting workflows, and cross-platform products.
              </p>
              <a
                href="#experience"
                className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline"
              >
                <span>$ cd ./experience -&gt;</span>
              </a>
            </div>
          </motion.aside>
        </div>

        <motion.div
          className="mt-12 border border-border bg-card px-4 py-3 font-mono text-xs flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          data-testid="typing-animation"
        >
          <span className="text-muted-foreground">
            <span className="text-primary font-bold">zsh ❯</span> role --current
          </span>
          <span className="text-foreground" aria-live="polite">
            {typingText}
            <span className="ml-1.5 inline-block h-4 w-2.5 animate-pulse bg-primary align-middle" aria-hidden="true" />
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
          className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          $ scroll --down ↓
        </a>
      </motion.div>
    </section>
  );
}
