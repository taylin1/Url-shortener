import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

// ResetPasswordPage is where users land after clicking the link in the
// password reset email. Supabase appends a ?code=... to the URL and
// supabase-js automatically exchanges it for a temporary recovery session
// (detectSessionInUrl is on by default). Once we see that session we let
// the user set a new password via supabase.auth.updateUser({ password }).
export default function ResetPasswordPage() {
  const navigate = useNavigate();

  // undefined = still checking, null = checked and there is no recovery
  // session (invalid or expired link), object = valid recovery session
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(function () {
    // Give supabase-js a moment to process the ?code= from the URL and
    // exchange it for a recovery session, then check whether it worked.
    supabase.auth.getSession().then(function ({ data: { session } }) {
      setHasSession(session);
      setChecking(false);
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setSuccess(true);

    // Sign out so the temporary recovery session can't be reused,
    // then send the user back to login per the chosen flow.
    await supabase.auth.signOut();

    setTimeout(function () {
      navigate('/login?reset=success');
    }, 2000);
  }

  if (checking) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#030712] text-slate-100 font-sans select-none">
        <p className="text-slate-400 text-sm">Verifying reset link...</p>
      </div>
    );
  }

  // No recovery session — the link is invalid, expired, or already used.
  if (!hasSession) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#030712] text-slate-100 font-sans select-none">
        <div className="w-full max-w-[420px] px-6 relative z-10 mx-4">
          <div className="relative backdrop-blur-xl bg-slate-950/45 rounded-2xl border border-red-500/25 p-8 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h1 className="text-xl font-bold uppercase tracking-wider text-slate-100 mb-2">
              Link Invalid
            </h1>
            <p className="text-sm text-slate-400 mb-6">
              This password reset link is invalid, expired, or has already been used.
            </p>
            <Link
              to="/forgot-password"
              className="inline-block text-sm text-cyan-400/80 hover:text-cyan-400 font-bold hover:underline transition-colors"
            >
              Request a new reset link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#030712] text-slate-100 overflow-hidden font-sans select-none">

      {/* Technical Grid Overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="reset-grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(6, 182, 212, 0.12)" strokeWidth="1" />
            <circle cx="50" cy="0" r="1.5" fill="rgba(6, 182, 212, 0.2)" />
          </pattern>
          <radialGradient id="reset-fade-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="reset-grid-mask">
            <rect width="100%" height="100%" fill="url(#reset-fade-grad)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#reset-grid)" mask="url(#reset-grid-mask)" />
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
              Set New Password
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Choose a new password for your account
            </p>
          </div>

          {success ? (
            /* Success state — shown briefly before redirecting to login */
            <div className="text-center space-y-4">
              <div className="text-4xl">✅</div>
              <div className="text-sm text-cyan-400 bg-cyan-950/30 border border-cyan-500/30 rounded-lg px-4 py-3">
                Password updated successfully! Redirecting you to login...
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Error message */}
              {error && (
                <div className="text-sm text-red-400 bg-red-950/30 border border-red-500/30 rounded-lg px-4 py-2">
                  {error}
                </div>
              )}

              {/* New Password Input */}
              <div className="space-y-2 relative">
                <div className="flex justify-between items-center">
                  <label className="text-sm text-cyan-400">
                    New Password
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
                    placeholder="Enter new password"
                    className="w-full bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-600 px-4 py-3 rounded-lg text-sm transition-all outline-none focus:border-cyan-500/50 focus:shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                  />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1.5px] bg-cyan-400/85 transition-all duration-300 group-focus-within:w-[calc(100%-8px)]" />
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-2 relative">
                <label className="text-sm text-cyan-400">
                  Confirm Password
                </label>
                <div className="relative group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-600 px-4 py-3 rounded-lg text-sm transition-all outline-none focus:border-cyan-500/50 focus:shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                  />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1.5px] bg-cyan-400/85 transition-all duration-300 group-focus-within:w-[calc(100%-8px)]" />
                </div>
              </div>

              {/* Update Password Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full relative py-3 px-6 rounded-lg bg-transparent border border-cyan-400/60 overflow-hidden font-semibold tracking-wide text-sm uppercase text-cyan-300 hover:text-white transition-colors duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/10 to-blue-600/10 opacity-30 group-hover:opacity-100 transition-all duration-300 -z-10" />
                  <span className="relative" style={{ textShadow: '0 0 6px rgba(34,211,238,0.2)' }}>
                    {loading ? 'Updating...' : 'Update Password'}
                  </span>
                </button>
              </div>

            </form>
          )}

        </div>

      </div>

    </div>
  );
}
