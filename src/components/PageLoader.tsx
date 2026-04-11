import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';

export default function PageLoader() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[100] grid place-items-center bg-transparent"
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="relative flex h-28 w-28 items-center justify-center rounded-full border border-accent/35 bg-card/20 backdrop-blur-2xl"
      >
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.45, 0.15, 0.45] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full border border-accent/30"
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-3 rounded-full border border-dashed border-accent/25"
        />
        <div className="absolute inset-5 rounded-full bg-background/10 backdrop-blur-xl" />
        <motion.div
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-accent/40 bg-background/20 text-accent"
        >
          <Crown size={20} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
