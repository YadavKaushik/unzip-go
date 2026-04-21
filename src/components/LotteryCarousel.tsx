import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface Game {
  id: string;
  name: string;
  hot?: boolean;
}

interface Props {
  games: Game[];
  onGameClick: (name: string) => void;
  cardImgs: Record<string, string>;
}

export default function LotteryCarousel({ games, onGameClick, cardImgs }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [index, setIndex] = useState(0);

  // Auto-slide every 3s
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % games.length);
    }, 3000);
    return () => clearInterval(id);
  }, [paused, games.length]);

  // Scroll to index when it changes (auto-slide only — user manual scroll is independent)
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const child = el.children[index] as HTMLElement | undefined;
    if (!child) return;
    el.scrollTo({ left: child.offsetLeft - el.offsetLeft, behavior: 'smooth' });
  }, [index]);

  return (
    <div
      ref={trackRef}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setTimeout(() => setPaused(false), 4000)}
      onMouseDown={() => setPaused(true)}
      onMouseUp={() => setTimeout(() => setPaused(false), 4000)}
      className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-none -mx-3 px-3 pb-1"
      style={{ scrollbarWidth: 'none' }}
    >
      {games.map((game) => {
        const cardImg = cardImgs[game.name];
        const isHot = !!game.hot;
        return (
          <motion.div
            key={game.id}
            onClick={() => onGameClick(game.name)}
            whileTap={{ scale: 0.95 }}
            animate={isHot ? { y: [0, -3, 0] } : {}}
            transition={isHot ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } : {}}
            className="relative rounded-2xl overflow-hidden cursor-pointer shrink-0 snap-start shadow-lg"
            style={{ width: 'calc((100% - 1.5rem) / 3)', aspectRatio: '270 / 345' }}
          >
            <img
              src={cardImg}
              alt={game.name}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
              draggable={false}
            />
            {isHot && (
              <motion.div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.22) 50%, transparent 65%)',
                  mixBlendMode: 'screen',
                }}
                animate={{ x: ['-120%', '120%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.2 }}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
