import { motion } from 'framer-motion';

export default function PageLoader() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[100] grid place-items-center bg-background/55 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="relative flex w-[9.75rem] flex-col items-center rounded-[1.85rem] border border-border/40 bg-card/55 px-4 py-5 shadow-2xl backdrop-blur-2xl"
      >
        <motion.div
          animate={{ opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-[2rem] bg-background/10"
        />
        <div className="absolute inset-x-5 top-3 h-12 rounded-full bg-background/15 blur-xl" />

        <motion.div
          animate={{ opacity: [0.75, 1, 0.75] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="relative z-10 mb-3 text-center"
        >
          <p className="text-[0.82rem] font-black uppercase tracking-[0.18em] text-accent">
            TECHIE⁴⁰⁴
          </p>
        </motion.div>

        <div className="relative z-10 mb-2 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.15, repeat: Infinity, ease: 'linear' }}
            className="h-8 w-8 rounded-full border-[3px] border-border/35 border-t-accent"
          />
        </div>

        <p className="relative z-10 text-sm font-semibold tracking-[0.1em] text-foreground/90">
          Loading...
        </p>
      </motion.div>
    </motion.div>
  );
}
