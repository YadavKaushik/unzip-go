import React, { useRef } from 'react';
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

  return (
    <div
      ref={trackRef}
      className="flex gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-none -mx-3 px-3 pb-1"
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
            className="relative overflow-hidden cursor-pointer shrink-0 snap-start"
            style={{ width: 'calc((100% - 1rem) / 3)', aspectRatio: '270 / 345' }}
          >
            <img
              src={cardImg}
              alt={game.name}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
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
