import { useMemo, useRef, useState, type MouseEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import BackgroundEffects from '../components/BackgroundEffects.jsx';
import CursorGlow from '../components/CursorGlow.jsx';
import LoginCard from '../components/LoginCard.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement | null>(null);

  const statusLabel = useMemo(() => {
    if (!password) return 'Enter password';
    if (password.length < 6) return 'Too weak';
    return 'Ready to login';
  }, [password]);

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 16;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <BackgroundEffects />
      <CursorGlow />
      <div className="absolute inset-0 bg-[#080c1c]/60" />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <AnimatePresence>
          <motion.div
            ref={cardRef}
            className="w-full max-w-md rounded-[2rem] border border-white/20 bg-white/10 p-10 shadow-glass backdrop-blur-2xl"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{ transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)` }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <LoginCard
              email={email}
              password={password}
              showPassword={showPassword}
              remember={remember}
              strength={statusLabel}
              onEmailChange={(e) => setEmail(e.target.value)}
              onPasswordChange={(e) => setPassword(e.target.value)}
              onTogglePassword={() => setShowPassword((curr) => !curr)}
              onToggleRemember={() => setRemember((curr) => !curr)}
              onSubmit={(e) => {
                e.preventDefault();
                console.log('Login submit', { email, password, remember });
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
