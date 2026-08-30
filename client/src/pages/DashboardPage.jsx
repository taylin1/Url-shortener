import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="relative min-h-screen w-full bg-[#030712] text-slate-100 font-sans select-none overflow-hidden">

      {/* Background grid */}
      <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dash-grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(6, 182, 212, 0.12)" strokeWidth="1" />
            <circle cx="50" cy="0" r="1.5" fill="rgba(6, 182, 212, 0.2)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dash-grid)" />
      </svg>

      {/* Nebula glows */}
      <div className="absolute top-1/3 left-1/3 w-[600px] h-[600px] bg-cyan-950/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-950/25 rounded-full blur-[120px] pointer-events-none" />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-cyan-500/10">
        <h1 className="text-cyan-400 text-sm font-semibold tracking-widest uppercase">Url Shortener</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="text-xs text-slate-400 hover:text-cyan-400 border border-slate-800 hover:border-cyan-500/50 px-3 py-1.5 rounded-lg transition-all uppercase tracking-wide"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="w-full max-w-[500px] px-6">
          <div className="relative backdrop-blur-xl bg-slate-950/45 rounded-2xl border border-cyan-500/15 p-8 shadow-[0_0_50px_rgba(6,182,212,0.08)]">
            <div className="text-center">
              <h2 className="text-xl font-bold uppercase tracking-wider text-slate-100">Dashboard</h2>
              <p className="mt-2 text-sm text-slate-400">
                Welcome back! Your URL shortener dashboard is ready.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
