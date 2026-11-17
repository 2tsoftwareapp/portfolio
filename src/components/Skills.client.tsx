'use client';

import { motion, type Variants } from 'framer-motion';
import { useSafeReducedMotion } from '@/hooks/useSafeReducedMotion';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { skillsConfig, uiStrings } from '@/lib/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
        staggerChildren: shouldReduceMotion ? 0 : 0.2,
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
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-4 flex items-center gap-4">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary">
              [01 // CAPABILITIES]
            </span>
            <div className="h-px flex-1 bg-border" aria-hidden="true" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 tracking-tight">
            {uiStrings.skills.title}
          </h2>
          <p className="text-sm text-muted-foreground uppercase tracking-widest font-mono">
            {uiStrings.skills.subtitle}
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-0 border-t border-l border-border"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {skillsConfig.cards.map((card, cardIdx) => {
            const Icon = card.icon;
            return (
              <motion.div key={card.id} variants={itemVariants} className="h-full border-r border-b border-border">
                <Card className="h-full border-0 rounded-none bg-card hover:bg-secondary/20 transition-colors">
                  <CardHeader className="pb-6 space-y-4 border-b border-border/60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-none border border-border bg-secondary text-primary">
                          <Icon size={20} />
                        </div>
                        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                          CAP.0{cardIdx + 1}
                        </span>
                      </div>
                      {card.level && (
                        <Badge variant="outline" className="text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded-none border-border text-muted-foreground">
                          {card.level}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg font-bold font-mono tracking-tight">{card.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8 pt-6">
                    {card.subSections.map((section, idx) => (
                      <div key={idx} className="space-y-4">
                        {section.label && (
                          <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground/70 font-mono">
                            {section.label}
                          </h4>
                        )}
                        <div className="flex flex-wrap items-center gap-2">
                          {section.skills.map((skill, sIdx) => {
                            const { tech, desc } = parseSkill(skill);
                            return (
                              <div key={sIdx} className="inline-flex items-center gap-1.5 bg-background rounded-none px-2.5 py-1 border border-border hover:border-primary/60 transition-colors">
                                <span className="font-medium text-sm text-foreground font-mono">{tech}</span>
                                {desc && (
                                  <span className="text-xs text-muted-foreground font-mono opacity-75">{desc}</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        {section.highlight && (
                          <div className="text-sm text-muted-foreground border-l-2 border-primary/60 pl-4 py-1 font-mono leading-relaxed opacity-85">
                            {section.highlight}
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
