import { motion } from 'framer-motion';
import bgImage from '../assets/hero.png';
import Birds from './Birds.jsx';
import Fog from './Fog.jsx';
import FloatingClouds from './FloatingClouds.jsx';
import Stars from './Stars.jsx';

export default function BackgroundEffects() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})`, backgroundAttachment: 'fixed' }}
      />
      <div className="absolute inset-0 bg-[#080c1c]/60" />
      <FloatingClouds />
      <Stars />
      <Birds />
      <Fog />
      <motion.div
        className="absolute left-[55%] top-[12%] h-[220px] w-[220px] rounded-full bg-white/20 blur-3xl"
        animate={{ scale: [0.96, 1.1, 0.96], opacity: [0.3, 0.48, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}
