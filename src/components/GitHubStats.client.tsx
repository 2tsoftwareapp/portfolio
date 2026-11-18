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
      className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-border"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sticky Chapter Header */}
          <motion.div
            className="lg:col-span-4 lg:sticky lg:top-28 lg:self-start"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <p className="font-serif italic text-lg text-primary mb-3">
              Chapter IV — Open Source Index
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl font-medium mb-4">
              GitHub Footprint
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Real public signals from github.com/{githubUsername}
            </p>
            <div className="w-12 h-0.5 bg-primary mt-6" aria-hidden="true" />
          </motion.div>

          {/* Telemetry content */}
          <div className="lg:col-span-8">
            {/* Stats grid */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-b border-border py-8"
              variants={containerVariants}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
            >
              {statItems.map((stat, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="text-left"
                >
                  <stat.icon className="h-4 w-4 text-primary mb-2" />
                  <div className="font-serif italic text-4xl text-foreground mb-1">
                    {loading ? '...' : stat.value.toLocaleString()}
                  </div>
                  <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>

            {(stats?.latestRepo || stats?.featuredRepo) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mt-8 grid gap-6 md:grid-cols-2"
              >
                {stats.latestRepo && (
                  <a
                    href={stats.latestRepo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-none border border-border bg-card/50 p-5 transition-colors hover:border-primary/50"
                  >
                    <div className="mb-2 font-serif italic text-xs text-primary">
                      Recently active repo
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-serif text-xl text-foreground">{stats.latestRepo.name}</div>
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
                    className="rounded-none border border-border bg-card/50 p-5 transition-colors hover:border-primary/50"
                  >
                    <div className="mb-2 font-serif italic text-xs text-primary">
                      Most starred public repo
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-serif text-xl text-foreground">{stats.featuredRepo.name}</div>
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
              className="mt-8 bg-card/50 p-6 rounded-none border border-border"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
                <h3 className="font-serif text-xl font-medium text-foreground">Contribution Activity</h3>
                <a
                  href={`https://github.com/${githubUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-none hover:bg-primary/90 transition-colors text-xs font-medium tracking-wide self-start sm:self-auto"
                >
                  <Github className="h-4 w-4" />
                  View GitHub Profile
                </a>
              </div>
              <div className="flex justify-center">
                <div className="overflow-x-auto w-full flex justify-center">
                  <img
                    src={`https://ghchart.rshah.org/e54324/${githubUsername}`}
                    alt={`${githubUsername}'s GitHub chart`}
                    className="rounded-none border border-border max-w-full bg-background/40 p-2"
                    style={{ minWidth: '600px', maxWidth: '100%', height: 'auto' }}
                  />
                </div>
              </div>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-4 bg-destructive/20 border border-destructive/40 text-destructive rounded-none font-serif italic text-sm"
              >
                Error loading GitHub stats: {error}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
