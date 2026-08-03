import { motion } from 'framer-motion';

export default function FloatingClouds() {
  return (
    <>
      <motion.div
        className="absolute left-[-20%] top-[8%] h-[260px] w-[520px] rounded-full bg-cyan-200/10 blur-3xl opacity-70"
        animate={{ x: [0, 20, 0] }}
        transition={{ duration: 120, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute right-[-24%] top-[22%] h-[220px] w-[430px] rounded-full bg-sky-300/10 blur-3xl opacity-60"
        animate={{ x: [0, -24, 0] }}
        transition={{ duration: 108, repeat: Infinity, ease: 'easeInOut' }}
      />
    </>
  );
}
