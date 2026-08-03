import { motion } from 'framer-motion';

const stars = Array.from({ length: 24 }, (_, index) => ({
  id: index,
  left: Math.random() * 100,
  top: Math.random() * 55,
  size: Math.random() * 2 + 1,
  delay: Math.random() * 6,
  duration: 4 + Math.random() * 4,
}));

export default function Stars() {
  return (
    <>
      {stars.map((star) => (
        <motion.span
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            width: `${star.size}px`,
            height: `${star.size}px`,
            left: `${star.left}%`,
            top: `${star.top}%`,
            boxShadow: '0 0 12px rgba(255, 255, 255, 0.35)',
          }}
          animate={{ opacity: [0.25, 1, 0.25], y: [0, -6, 0] }}
          transition={{ duration: star.duration, delay: star.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </>
  );
}
