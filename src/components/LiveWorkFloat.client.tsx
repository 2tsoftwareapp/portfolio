'use client';

import { motion } from 'framer-motion';
import { useRef, useState } from 'react';
import { liveWork } from '@/lib/config';

export function LiveWorkFloatClient() {
  const constraintsRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const floatAnimation = isDragging
    ? {}
    : {
        y: [0, -10, 0],
        rotate: [0, 1.5, 0],
      };

  return (
    <>
      {/* Fixed full-viewport constraint layer */}
      <div
        ref={constraintsRef}
        className="fixed inset-0 pointer-events-none z-[9999]"
      />

      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        dragMomentum={false}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        // Desktop: bottom-right corner | Mobile: bottom-left, smaller
        className="fixed z-[9999] pointer-events-auto cursor-grab active:cursor-grabbing
          bottom-6 right-6
          sm:bottom-8 sm:right-8"
        style={{ touchAction: 'none' }}
      >
        <motion.div
          animate={floatAnimation}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="flex items-center gap-3 sm:gap-4 rounded-none border border-border bg-card/95 
            px-3 py-3 sm:px-5 sm:py-4 
            shadow-xl backdrop-blur-sm
            max-w-[200px] sm:max-w-none"
        >
          <motion.div
            animate={{
              boxShadow: [
                '0 0 0 rgba(255,79,0,0.0)',
                '0 0 24px rgba(255,79,0,0.22)',
                '0 0 0 rgba(255,79,0,0.0)',
              ],
            }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-none pointer-events-none"
          />
          <div className="h-9 w-9 sm:h-12 sm:w-12 rounded-none border border-border bg-background/80 p-1.5 sm:p-2 flex-shrink-0">
            <img
              src="/livework/vietis-icon.png"
              alt="Viet IS"
              className="h-full w-full object-contain"
              loading="lazy"
            />
          </div>
          <div className="space-y-0.5 sm:space-y-1 min-w-0">
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] font-mono text-muted-foreground/70 truncate">
              {liveWork.label}
            </p>
            <a
              href={liveWork.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm sm:text-lg font-bold font-mono text-foreground hover:text-primary transition-colors truncate"
            >
              {liveWork.company}
            </a>
            <p className="text-xs sm:text-sm font-mono text-muted-foreground truncate hidden sm:block">
              {liveWork.location}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
