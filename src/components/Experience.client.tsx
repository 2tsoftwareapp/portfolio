'use client';

import { motion, type Variants } from 'framer-motion';
import { useSafeReducedMotion } from '@/hooks/useSafeReducedMotion';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Calendar, Building } from 'lucide-react';
import { workExperience, uiStrings, type Experience } from '@/lib/config';

interface ExperienceProps {
    experiences?: Experience[];
}

export function ExperienceClient({ experiences = workExperience }: ExperienceProps) {
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
                staggerChildren: shouldReduceMotion ? 0 : 0.2,
            },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, x: shouldReduceMotion ? 0 : -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: shouldReduceMotion ? 0 : 0.5,
                ease: 'easeOut',
            },
        },
    };

    return (
        <section
            id="experience"
            ref={sectionRef}
            className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-border"
        >
            <div className="max-w-4xl mx-auto">
                {/* Section header */}
                <motion.div
                    className="mb-16"
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                >
                    <div className="mb-4 flex items-center gap-4">
                        <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary">
                            [02 // FIELD RECORD]
                        </span>
                        <div className="h-px flex-1 bg-border" aria-hidden="true" />
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
                        {uiStrings.experience.title}
                    </h2>
                    <p className="text-sm text-muted-foreground uppercase tracking-widest font-mono">
                        {uiStrings.experience.subtitle}
                    </p>
                </motion.div>

                {/* Timeline */}
                <motion.div
                    className="relative space-y-12"
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? 'visible' : 'hidden'}
                >
                    {/* Vertical line - precision */}
                    <div className="absolute left-0 md:left-[24px] top-0 bottom-0 w-px bg-border hidden md:block" />

                    {experiences.map((exp) => (
                        <motion.div
                            key={exp.id}
                            variants={itemVariants}
                            className="relative flex flex-col md:flex-row gap-6 md:gap-8"
                        >
                            {/* Timeline node */}
                            <div className="absolute left-0 md:left-[19px] top-2 w-2.5 h-2.5 rounded-none bg-primary border border-background z-10 hidden md:block" />

                            {/* Content */}
                            <div className="flex-1 md:ml-12">
                                {/* Mobile left accent border */}
                                <div className="border-l border-border pl-4 md:border-l-0 md:pl-0">
                                    <div className="group relative bg-card border border-border rounded-none p-6 sm:p-8 transition-colors duration-200 hover:border-primary/50">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6 mb-6">
                                            <div>
                                                <h3 className="text-xl font-bold text-foreground font-mono mb-1">{exp.role}</h3>
                                                <div className="flex items-center gap-2 text-muted-foreground font-mono text-sm">
                                                    <Building className="h-3.5 w-3.5 text-primary" />
                                                    <span className="uppercase tracking-tight">{exp.company}</span>
                                                </div>
                                            </div>
                                            <div className="inline-flex items-center gap-2 text-muted-foreground font-mono text-xs bg-secondary/50 px-3 py-1 rounded-none border border-border uppercase tracking-widest self-start md:self-auto">
                                                <Calendar className="h-3 w-3 text-primary" />
                                                <span>{exp.period}</span>
                                            </div>
                                        </div>

                                        {exp.description && (
                                            <p className="text-base text-muted-foreground mb-8 leading-relaxed">{exp.description}</p>
                                        )}

                                        <div className="space-y-4">
                                            <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground/70 font-mono flex items-center gap-2">
                                                {uiStrings.experience.achievementsTitle}
                                            </h4>
                                            <ul className="space-y-3">
                                                {exp.achievements.map((achievement, i) => (
                                                    <li key={i} className="flex items-start gap-3 text-base text-muted-foreground">
                                                        <span className="mt-2.5 w-1.5 h-[1px] bg-primary flex-shrink-0" />
                                                        <span className="leading-relaxed">{achievement}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
