'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useSafeReducedMotion } from '@/hooks/useSafeReducedMotion';
import { useState } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { ExternalLink } from 'lucide-react';
import type { Project, ProjectCategory } from '@/types';

import { projectsConfig, uiStrings, projectCategories as categories } from '@/lib/config';

export function ProjectsClient() {
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory>('All');
  const { ref: sectionRef, isIntersecting: isInView } = useIntersectionObserver<HTMLElement>({
    threshold: 0.1,
    freezeOnceVisible: true,
  });
  const shouldReduceMotion = useSafeReducedMotion();

  // Map config projects to the Project type once
  const allProjects: Project[] = projectsConfig.map(p => {
    return {
      id: p.id,
      title: p.title,
      role: p.role,
      period: p.period,
      description: p.description,
      techStack: p.techStack,
      categories: p.categories,
      achievements: p.achievements,
      link: p.link,
    };
  });

  // Filter projects based on selected category
  const filteredProjects = selectedCategory === 'All'
    ? allProjects
    : allProjects.filter((project) => project.categories.includes(selectedCategory));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.1,
      },
    },
  };

  const itemVariants = {
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
      id="projects"
      ref={sectionRef}
      className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-border"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sticky Chapter Header + Filter Index */}
          <motion.div
            className="lg:col-span-4 lg:sticky lg:top-28 lg:self-start"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <p className="font-serif italic text-lg text-primary mb-3">
              Chapter VI — Selected Works
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl font-medium mb-4">
              {uiStrings.projects.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {uiStrings.projects.subtitle}
            </p>
            <div className="w-12 h-0.5 bg-primary mt-6" aria-hidden="true" />

            {/* Filter tabs */}
            <motion.div
              className="flex flex-wrap gap-2 mt-8"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`
                    px-3.5 py-1.5 rounded-none text-xs font-serif italic transition-colors duration-200 border
                    ${selectedCategory === category
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-transparent text-muted-foreground border-border hover:border-primary/60 hover:text-foreground'
                    }
                  `}
                  data-testid={`filter-tab-${category}`}
                  data-active={selectedCategory === category}
                >
                  {category}
                </button>
              ))}
            </motion.div>
          </motion.div>

          {/* Projects folio grid */}
          <div className="lg:col-span-8">
            {filteredProjects.length === 0 ? (
              <div className="text-center py-12 border-t border-border">
                <p className="text-muted-foreground font-serif italic text-base text-destructive">{uiStrings.projects.emptyMessage}</p>
              </div>
            ) : (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-12"
                variants={containerVariants}
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
                data-testid="projects-grid"
              >
                <AnimatePresence>
                  {filteredProjects.map((project, index) => (
                    <ProjectCard key={project.id} project={project} index={index} variants={itemVariants} />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

interface ProjectCardProps {
  project: Project;
  index?: number;
  variants?: any;
}

export function ProjectCard({ project, index, variants }: ProjectCardProps) {
  const shouldReduceMotion = useSafeReducedMotion();
  const impact = project.achievements.find((achievement) => achievement.startsWith('Result:'))
    ?? project.achievements[project.achievements.length - 1];
  const folioNo = typeof index === 'number'
    ? String(index + 1).padStart(2, '0')
    : project.id;

  return (
    <motion.article
      layout
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="group relative border-t-2 border-border hover:border-primary pt-6 bg-transparent rounded-none transition-colors duration-300 flex flex-col justify-between"
      whileHover={
        shouldReduceMotion
          ? {}
          : {
            y: -2,
          }
      }
      data-testid={`project-card-${project.id}`}
      data-project-title={project.title}
      data-project-categories={project.categories.join(' ')}
    >
      <div data-testid="project-content">
        <div className="mb-2 font-serif italic text-xs text-primary">
          No. {folioNo} — {project.period}
        </div>

        <h3 className="font-serif text-2xl font-medium mb-2 tracking-tight text-foreground" data-testid="project-title">
          {project.title}
        </h3>

        <div className="mb-4 text-xs font-serif italic text-muted-foreground">
          {project.role}
        </div>

        <p className="text-sm text-foreground/80 mb-5 line-clamp-3 leading-relaxed" data-testid="project-description">
          {project.description}
        </p>

        {impact && (
          <div className="mb-5 border-l-2 border-primary pl-4" data-testid="project-impact">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {uiStrings.projects.impactLabel}
            </p>
            <p className="mt-1 font-serif italic text-sm leading-6 text-foreground/90">
              {impact.replace(/^Result:\s*/, '')}
            </p>
          </div>
        )}

        <ul className="mb-6 flex flex-wrap gap-1.5" aria-label={`${project.title} technologies`} data-testid="project-tech-stack">
          {project?.techStack?.map((tech, idx) => (
            <li
              key={idx}
              className="px-2 py-0.5 text-xs font-mono border border-border/80 bg-card/40 text-muted-foreground rounded-none"
              data-testid={`tech-badge-${tech}`}
            >
              {tech}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-3 pt-2" data-testid="project-actions">
        {project.link && (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-serif italic text-primary underline decoration-primary/50 underline-offset-4 hover:decoration-primary transition-colors"
            data-testid="live-demo-button"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {uiStrings.projects.viewLive}
          </a>
        )}
      </div>
    </motion.article>
  );
}
