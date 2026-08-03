import { motion } from 'framer-motion';

const birds = Array.from({ length: 6 }, (_, index) => ({
  id: index,
  delay: Math.random() * 10,
  duration: 10 + Math.random() * 8,
  top: 12 + Math.random() * 46,
  opacity: 0.35 + Math.random() * 0.4,
}));

export default function Birds() {
  return (
    <>
      {birds.map((bird) => (
        <motion.span
          key={bird.id}
          className="absolute h-[3px] w-[18px] rounded-full bg-white/70 blur-[0.5px]"
          style={{ top: `${bird.top}%`, left: '-10%' , opacity: bird.opacity }}
          animate={{ x: ['-18%', '110%'], y: [0, -8, 0] }}
          transition={{ duration: bird.duration, delay: bird.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </>
  );
}
