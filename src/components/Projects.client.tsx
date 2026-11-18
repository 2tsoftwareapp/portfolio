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
        {/* Section header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <p className="font-mono text-xs text-primary mb-2">
            truongdq@oxide-node:~$ systemctl list-units --type=deployment
          </p>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 font-mono">
                {uiStrings.projects.title}
              </h2>
              <p className="text-sm text-muted-foreground font-mono">
                # {uiStrings.projects.subtitle}
              </p>
            </div>

            {/* Filter tabs */}
            <motion.div
              className="flex flex-nowrap md:flex-wrap justify-start lg:justify-end gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide md:scrollbar-auto"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              {categories.map((category, idx) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`
                    flex-shrink-0 px-4 py-1.5 rounded-none text-xs font-mono uppercase tracking-wider transition-colors duration-200 border
                    ${selectedCategory === category
                      ? 'bg-primary text-primary-foreground border-primary font-bold'
                      : 'bg-card text-muted-foreground border-border hover:border-primary/70 hover:text-primary'
                    }
                  `}
                  data-testid={`filter-tab-${category}`}
                  data-active={selectedCategory === category}
                >
                  [{idx}:{category}]
                </button>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Projects grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12 border border-border bg-card">
            <p className="text-muted-foreground font-mono text-sm text-destructive">{uiStrings.projects.emptyMessage}</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            data-testid="projects-grid"
          >
            <AnimatePresence>
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} variants={itemVariants} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  );
}

interface ProjectCardProps {
  project: Project;
  variants?: any;
}

export function ProjectCard({ project, variants }: ProjectCardProps) {
  const shouldReduceMotion = useSafeReducedMotion();
  const impact = project.achievements.find((achievement) => achievement.startsWith('Result:'))
    ?? project.achievements[project.achievements.length - 1];

  return (
    <motion.article
      layout
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="group relative bg-card border border-border rounded-none overflow-hidden transition-colors duration-200 hover:border-primary/70 flex flex-col"
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
      <div className="border-b border-border bg-secondary/70 px-5 py-2 flex items-center justify-between gap-2 font-mono text-xs">
        <span className="text-primary font-bold truncate">[unit:{project.id}]</span>
        <span className="text-muted-foreground shrink-0">{project.period}</span>
      </div>

      <div className="p-6 flex-1 flex flex-col justify-between" data-testid="project-content">
        <div>
          <h3 className="text-lg font-bold mb-2 font-mono tracking-tight text-foreground" data-testid="project-title">
            {project.title}
          </h3>

          <div className="mb-4 text-xs font-mono text-primary">
            // {project.role}
          </div>

          <p className="text-sm text-muted-foreground font-mono mb-5 line-clamp-3 leading-relaxed" data-testid="project-description">
            {project.description}
          </p>

          {impact && (
            <div className="mb-5 border-l-2 border-primary bg-secondary/30 p-3" data-testid="project-impact">
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">
                [stdout // {uiStrings.projects.impactLabel}]
              </p>
              <p className="mt-1.5 text-xs sm:text-sm font-mono leading-6 text-foreground/90">
                {impact.replace(/^Result:\s*/, '')}
              </p>
            </div>
          )}

          <ul className="mb-6 flex flex-wrap gap-1.5" aria-label={`${project.title} technologies`} data-testid="project-tech-stack">
            {project?.techStack?.map((tech, index) => (
              <li
                key={index}
                className="px-2 py-0.5 text-xs font-mono border border-border bg-background text-muted-foreground rounded-none"
                data-testid={`tech-badge-${tech}`}
              >
                {tech}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-3 pt-3 border-t border-border" data-testid="project-actions">
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-none hover:bg-primary/90 transition-colors text-xs font-bold font-mono uppercase tracking-wider"
              data-testid="live-demo-button"
            >
              <span>[EXEC -&gt;]</span>
              <ExternalLink className="h-3.5 w-3.5" />
              {uiStrings.projects.viewLive}
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}
