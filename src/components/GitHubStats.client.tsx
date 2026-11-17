'use client';

import { motion, type Variants } from 'framer-motion';
import { useSafeReducedMotion } from '@/hooks/useSafeReducedMotion';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { ExternalLink, Github, GitBranch, RefreshCw, Star, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

import { personalInfo } from '@/lib/config';

interface GitHubStats {
  totalRepos: number;
  totalStars: number;
  followers: number;
  following: number;
  featuredRepo?: {
    name: string;
    url: string;
    stars: number;
  };
  latestRepo?: {
    name: string;
    url: string;
    pushedAt: string;
  };
}

interface GitHubRepo {
  fork: boolean;
  html_url: string;
  name: string;
  pushed_at: string;
  stargazers_count: number;
}

export function GitHubStatsClient() {
  const { ref: sectionRef, isIntersecting: isInView } = useIntersectionObserver<HTMLElement>({
    threshold: 0.1,
    freezeOnceVisible: true,
  });
  const shouldReduceMotion = useSafeReducedMotion();
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const githubUsername = personalInfo.githubUsername;

  useEffect(() => {
    const fetchGitHubStats = async () => {
      try {
        setLoading(true);
        
        // Fetch user data
        const userResponse = await fetch(`https://api.github.com/users/${githubUsername}`);
        if (!userResponse.ok) {
          throw new Error('Failed to fetch GitHub user data');
        }
        const userData = await userResponse.json();

        // Fetch repos data
        const reposResponse = await fetch(`https://api.github.com/users/${githubUsername}/repos?per_page=100`);
        if (!reposResponse.ok) {
          throw new Error('Failed to fetch GitHub repos data');
        }
        const reposData: GitHubRepo[] = await reposResponse.json();
        const publicRepos = reposData.filter((repo) => !repo.fork);

        const totalRepos = publicRepos.length;
        const totalStars = publicRepos.reduce((acc, repo) => acc + repo.stargazers_count, 0);
        const featuredRepo = [...publicRepos].sort((a, b) => b.stargazers_count - a.stargazers_count)[0];
        const latestRepo = [...publicRepos].sort(
          (a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
        )[0];

        const calculatedStats: GitHubStats = {
          totalRepos,
          totalStars,
          followers: userData.followers,
          following: userData.following,
          featuredRepo: featuredRepo
            ? {
                name: featuredRepo.name,
                url: featuredRepo.html_url,
                stars: featuredRepo.stargazers_count,
              }
            : undefined,
          latestRepo: latestRepo
            ? {
                name: latestRepo.name,
                url: latestRepo.html_url,
                pushedAt: latestRepo.pushed_at,
              }
            : undefined,
        };

        setStats(calculatedStats);
      } catch (err) {
        console.error('Error fetching GitHub stats:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchGitHubStats();
  }, [githubUsername]);

  const statItems = [
    { label: 'Total Repositories', value: stats?.totalRepos || 0, icon: GitBranch },
    { label: 'Total Stars', value: stats?.totalStars || 0, icon: Star },
    { label: 'Followers', value: stats?.followers || 0, icon: Users },
    { label: 'Following', value: stats?.following || 0, icon: RefreshCw },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.1,
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
      id="github-stats"
      ref={sectionRef}
      className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-border bg-background"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-4 flex items-center gap-4">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary">
              [04 // TELEMETRY]
            </span>
            <div className="h-px flex-1 bg-border" aria-hidden="true" />
          </div>
          <div className="flex items-center gap-3 mb-3">
            <Github className="h-7 w-7 text-primary flex-shrink-0" />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              GitHub Footprint
            </h2>
          </div>
          <p className="text-sm text-muted-foreground uppercase tracking-widest font-mono">
            Real public signals from github.com/{githubUsername}
          </p>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-0 border-t border-l border-border"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {statItems.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="border-r border-b border-border bg-card p-6 text-left rounded-none"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  GH.0{index + 1}
                </span>
                <stat.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="font-mono text-3xl font-bold text-foreground mb-1">
                {loading ? '...' : stat.value.toLocaleString()}
              </div>
              <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {(stats?.latestRepo || stats?.featuredRepo) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-8 grid gap-4 md:grid-cols-2"
          >
            {stats.latestRepo && (
              <a
                href={stats.latestRepo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-none border border-border bg-card p-5 transition-colors hover:border-primary/60"
              >
                <div className="mb-2 text-xs font-mono uppercase tracking-[0.24em] text-primary">
                  Recently active repo
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-lg font-bold font-mono text-foreground">{stats.latestRepo.name}</div>
                    <div className="text-xs font-mono text-muted-foreground mt-1">
                      Updated {new Date(stats.latestRepo.pushedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
              </a>
            )}

            {stats.featuredRepo && (
              <a
                href={stats.featuredRepo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-none border border-border bg-card p-5 transition-colors hover:border-primary/60"
              >
                <div className="mb-2 text-xs font-mono uppercase tracking-[0.24em] text-primary">
                  Most starred public repo
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-lg font-bold font-mono text-foreground">{stats.featuredRepo.name}</div>
                    <div className="text-xs font-mono text-muted-foreground mt-1">
                      {stats.featuredRepo.stars.toLocaleString()} stars
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
              </a>
            )}
          </motion.div>
        )}

        {/* Contribution graph */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-8 bg-card p-6 rounded-none border border-border"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border/60">
            <h3 className="text-lg font-bold font-mono uppercase tracking-wider">Contribution Activity</h3>
            <a
              href={`https://github.com/${githubUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-none hover:bg-primary/90 transition-colors text-xs font-bold font-mono uppercase tracking-wider self-start sm:self-auto"
            >
              <Github className="h-4 w-4" />
              View GitHub Profile
            </a>
          </div>
          <div className="flex justify-center">
            <div className="overflow-x-auto w-full flex justify-center">
              <img
                src={`https://ghchart.rshah.org/ff4f00/${githubUsername}`}
                alt={`${githubUsername}'s GitHub chart`}
                className="rounded-none border border-border max-w-full bg-background/50 p-2"
                style={{ minWidth: '600px', maxWidth: '100%', height: 'auto' }}
              />
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-4 bg-destructive/20 border border-destructive text-destructive rounded-none text-center font-mono text-xs"
          >
            Error loading GitHub stats: {error}
          </motion.div>
        )}
      </div>
    </section>
  );
}
