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
          <p className="font-mono text-xs text-primary mb-2">
            truongdq@oxide-node:~$ lscpu --capabilities --verbose
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 tracking-tight font-mono">
            {uiStrings.skills.title}
          </h2>
          <p className="text-sm text-muted-foreground font-mono">
            # {uiStrings.skills.subtitle}
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {skillsConfig.cards.map((card, cardIdx) => {
            const Icon = card.icon;
            return (
              <motion.div key={card.id} variants={itemVariants} className="h-full">
                <Card className="h-full bg-card border-border hover:border-primary/70 transition-colors rounded-none">
                  <div className="border-b border-border bg-secondary/70 px-6 py-3 flex items-center justify-between gap-2 font-mono text-xs">
                    <span className="text-primary font-bold">
                      [pane:0{cardIdx + 1} // {card.id}]
                    </span>
                    {card.level && (
                      <Badge variant="outline" className="text-[11px] font-mono uppercase tracking-wider px-2 py-0 border-primary/40 text-primary rounded-none">
                        {card.level}
                      </Badge>
                    )}
                  </div>
                  <CardHeader className="pb-4 pt-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-none bg-secondary border border-border text-primary">
                        <Icon size={18} />
                      </div>
                      <CardTitle className="text-lg font-bold font-mono tracking-tight">{card.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {card.subSections.map((section, idx) => (
                      <div key={idx} className="space-y-3">
                        {section.label && (
                          <h4 className="text-xs uppercase tracking-wider font-bold text-primary/80 font-mono">
                            &gt; {section.label}
                          </h4>
                        )}
                        <div className="flex flex-wrap items-center gap-2">
                          {section.skills.map((skill, sIdx) => {
                            const { tech, desc } = parseSkill(skill);
                            return (
                              <div key={sIdx} className="inline-flex items-center gap-1.5 bg-background rounded-none px-2.5 py-1 border border-border hover:border-primary/70 transition-colors">
                                <span className="font-medium text-xs sm:text-sm text-foreground font-mono">{tech}</span>
                                {desc && (
                                  <span className="text-xs text-muted-foreground font-mono">{desc}</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        {section.highlight && (
                          <div className="text-xs sm:text-sm text-muted-foreground border-l-2 border-primary bg-secondary/30 pl-3 py-1.5 font-mono leading-relaxed">
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
