'use client';

import { motion, type Variants } from 'framer-motion';
import { useSafeReducedMotion } from '@/hooks/useSafeReducedMotion';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
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
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Sticky Chapter Header */}
                    <motion.div
                        className="lg:col-span-4 lg:sticky lg:top-28 lg:self-start"
                        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6 }}
                    >
                        <p className="font-serif italic text-lg text-primary mb-3">
                            Chapter II — Career Chronicle
                        </p>
                        <h2 className="font-serif text-4xl sm:text-5xl font-medium mb-4">
                            {uiStrings.experience.title}
                        </h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {uiStrings.experience.subtitle}
                        </p>
                        <div className="w-12 h-0.5 bg-primary mt-6" aria-hidden="true" />
                    </motion.div>

                    {/* Chronicle list */}
                    <motion.div
                        className="lg:col-span-8 space-y-6 border-b border-border pb-8"
                        variants={containerVariants}
                        initial="hidden"
                        animate={isInView ? 'visible' : 'hidden'}
                    >
                        {experiences.map((exp, index) => (
                            <motion.article
                                key={exp.id}
                                variants={itemVariants}
                                className="border-t border-border pt-10 pb-4"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-4">
                                    <div>
                                        <span className="font-serif italic text-xs text-primary block mb-1">
                                            Entry {String(index + 1).padStart(2, '0')}
                                        </span>
                                        <h3 className="font-serif text-2xl sm:text-3xl font-medium text-foreground">{exp.role}</h3>
                                    </div>
                                    <p className="font-serif italic text-sm text-muted-foreground shrink-0">
                                        {exp.company} — {exp.period}
                                    </p>
                                </div>

                                {exp.description && (
                                    <p className="text-base text-foreground/80 mb-6 leading-relaxed">{exp.description}</p>
                                )}

                                <div className="space-y-3">
                                    <h4 className="font-serif italic text-sm text-primary">
                                        {uiStrings.experience.achievementsTitle}
                                    </h4>
                                    <ul className="space-y-2.5">
                                        {exp.achievements.map((achievement, i) => (
                                            <li key={i} className="flex items-start gap-3 text-base text-muted-foreground">
                                                <span className="font-serif text-primary flex-shrink-0" aria-hidden="true">—</span>
                                                <span className="leading-relaxed">{achievement}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.article>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
