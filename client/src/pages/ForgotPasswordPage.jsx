import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      // Where Supabase sends the user after they click the link in the email.
      // Must be allowlisted in Supabase → Authentication → URL Configuration.
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    // Show the confirmation regardless of whether the email exists.
    // This prevents attackers from discovering which emails have accounts.
    setSuccess(true);
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#030712] text-slate-100 overflow-hidden font-sans select-none">

      {/* Technical Grid Overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="forgot-grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(6, 182, 212, 0.12)" strokeWidth="1" />
            <circle cx="50" cy="0" r="1.5" fill="rgba(6, 182, 212, 0.2)" />
          </pattern>
          <radialGradient id="forgot-fade-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="forgot-grid-mask">
            <rect width="100%" height="100%" fill="url(#forgot-fade-grad)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#forgot-grid)" mask="url(#forgot-grid-mask)" />
      </svg>

      {/* Layered Nebula / Atmospheric Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-cyan-950/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-blue-950/25 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[350px] h-[350px] bg-emerald-950/15 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />

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
            <label className="text-cyan-400">Url Shortener</label>
            <h1 className="text-2xl font-bold uppercase tracking-wider text-slate-100">
              Reset Password
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Enter your email and we&apos;ll send you a reset link
            </p>
          </div>

          {success ? (
            /* Confirmation state — replaces the form after submitting */
            <div className="text-center space-y-4">
              <div className="text-sm text-cyan-400 bg-cyan-950/30 border border-cyan-500/30 rounded-lg px-4 py-3">
                If an account exists for {email}, a reset link is on its way. Check your inbox (and spam folder).
              </div>
              <Link
                to="/login"
                className="inline-block text-sm text-cyan-400/80 hover:text-cyan-400 font-bold hover:underline transition-colors"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Error message */}
              {error && (
                <div className="text-sm text-red-400 bg-red-950/30 border border-red-500/30 rounded-lg px-4 py-2">
                  {error}
                </div>
              )}

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

              {/* Send Reset Link Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full relative py-3 px-6 rounded-lg bg-transparent border border-cyan-400/60 overflow-hidden font-semibold tracking-wide text-sm uppercase text-cyan-300 hover:text-white transition-colors duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/10 to-blue-600/10 opacity-30 group-hover:opacity-100 transition-all duration-300 -z-10" />
                  <span className="relative" style={{ textShadow: '0 0 6px rgba(34,211,238,0.2)' }}>
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </span>
                </button>
              </div>

            </form>
          )}

          {/* Toggle to Login */}
          <div className="mt-8 text-center border-t border-slate-900 pt-6">
            <p className="text-sm text-slate-500">
              Remembered it?{' '}
              <Link
                to="/login"
                className="text-cyan-400/80 hover:text-cyan-400 font-bold hover:underline transition-colors"
              >
                Login
              </Link>
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
