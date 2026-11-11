import {
  Layers as LayersIcon,
  Sparkles as SparklesIcon,
  Server as ServerIcon,
  BriefcaseBusiness,
  Mail as MailIcon,
  Users as UsersIcon,
  type LucideIcon,
} from 'lucide-react';
import type { ProjectCategory } from '@/types';

export const projectCategories: ProjectCategory[] = ['All', 'Web', 'Mobile', 'Open Source', 'Product'];

/** Production canonical origin — must match `site` in `astro.config.mjs`. */
export const CANONICAL_SITE_URL = 'https://truongsoftware.com' as const;

export const personalInfo = {
  name: "Dao Quang Truong",
  role: "Middle+ Fullstack Developer",
  bio: "Middle+ full-stack engineer specializing in TypeScript, React, Next.js, Node.js, NestJS, C#, PostgreSQL, reporting workflows, and cross-platform products. Proven track record of leading engineering teams, modernizing legacy services, and delivering reliable enterprise products for VIETIS, Viettel, and Naver.",
  location: "Ninh Binh, Vietnam",
  phone: "(+84) 96 906 9035",
  email: "truongdq.dev@gmail.com",
  website: "porfolio-truongdq.vercel.app",
  githubUsername: "truongnat",
  focusAreas: [
    'Full-stack Application Engineering',
    'Backend & API Development',
    'Cross-Platform Architecture',
    'Technical Leadership',
  ],
  socials: [
    {
      platform: "LinkedIn",
      url: "https://linkedin.com/in/truongdq01",
      icon: BriefcaseBusiness,
    },
    {
      platform: "Email",
      url: "mailto:truongdq.dev@gmail.com",
      icon: MailIcon,
    },
  ],
  typingPhrases: [
    'Fullstack Developer',
    'Web Application Engineer',
    'Backend & API Developer',
    'Cross-platform Architect',
  ],
  resumeUrl: "/Dao_Quang_Truong_CV.pdf",
  stats: [
    { label: 'Years engineering', value: '6+' },
    { label: 'Engineers mentored', value: '8+' },
    { label: 'API latency reduced', value: '50%' },
    { label: 'Runtime tests passing', value: '183' }
  ]
};

export const liveWork = {
  company: 'VIETIS',
  url: 'https://vietis.com.vn/en/',
  location: 'Vietnam',
  label: 'Current Workplace',
} as const;

export const appInfo = {
  version: '0.0.1',
  hash: 'unknown',
  license: {
    name: 'MIT License',
    year: new Date().getFullYear().toString(),
    copyright: `Copyright © ${new Date().getFullYear()} Dao Quang Truong`,
    fullText: `MIT License - Copyright © ${new Date().getFullYear()} Dao Quang Truong`
  }
};

export const seo = {
  title: "Dao Quang Truong | Middle+ Fullstack Developer",
  description: "Middle+ full-stack engineer specializing in TypeScript, React, Next.js, Node.js, NestJS, C#, PostgreSQL, and cross-platform systems.",
  keywords: [
    'portfolio',
    'developer',
    'mid-level software engineer',
    'full-stack',
    'platform engineering',
    'TypeScript',
    'React',
    'React Native',
    'Node.js',
    'Python',
    'Rust',
    'PostgreSQL',
    'system design',
    'technical leadership',
    'Team Leader',
    'CI/CD',
    'DevOps',
    'Viettel',
    'Naver',
    'Next.js',
    'NestJS',
    'C#',
    'TanStack',
    'ERP',
    'OCR',
    'Keycloak',
    'Reporting',
    'Performance Optimization',
  ],
  url: CANONICAL_SITE_URL,
  image: '/avatar.jpg',
};


export interface SkillSubSection {
  label: string;
  skills: string[];
  highlight?: string;
}

export interface SkillCardData {
  id: string;
  title: string;
  level?: string;
  icon: LucideIcon;
  subSections: SkillSubSection[];
}

export const skillsConfig = {
  cards: [
    {
      id: 'frontend-crossplatform',
      title: 'Core Stack & Cross-Platform',
      level: 'Advanced',
      icon: LayersIcon,
      subSections: [
        {
          label: 'Core',
          skills: ['TypeScript', 'React Native', 'Electron.js', 'Vue.js', 'Flutter', 'Nuxt.js', 'Next.js'],
          highlight: 'Advanced in building unified cross-platform solutions across Web, Mobile, and Desktop.'
        },
        {
          label: 'Data Visualization',
          skills: ['D3.js', 'ChartJS', 'Leaflet.js'],
          highlight: 'Complex geospatial data visualization and KPI dashboards.'
        }
      ]
    },
    {
      id: 'backend-devops',
      title: 'Backend & DevOps',
      level: 'Advanced',
      icon: ServerIcon,
      subSections: [
        {
          label: 'Backend',
          skills: ['Node.js (NestJS/Express)', 'Python', 'PostgreSQL']
        },
        {
          label: 'Infrastructure',
          skills: ['Docker', 'Jenkins', 'GitLab CI/CD', 'GitHub Actions', 'Linux/Ubuntu', 'Nginx', 'AWS'],
          highlight: 'Architecting high-scale enterprise solutions with robust CI/CD pipelines.'
        }
      ]
    },
    {
      id: 'leadership',
      title: 'Engineering Leadership',
      icon: UsersIcon,
      subSections: [
        {
          label: 'Management',
          skills: ['Team Mentoring', 'Technical Interviewing', 'Agile/Scrum', 'System Architecture'],
          highlight: 'Led and mentored cross-functional teams of 8+ engineers.'
        }
      ]
    }
  ] as SkillCardData[],
};

export interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  description?: string;
  achievements: string[];
}

export interface Project {
  id: string;
  title: string;
  role: string;
  period: string;
  description: string;
  techStack: string[];
  categories: ProjectCategory[];
  achievements: string[];
  link?: string;
}

export const workExperience: Experience[] = [
  {
    id: 'vietis',
    role: 'Fullstack Developer',
    company: 'VIETIS',
    period: 'Mar 2026 – Present',
    description: 'Delivering full-stack features for a Japanese school-management and OCR assessment platform, plus an enterprise ERP accounting and reporting platform.',
    achievements: [
      'Japanese School Management & OCR Assessment Platform: Developed student and teacher management features for a school-operations system serving the Japanese market.',
      'OCR Assessment: Fixed and improved OCR-based exam scoring workflows, resolving issues in scan processing and assessment results.',
      'Identity & Access: Investigated and resolved Keycloak-related authentication and authorization issues.',
      'Enterprise ERP Accounting & Reporting Platform: Developed report features and business-rule-driven file export and file-generation workflows using a TanStack React frontend and C# backend.',
    ],
  },
  {
    id: 'blameo',
    role: 'Software Engineer / Team Leader',
    company: 'Blameo (Outsourcing for Viettel Group)',
    period: 'Jun 2022 – Present',
    achievements: [
      'Engineering Leadership: Led and mentored a cross-functional team of 8 engineers. Scaled the engineering department by designing a rigorous technical interview framework and established a structured mentorship program for interns.',
      'Backend Architecture: Refactored legacy Node.js services reducing API latency by 50% and improving system reliability during peak loads.',
      'Full-stack Development: Architected a KPI tracking platform and Viettel Cloud features using React, TypeScript, and Node.js. Established high-level coding standards such as ESLint and Git flow.',
    ],
  },
  {
    id: 'cmc',
    role: 'Software Engineer',
    company: 'CMC Global',
    period: 'Oct 2021 – Jun 2022',
    achievements: [
      'Cross-Platform Development: Engineered a unified video conference solution across Web (Vue.js), Desktop (Electron.js), and Mobile (React Native) platforms.',
      'Real-Time Communication (RTC): Researched and implemented media synchronization algorithms to stabilize video quality and connection across different devices and bandwidths.',
      'Code Quality: Actively participated in code reviews and architectural discussions to ensure clean code and minimize production bugs.',
    ],
  },
  {
    id: 'ntq',
    role: 'Frontend Developer',
    company: 'NTQ Solution',
    period: 'Oct 2020 – Oct 2021',
    achievements: [
      'Low-Code Platform Development: Built core features for a mobile app generation platform using React Native, focusing on automation and dynamic functionality.',
      'E-Learning Application: Developed an exam and e-learning mobile app with a focus on intuitive user interfaces and smooth interactive flows.',
    ],
  },
];

export const projectsConfig: Project[] = [
  {
    id: 'templatenext',
    title: 'TemplateNext',
    role: 'Author',
    period: 'Nov 2026',
    description: 'A synchronous Node.js template engine: restricted expressions compile to verified bytecode and run in a bounded Rust VM. Template source cannot call JavaScript, open files, or hit the network.',
    techStack: ['TypeScript', 'Rust', 'N-API', 'Node.js'],
    categories: ['Open Source'],
    achievements: [
      'Restricted language with if, each, filters, helpers, and literal-name partials; no JS blocks.',
      'Compile → verifier → bounded VM with instruction, loop, and output limits.',
      'Ordinary interpolations HTML-escaped; raw output requires branded SafeHtml.',
      'Linux x64 glibc native addon, tested on Node 22, 24, and 26.',
    ],
    link: 'https://github.com/2tsoftwareapp/templatenext',
  },
  {
    id: 'semvernext',
    title: 'semvernext',
    role: 'Author',
    period: 'Nov 2026',
    description: 'A zero-dependency SemVer 2.0.0 parser and range evaluator for TypeScript, checked against node-semver 7.8.6 fixtures, with explain() for branch-level range failures.',
    techStack: ['TypeScript', 'Node.js', 'Bun'],
    categories: ['Open Source'],
    achievements: [
      '1,392 range-parse cases and 133 increment cases matched against node-semver 7.8.6.',
      'explain() names the failed comparator and prerelease-policy exclusions.',
      'Zero runtime dependencies; dual ESM and CommonJS for Node >= 20 and Bun.',
    ],
    link: 'https://github.com/2tsoftwareapp/semvernext',
  },
  {
    id: 'jsondiffnext',
    title: 'jsondiffnext',
    role: 'Author',
    period: 'Nov 2026',
    description: 'A safety wrapper over three JSON diff engines. Every diff is a version-1 bundle pinned with SHA-256 of RFC 8785 canonical JSON, applied atomically on a clone.',
    techStack: ['TypeScript', 'Node.js', 'JSON Patch', 'RFC 6902'],
    categories: ['Open Source'],
    achievements: [
      'One API over fast-json-patch, jsondiffpatch, and rfc6902.',
      'Hash-guarded forward/inverse bundles; apply and revert stage on a clone.',
      'Admission limits for work and nesting, with a guarded root-replacement fallback.',
      '349 tests covering hash guards, engine policy, and safety invariants.',
    ],
    link: 'https://github.com/2tsoftwareapp/jsondiffnext',
  },
  {
    id: 'textdiffnext',
    title: 'textdiffnext',
    role: 'Author',
    period: 'Nov 2026',
    description: 'A UTF-16-native rewrite of Google diff-match-patch for JavaScript. Diff, match, and patch stay in code-unit coordinates; surrogate pairs serialize as %uXXXX instead of UTF-8 bytes.',
    techStack: ['TypeScript', 'diff-match-patch', 'Node.js'],
    categories: ['Open Source'],
    achievements: [
      'Removed UTF-8 byte translation so JS .length and patch indices agree.',
      'Surrogate-safe URI serialization (%uXXXX) for astral characters.',
      'Typed public API with applyPatches, makePatches, and delta helpers.',
    ],
    link: 'https://github.com/2tsoftwareapp/textdiffnext',
  },
  {
    id: 'vietis-school-ocr',
    title: 'Japanese School Management & OCR Assessment Platform',
    role: 'Fullstack Developer',
    period: 'Mar 2026 – Present',
    description: 'Enterprise school-management platform for the Japanese market, covering student and teacher administration, OCR-based exam scanning, and automated scoring workflows.',
    techStack: ['Next.js', 'React', 'TypeScript', 'NestJS', 'OCR', 'Keycloak'],
    categories: ['Web', 'Product'],
    achievements: [
      'Scope: Developed features for student and teacher management across the school administration workflow.',
      'OCR Assessment: Fixed and improved OCR-based exam scoring workflows, resolving issues affecting scan processing and assessment results.',
      'Identity & Access: Investigated and resolved Keycloak-related authentication and authorization issues.',
    ],
  },
  {
    id: 'vietis-erp-accounting',
    title: 'Enterprise ERP Accounting & Reporting Platform',
    role: 'Fullstack Developer',
    period: 'Mar 2026 – Present',
    description: 'Enterprise ERP accounting platform focused on business-rule-driven reporting, file export, and document generation workflows.',
    techStack: ['React', 'TanStack', 'TypeScript', 'C#'],
    categories: ['Web', 'Product'],
    achievements: [
      'Reporting: Developed report features aligned with accounting and enterprise business workflows.',
      'File Export: Implemented export and file-generation flows based on business rules and operational data.',
      'Full-stack Delivery: Built TanStack-based React interfaces and connected reporting workflows to the C# backend.',
    ],
  },
  {
    id: 'rnui',
    title: 'RNUI — React Native UI Framework',
    role: 'Author & Maintainer',
    period: 'Mar 2026 – Present',
    description: 'A high-performance, dual-layer UI design system for React Native (iOS + Android). 62+ components, 120+ icons, New Architecture ready. Published on npm as a monorepo with headless primitives, design tokens, styled components, and multi-brand themes.',
    techStack: ['React Native', 'TypeScript', 'Reanimated 3', 'Gesture Handler', 'Turbo', 'Bun', 'Changesets', 'npm'],
    categories: ['Mobile', 'Open Source'],
    achievements: [
      'Challenge: Build a production-grade React Native UI library that works for both design-system consumers (styled) and custom-style users (headless).',
      'Action: Designed dual-layer architecture — @truongdq01/headless (logic/state/a11y, zero styles) + @truongdq01/ui (styled, wraps headless). Added @truongdq01/tokens (design tokens) and @truongdq01/themes (multi-brand presets). Managed as Turborepo monorepo with Changesets for versioning.',
      'Result: Published v1.0.1 to npm with 62+ components, 120+ icons, full TypeScript support, and React Native New Architecture compatibility. Zero-config theming with brand plugin system.',
    ],
    link: 'https://www.npmjs.com/package/@truongdq01/ui'
  },
  {
    id: 'example-react',
    title: 'TanStack Full Demo',
    role: 'Fullstack Developer',
    period: 'Present',
    description: 'A beginner-friendly dashboard showcasing all major TanStack libraries working together in a real app — Query, Table, Virtual, Form, Store, and Router. Built with TanStack Start (SSR), shadcn/ui, and Tailwind CSS v4, deployed on Vercel.',
    techStack: ['React 19', 'TypeScript', 'TanStack Start', 'TanStack Query', 'TanStack Table', 'TanStack Virtual', 'TanStack Form', 'TanStack Store', 'TanStack Router', 'shadcn/ui', 'Tailwind CSS v4', 'Vite', 'Nitro', 'Vercel'],
    categories: ['Web', 'Open Source'],
    achievements: [
      'Challenge: Demonstrating all major TanStack libraries in a single cohesive app that beginners can learn from.',
      'Action: Built a 3-page dashboard — Todos (Query + Form + Store with optimistic updates), Posts (Table with sort/filter/pagination + Virtual list for 100 rows), Users (Table + Form dialog with mutations).',
      'Result: A production-ready SSR app on Vercel showcasing real-world patterns: optimistic updates, cache invalidation, virtualization, headless UI, and SSR-safe global state.',
    ],
    link: 'https://example-react-brown.vercel.app'
  },
  {
    id: 'universal-music-downloader',
    title: 'Universal Music Downloader',
    role: 'Fullstack Developer',
    period: 'Present',
    description: 'Web app for downloading music and playlists from YouTube and SoundCloud as MP3 files. Runs entirely in the browser — audio conversion powered by ffmpeg.wasm (no server-side binaries). Clean developer-aesthetic UI aligned with portfolio design system.',
    techStack: ['Next.js 15', 'TypeScript', 'Tailwind CSS', 'shadcn/ui', 'ffmpeg.wasm', '@ffmpeg/ffmpeg', 'TanStack Query', 'yt-dlp', 'Bun', 'Vercel'],
    categories: ['Web', 'Open Source'],
    achievements: [
      'Challenge: Building a practical music downloader that works without server-side binaries, deployable on serverless platforms like Vercel.',
      'Action: Replaced server-side ffmpeg-static with ffmpeg.wasm for client-side audio conversion; built unified input that auto-detects SoundCloud vs YouTube URLs; redesigned UI to match portfolio dark zinc aesthetic with JetBrains Mono typography.',
      'Result: A fully serverless music downloader supporting single tracks, playlists, and MP3 quality selection — deployed on Vercel with zero native dependencies.',
    ],
    link: 'https://universal-music-downloader-truongdqdev-9126s-projects.vercel.app'
  },
  {
    id: 'netbi',
    title: 'NetBI – KPI Management Platform',
    role: 'Software Engineer',
    period: 'Jan 2023 – Jan 2024',
    description: 'Build a unified web and mobile platform for enterprise KPI monitoring with complex data visualization needs.',
    techStack: ['React', 'React Native', 'ChartJS', 'GitLab CI/CD', 'Jenkins', 'Linux VPS', 'Nginx'],
    categories: ['Web', 'Mobile'],
    achievements: [
      'Challenge: Build a unified web and mobile platform for enterprise KPI monitoring with complex data visualization needs.',
      'Action: Led frontend development, building the foundational React and React Native codebases. Designed and implemented an interactive geospatial data visualization feature (Vietnam Map) for mobile.',
      'Result: Enabled real-time regional KPI tracking on mobile devices. Automated the build and deployment process for iOS and Android, significantly reducing manual release time.',
    ]
  },
  {
    id: 'naver-cloud',
    title: 'Naver Cloud Meeting',
    role: 'Software Engineer',
    period: 'Jun 2021 – Dec 2022',
    description: 'Develop a stable, multi-platform video conferencing solution with consistent user experience.',
    techStack: ['Vue.js', 'React Native', 'Electron.js', 'Jitsi Meet'],
    categories: ['Web', 'Mobile'],
    achievements: [
      'Challenge: Develop a stable, multi-platform video conferencing solution with consistent user experience.',
      'Action: Engineered real-time video features for web (Vue.js), desktop (Electron), and mobile (React Native) using the Jitsi Meet core.',
      'Result: Delivered a seamless cross-platform conferencing tool that maintained stable video quality.',
    ]
  },
  {
    id: 'gopass',
    title: 'GoPass – Online Exam Platform',
    role: 'Mobile Developer',
    period: 'Oct 2020 – Jun 2021',
    description: 'Create a stable, user-friendly exam application for the Japanese market with offline functionality.',
    techStack: ['React Native', 'Realm DB', 'PHP'],
    categories: ['Mobile'],
    achievements: [
      'Challenge: Create a stable, user-friendly exam application for the Japanese market with offline functionality.',
      'Action: Developed the mobile app using React Native and implemented an offline-first architecture using Realm DB for local data caching and synchronization.',
      'Result: Successfully launched the app, which handled complex exam flows smoothly.',
    ]
  },
];

export interface Award {
  id: string;
  title: string;
  organization: string;
  date: string;
  icon?: LucideIcon;
}

export interface Certificate {
  title: string;
  issuer: string;
  year: string;
  description: string;
  credentialId?: string;
  credentialUrl?: string;
}

export const certificatesData: Certificate[] = [
  {
    title: 'Employee of the Year',
    issuer: 'Blameo Company',
    year: 'May 2023',
    description: 'Recognized for exceptional performance and contributions to the company.',
    credentialId: 'EOTY-2023-001'
  }
  /*
  {
    title: 'AWS Certified Solutions Architect',
    issuer: 'Amazon Web Services',
    year: '2022',
    description: 'Demonstrated ability to design distributed systems on AWS platform with best practices for security and scalability.',
    credentialId: 'AWS-SA-2022-12345',
    credentialUrl: 'https://www.credly.com/badges/abc123'
  },
  {
    title: 'Google Cloud Professional Data Engineer',
    issuer: 'Google Cloud',
    year: '2023',
    description: 'Validated expertise in designing and implementing data processing systems on Google Cloud Platform.',
    credentialId: 'GCP-DATA-2023-67890'
  },
  {
    title: 'Microsoft Certified: Azure Developer Associate',
    issuer: 'Microsoft',
    year: '2023',
    description: 'Demonstrated ability to design and build cloud applications using Microsoft Azure services.',
    credentialId: 'AZURE-DEV-2023-54321'
  },
  {
    title: 'AI & Machine Learning Specialization',
    issuer: 'Coursera (DeepLearning.AI)',
    year: '2023',
    description: 'Completed specialization courses in AI, neural networks, and machine learning engineering with focus on practical applications.'
  }
  */
];

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
  avatar?: string;
}

export const testimonialsData: Testimonial[] = [
  {
    quote: "Truong is an exceptional engineer who brings both technical depth and leadership skills to every project. His ability to architect scalable solutions while mentoring junior developers is impressive.",
    author: "Nguyen Van An",
    role: "PM at Viettel Net"
  },
  {
    quote: "Truong's expertise in cross-platform development helped us deliver a seamless video conferencing solution across web, mobile, and desktop. His attention to detail and problem-solving skills are outstanding.",
    author: "Vu Ba Huan",
    role: "Director at CMC"
  }
];

export const awards: Award[] = [
  {
    id: 'employee-of-year-2023',
    title: 'Employee of the Year',
    organization: 'Blameo Company',
    date: 'May 2023',
    icon: SparklesIcon,
  },
];

export const navLinks = [
  { label: 'Experience', href: '/#experience' },
  { label: 'Projects', href: '/#projects' },
  { label: 'Skills', href: '/#skills' },
  { label: 'Now', href: '/now/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'Tech Radar', href: '/tech-radar/' },
  { label: 'Contact', href: '/#contact' },
];

export const uiStrings = {
  common: {
    logo: 'TRUONG.DEV',
  },
  hero: {
    eyebrow: 'Middle+ engineering profile',
    focusLabel: 'Core expertise',
    snapshotLabel: 'Career snapshot',
    currentFocusLabel: 'Current focus',
    cta: {
      projects: 'View selected projects',
      cv: 'Download resume',
      contact: 'Start a conversation',
    },
  },
  skills: {
    title: 'Technical Skills',
    subtitle: 'Full-stack Engineering · Web Applications · Cross-Platform Development',
  },
  experience: {
    title: 'Professional Experience',
    subtitle: 'Leadership, delivery, and measurable outcomes',
    achievementsTitle: 'Major Achievements',
  },
  projects: {
    title: 'Selected Projects',
    subtitle: 'Production systems, developer tools, and open-source products',
    emptyMessage: 'NO_PROJECTS_FOUND',
    impactLabel: 'Impact',
    viewLive: 'View project',
  },
  contact: {
    title: 'Contact',
    subtitle: 'Available for full-stack engineering and platform opportunities',
    form: {
      nameLabel: '01 // Name',
      namePlaceholder: 'ENTER_NAME',
      emailLabel: '02 // Email',
      emailPlaceholder: 'ENTER_EMAIL',
      messageLabel: '03 // Message',
      messagePlaceholder: 'TYPE_MESSAGE...',
      submitButton: 'SEND_MESSAGE',
      submittingButton: 'SENDING...',
    },
    messages: {
      success: 'Thank you! Your message has been sent successfully.',
      error: 'Failed to send message. Please try again.',
    }
  }
};
