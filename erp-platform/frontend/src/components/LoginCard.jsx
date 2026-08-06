import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { FaGoogle, FaGithub, FaLinkedinIn } from 'react-icons/fa';

export default function LoginCard({
  email,
  password,
  showPassword,
  remember,
  strength,
  error,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onToggleRemember,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-center text-sm text-red-400">
          {error}
        </div>
      )}
      <div className="space-y-3 text-center">
        <p className="text-sm uppercase tracking-[0.4em] text-slate-300/70">Welcome Back</p>
        <h2 className="text-4xl font-semibold text-white">Sign in to continue</h2>
        <p className="text-sm text-slate-300/80">Enter your credentials and access your premium dashboard.</p>
      </div>

      <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-xl">
        <label className="relative flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 shadow-glow transition-all duration-300 focus-within:border-sky-300/60 focus-within:ring-2 focus-within:ring-sky-400/20">
          <FiMail className="text-slate-300" size={20} />
          <input
            className="w-full bg-transparent text-white outline-none placeholder:text-slate-400"
            type="text"
            value={email}
            onChange={onEmailChange}
            placeholder="Enter username"
            required
            style={{ minHeight: '55px' }}
          />
        </label>

        <label className="relative flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 shadow-glow transition-all duration-300 focus-within:border-sky-300/60 focus-within:ring-2 focus-within:ring-sky-400/20">
          <FiLock className="text-slate-300" size={20} />
          <input
            className="w-full bg-transparent text-white outline-none placeholder:text-slate-400"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={onPasswordChange}
            placeholder="Enter password"
            required
            style={{ minHeight: '55px' }}
          />
          <button type="button" onClick={onTogglePassword} className="text-slate-300 transition hover:text-white">
            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>
        </label>

        <div className="mt-2 text-right text-xs text-slate-400">{strength}</div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
          <label className="inline-flex items-center gap-2 cursor-pointer select-none text-slate-200/90">
            <input type="checkbox" checked={remember} onChange={onToggleRemember} className="h-4 w-4 rounded border-white/20 bg-white/10 text-sky-400 focus:ring-sky-500" />
            Remember me
          </label>
          <button type="button" className="text-slate-300 transition hover:text-white">Forgot Password?</button>
        </div>
      </div>

      <button
        type="submit"
        className="group relative inline-flex w-full items-center justify-center rounded-3xl bg-gradient-to-r from-cyan-300 to-sky-500 px-6 py-4 text-base font-semibold text-slate-950 shadow-glow transition duration-300 hover:scale-[1.03] hover:brightness-110"
      >
        <span className="absolute inset-0 rounded-3xl bg-white/10 opacity-0 transition duration-500 group-hover:opacity-30" />
        Login
      </button>

      <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-slate-300/70">
          <span className="h-px flex-1 bg-white/10" />
          OR CONTINUE WITH
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <div className="mt-4 flex items-center justify-center gap-4">
          {[
            { icon: <FaGoogle className="h-5 w-5" />, label: 'Google' },
            { icon: <FaGithub className="h-5 w-5" />, label: 'GitHub' },
            { icon: <FaLinkedinIn className="h-5 w-5" />, label: 'LinkedIn' },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white transition duration-300 hover:scale-105 hover:rotate-[10deg] hover:border-sky-300/70 hover:bg-white/10"
            >
              {item.icon}
            </button>
          ))}
        </div>
      </div>

      <div className="text-center text-sm text-slate-300">
        <span>Don't have an account?</span>{' '}
        <button type="button" className="text-sky-300 transition hover:text-white hover:underline">Create Account</button>
      </div>
    </form>
  );
}
