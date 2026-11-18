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
            <div className="max-w-5xl mx-auto">
                {/* Section header */}
                <motion.div
                    className="mb-16"
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                >
                    <p className="font-mono text-xs text-primary mb-2">
                        truongdq@oxide-node:~$ git log --graph --stat --career
                    </p>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 font-mono">
                        {uiStrings.experience.title}
                    </h2>
                    <p className="text-sm text-muted-foreground font-mono">
                        # {uiStrings.experience.subtitle}
                    </p>
                </motion.div>

                {/* Timeline */}
                <motion.div
                    className="relative space-y-10"
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? 'visible' : 'hidden'}
                >
                    {/* Vertical rail - phosphor */}
                    <div className="absolute left-0 md:left-[24px] top-0 bottom-0 w-px bg-primary/40 hidden md:block" />

                    {experiences.map((exp, idx) => (
                        <motion.div
                            key={exp.id}
                            variants={itemVariants}
                            className="relative flex flex-col md:flex-row gap-6 md:gap-8"
                        >
                            {/* Commit node marker */}
                            <div className="absolute left-0 md:left-[18px] top-3 w-3 h-3 rounded-none bg-primary border border-background z-10 hidden md:block" />

                            {/* Content */}
                            <div className="flex-1 md:ml-12">
                                {/* Mobile left accent border */}
                                <div className="border-l-2 border-primary/40 pl-4 md:border-l-0 md:pl-0">
                                    <div className="group relative bg-card border border-border rounded-none p-6 sm:p-8 transition-colors duration-200 hover:border-primary/60">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5 mb-6">
                                            <div>
                                                <div className="font-mono text-[11px] text-primary mb-1">
                                                    commit #{String(experiences.length - idx).padStart(2, '0')} ({exp.id})
                                                </div>
                                                <h3 className="text-xl font-bold text-foreground font-mono mb-1">{exp.role}</h3>
                                                <div className="flex items-center gap-2 text-muted-foreground font-mono text-sm">
                                                    <Building className="h-3.5 w-3.5 text-primary" />
                                                    <span className="uppercase tracking-tight">{exp.company}</span>
                                                </div>
                                            </div>
                                            <div className="inline-flex items-center gap-2 text-primary font-mono text-xs bg-secondary px-3 py-1 rounded-none border border-border uppercase tracking-wider self-start md:self-auto">
                                                <Calendar className="h-3 w-3" />
                                                <span>{exp.period}</span>
                                            </div>
                                        </div>

                                        {exp.description && (
                                            <p className="text-sm sm:text-base text-muted-foreground font-mono mb-6 leading-relaxed">{exp.description}</p>
                                        )}

                                        <div className="space-y-3">
                                            <h4 className="text-xs uppercase tracking-wider font-bold text-primary font-mono flex items-center gap-2">
                                                [stdout // {uiStrings.experience.achievementsTitle}]
                                            </h4>
                                            <ul className="space-y-2.5">
                                                {exp.achievements.map((achievement, i) => (
                                                    <li key={i} className="flex items-start gap-3 text-sm sm:text-base text-muted-foreground font-mono">
                                                        <span className="text-primary font-bold flex-shrink-0" aria-hidden="true">&gt;</span>
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
