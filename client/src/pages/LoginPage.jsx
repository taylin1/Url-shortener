import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login submitted:', { email, password });
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#030712] text-slate-100 overflow-hidden font-sans select-none">

      {/* Technical Grid Overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="login-grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(6, 182, 212, 0.12)" strokeWidth="1" />
            <circle cx="50" cy="0" r="1.5" fill="rgba(6, 182, 212, 0.2)" />
          </pattern>
          <radialGradient id="fade-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="grid-mask">
            <rect width="100%" height="100%" fill="url(#fade-grad)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#login-grid)" mask="url(#grid-mask)" />
      </svg>

      {/* Layered Nebula / Atmospheric Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-cyan-950/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-blue-950/25 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[350px] h-[350px] bg-emerald-950/15 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />

      {/* Futuristic Concentric Sphere/HUD */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-40 select-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl shadow-[0_0_80px_rgba(6,182,212,0.3)] animate-pulse" style={{ animationDuration: '6s' }} />

        <svg className="w-[550px] h-[550px]" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="92" stroke="rgba(6, 182, 212, 0.15)" strokeWidth="0.5" />
          <circle
            cx="100"
            cy="100"
            r="82"
            stroke="rgba(6, 182, 212, 0.25)"
            strokeWidth="1"
            strokeDasharray="4 8"
            className="origin-center animate-[spin_60s_linear_infinite]"
          />
          <circle cx="100" cy="100" r="70" stroke="rgba(37, 99, 235, 0.2)" strokeWidth="0.8" />
          <circle
            cx="100"
            cy="100"
            r="67"
            stroke="rgba(6, 182, 212, 0.3)"
            strokeWidth="1.5"
            strokeDasharray="40 100 20 40"
            className="origin-center animate-[spin_40s_linear_infinite_reverse]"
          />
          <path d="M 100 10 V 25 M 100 175 V 190 M 10 100 H 25 M 175 100 H 190" stroke="rgba(6, 182, 212, 0.3)" strokeWidth="0.5" />
          <path d="M 28 28 L 22 28 V 22" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="0.8" />
          <path d="M 172 28 L 178 28 V 22" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="0.8" />
          <path d="M 28 172 L 22 172 V 178" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="0.8" />
          <path d="M 172 172 L 178 172 V 178" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="0.8" />
        </svg>
      </div>

      {/* Form Panel */}
      <div className="w-full max-w-[420px] px-6 py-8 relative z-10 mx-4">

        {/* Glassmorphic Wrapper */}
        <div className="relative backdrop-blur-xl bg-slate-950/45 rounded-2xl border border-cyan-500/15 p-8 shadow-[0_0_50px_rgba(6,182,212,0.08),inset_0_0_24px_rgba(6,182,212,0.03)] overflow-hidden">

          {/* Tech Corner Accents */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400/80 rounded-tl-2xl" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400/30 rounded-tr-2xl" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400/30 rounded-bl-2xl" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400/80 rounded-br-2xl" />

          {/* Form Header */}
          <div className="mb-8 text-center">
            <h1 className="text-cay">Url Shortener</h1>
            <h1 className="text-2xl font-bold uppercase tracking-wider text-slate-100">
              Login
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Sign in to your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Email Input */}
            <div className="space-y-2 relative">
              <label className="text-sm text-cyan-400">
                Email
              </label>
              <div className="relative group">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-600 px-4 py-3 rounded-lg text-sm transition-all outline-none focus:border-cyan-500/50 focus:shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1.5px] bg-cyan-400/85 transition-all duration-300 group-focus-within:w-[calc(100%-8px)]" />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2 relative">
              <div className="flex justify-between items-center">
                <label className="text-sm text-cyan-400">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-slate-400 hover:text-cyan-400 transition-colors uppercase"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-600 px-4 py-3 rounded-lg text-sm transition-all outline-none focus:border-cyan-500/50 focus:shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1.5px] bg-cyan-400/85 transition-all duration-300 group-focus-within:w-[calc(100%-8px)]" />
              </div>
            </div>

            {/* Login Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full relative py-3 px-6 rounded-lg bg-transparent border border-cyan-400/60 overflow-hidden font-semibold tracking-wide text-sm uppercase text-cyan-300 hover:text-white transition-colors duration-300 group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/10 to-blue-600/10 opacity-30 group-hover:opacity-100 transition-all duration-300 -z-10" />
                <div className="absolute top-0 left-0 -translate-x-full group-hover:translate-x-full w-full h-full bg-gradient-to-r from-transparent via-cyan-500/15 to-transparent transition-all duration-1000 ease-out" />
                <span className="relative" style={{ textShadow: '0 0 6px rgba(34,211,238,0.2)' }}>
                  Login
                </span>
              </button>
            </div>

          </form>

          {/* Toggle to Signup */}
          <div className="mt-8 text-center border-t border-slate-900 pt-6">
            <p className="text-sm text-slate-500">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/signup')}
                className="text-cyan-400/80 hover:text-cyan-400 font-bold hover:underline transition-colors"
              >
                Sign up
              </button>
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
