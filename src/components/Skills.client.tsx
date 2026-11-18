'use client';

import { motion, type Variants } from 'framer-motion';
import { useSafeReducedMotion } from '@/hooks/useSafeReducedMotion';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { skillsConfig, uiStrings } from '@/lib/config';
import { Badge } from '@/components/ui/badge';

const ROMAN_NUMERALS = ['I.', 'II.', 'III.', 'IV.'];

export function SkillsClient() {
  const { ref: sectionRef, isIntersecting: isInView } = useIntersectionObserver<HTMLElement>({
    threshold: 0.1,
    freezeOnceVisible: true
  });
  const shouldReduceMotion = useSafeReducedMotion();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.15,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.5,
        ease: 'easeOut',
      },
    },
  };

  const parseSkill = (skillStr: string) => {
    const match = skillStr.match(/^(.*?)\s*(\(.*\))$/);
    if (match) {
      return {
        tech: match[1],
        desc: match[2]
      };
    }
    return { tech: skillStr, desc: null };
  };

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-border"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <motion.div
            className="lg:col-span-4 lg:sticky lg:top-28 lg:self-start"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <p className="font-serif italic text-lg text-primary mb-3">
              Chapter I — Capabilities
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl font-medium mb-4 tracking-tight text-foreground">
              {uiStrings.skills.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {uiStrings.skills.subtitle}
            </p>
            <div className="w-12 h-0.5 bg-primary mt-6" aria-hidden="true" />
          </motion.div>

          <motion.div
            className="lg:col-span-8 divide-y divide-border border-t border-b border-border"
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            {skillsConfig.cards.map((card, cardIndex) => {
              const Icon = card.icon;
              return (
                <motion.article
                  key={card.id}
                  variants={itemVariants}
                  className="py-10 first:pt-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex items-baseline gap-3">
                      <span className="font-serif italic text-xl text-primary">
                        {ROMAN_NUMERALS[cardIndex] ?? `${cardIndex + 1}.`}
                      </span>
                      <h3 className="font-serif text-2xl sm:text-3xl font-medium text-foreground">
                        {card.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <Icon size={18} className="text-primary/80" aria-hidden="true" />
                      {card.level && (
                        <Badge variant="outline" className="text-xs font-mono uppercase tracking-wider px-2.5 py-0.5 border-border text-muted-foreground">
                          {card.level}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    {card.subSections.map((section, idx) => (
                      <div key={idx} className="space-y-3">
                        {section.label && (
                          <h4 className="font-serif italic text-sm text-muted-foreground">
                            {section.label}
                          </h4>
                        )}
                        <div className="flex flex-wrap items-center gap-2">
                          {section.skills.map((skill, sIdx) => {
                            const { tech, desc } = parseSkill(skill);
                            return (
                              <div key={sIdx} className="inline-flex items-baseline gap-1.5 bg-card/50 rounded-none px-3 py-1 border border-border/80 hover:border-primary/50 transition-colors">
                                <span className="font-medium text-sm text-foreground">{tech}</span>
                                {desc && (
                                  <span className="text-xs text-muted-foreground font-serif italic">{desc}</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        {section.highlight && (
                          <div className="text-sm text-foreground/80 border-l-2 border-primary/70 pl-4 py-1 font-serif italic leading-relaxed">
                            {section.highlight}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
