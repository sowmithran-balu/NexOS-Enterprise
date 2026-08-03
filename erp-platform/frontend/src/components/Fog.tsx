import { motion } from 'framer-motion';

export default function Fog() {
  return (
    <>
      <motion.div
        className="absolute left-1/2 bottom-0 h-[26vh] w-[140%] -translate-x-1/2 rounded-full bg-white/20 blur-3xl opacity-30"
        animate={{ x: ['-10%', '10%', '-10%'] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute left-1/3 bottom-0 h-[16vh] w-[110%] rounded-full bg-white/16 blur-3xl opacity-25"
        animate={{ x: ['5%', '-8%', '5%'] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
    </>
  );
}
