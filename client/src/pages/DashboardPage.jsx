import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function DashboardPage() {
  // Holds the current logged in user's session
  const [session, setSession] = useState(null);

  // Holds the list of links fetched from Express
  const [links, setLinks] = useState([]);

  // The URL the user types into the input
  const [url, setUrl] = useState('');

  // Error message to show if something goes wrong
  const [error, setError] = useState(null);

  // Success message after a link is created
  const [success, setSuccess] = useState(null);

  // Loading state for the shorten button
  const [loading, setLoading] = useState(false);

  // Loading state for the links list
  const [fetching, setFetching] = useState(true);

  const navigate = useNavigate();

  // Fetches all the user's links from Express
  async function fetchLinks(token) {
    setFetching(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/links`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        setError('Failed to fetch links');
        return;
      }

      setLinks(data);
    } catch {
      setError('Could not connect to server. Make sure the server is running.');
    } finally {
      setFetching(false);
    }
  }

  // Get the session when the dashboard first loads and fetch links
  useEffect(function () {
    supabase.auth.getSession().then(function ({ data: { session } }) {
      setSession(session);
      if (session) {
        fetchLinks(session.access_token);
      }
    });
  }, []);


  function handleDelete(linkId) {
    setError(null);
    setSuccess(null);

    async function deleteLink() {
      try {
        const token = session.access_token;

        const response = await fetch(`${API_URL}/api/links/${linkId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          setError('Failed to delete link');
          return;
        }

        setSuccess('Link deleted successfully');
        fetchLinks(token);
      } catch {
        setError('Could not connect to server. Make sure the server is running.');
      }
    }

    deleteLink();
  }
  // Sends the URL to Express to be shortened
  async function handleShorten() {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const token = session.access_token;

      const response = await fetch(`${API_URL}/api/shorten`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ url })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        return;
      }

      // Clear the input
      setUrl('');

      // Show a success message with the new short URL
      setSuccess(`Short link created: ${data.shortUrl}`);

      // Refresh the links list so the new link appears immediately
      fetchLinks(token);
    } catch {
      setError('Could not connect to server. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  }

  // Logs the user out and sends them back to login
  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/login');
  }

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

      <div className="relative z-10 w-full max-w-2xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-cyan-400 text-sm font-semibold tracking-widest uppercase">Url Shortener</h1>
            <p className="text-slate-400 text-sm mt-1">
              {session?.user?.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-slate-400 hover:text-cyan-400 border border-slate-800 hover:border-cyan-500/50 px-3 py-1.5 rounded-lg transition-all uppercase tracking-wide"
          >
            Log out
          </button>
        </div>

        {/* Shorten form */}
        <div className="relative backdrop-blur-xl bg-slate-950/45 rounded-2xl border border-cyan-500/15 p-6 mb-6 shadow-[0_0_50px_rgba(6,182,212,0.08),inset_0_0_24px_rgba(6,182,212,0.03)] overflow-hidden">
          {/* Tech Corner Accents */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400/80 rounded-tl-2xl" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400/30 rounded-tr-2xl" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400/30 rounded-bl-2xl" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400/80 rounded-br-2xl" />

          <h2 className="text-white font-semibold mb-4">Shorten a URL</h2>

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="https://example.com/very-long-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-lg px-4 py-3 text-sm transition-all outline-none focus:border-cyan-500/50 focus:shadow-[0_0_15px_rgba(6,182,212,0.15)]"
            />
            <button
              onClick={handleShorten}
              disabled={loading || !url}
              className="relative bg-transparent border border-cyan-400/60 hover:border-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-cyan-300 hover:text-white font-semibold rounded-lg px-5 py-3 text-sm transition-colors duration-300"
            >
              {loading ? 'Shortening...' : 'Shorten'}
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mt-4">
              {error}
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm rounded-lg px-4 py-3 mt-4">
              {success}
            </div>
          )}
        </div>

        {/* Links list */}
        <div className="relative backdrop-blur-xl bg-slate-950/45 rounded-2xl border border-cyan-500/15 p-6 shadow-[0_0_50px_rgba(6,182,212,0.08),inset_0_0_24px_rgba(6,182,212,0.03)] overflow-hidden">
          {/* Tech Corner Accents */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400/80 rounded-tl-2xl" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400/30 rounded-tr-2xl" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400/30 rounded-bl-2xl" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400/80 rounded-br-2xl" />

          <h2 className="text-white font-semibold mb-4">Your Links</h2>

          {/* Still loading links */}
          {fetching && (
            <p className="text-slate-400 text-sm">Loading your links...</p>
          )}

          {/* No links yet */}
          {!fetching && links.length === 0 && (
            <p className="text-slate-400 text-sm">
              No links yet. Shorten your first URL above.
            </p>
          )}

          {/* Links */}
          {!fetching && links.length > 0 && (
            <div className="flex flex-col gap-4">
              {links.map(function (link) {
                return (
                  <div
                    key={link.id}
                    className="bg-slate-950/60 border border-slate-800 rounded-xl p-4"
                  >
                    {/* Original URL */}
                    <p className="text-slate-500 text-xs truncate mb-1">
                      {link.originalUrl}
                    </p>

                    {/* Short URL */}
                    <a
                      href={link.shortUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 text-sm font-medium"
                    >
                      {link.shortUrl}
                    </a>

                    {/* Click count and date */}
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-emerald-400 text-xs font-medium">
                        {link.clickCount} clicks
                      </span>
                      <span className="text-slate-500 text-xs">
                        {new Date(link.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleDelete(link.id)}
                        className="ml-auto text-xs text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-500/50 px-3 py-1 rounded-lg transition-all uppercase tracking-wide"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default DashboardPage;
