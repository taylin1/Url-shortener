import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

function DashboardPage() {
  // Holds the current logged in user's session
  const [session, setSession] = useState(null);

  // Holds the list of links fetched from Express
  const [links, setLinks] = useState([]);

  // The URL the user types into the input
  const [url, setUrl] = useState("");

  // The optional name/label for the link
  const [name, setName] = useState('');

  // Error message to show if something goes wrong
  const [error, setError] = useState(null);

  // Success message after a link is created
  const [success, setSuccess] = useState(null);

  // Loading state for the shorten button
  const [loading, setLoading] = useState(false);

  // Loading state for the links list
  const [fetching, setFetching] = useState(true);

  // Expiration fields for shorten form
  const [expiresDays, setExpiresDays] = useState('');
  const [maxClicks, setMaxClicks] = useState('');

  // Edit mode state
  const [isEditing, setIsEditing] = useState(null); // null or link id
  const [editUrl, setEditUrl] = useState('');
  const [editName, setEditName] = useState('');
  const [editExpiresDays, setEditExpiresDays] = useState('');
  const [editMaxClicks, setEditMaxClicks] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const navigate = useNavigate();

  // Fetches all the user's links from Express
  async function fetchLinks(token) {
    setFetching(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/links`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError("Failed to fetch links");
        return;
      }

      setLinks(data);
    } catch {
      setError("Could not connect to server. Make sure the server is running.");
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

    // Keep session in sync when Supabase refreshes the token in the background
    // Without this, the access_token here goes stale and requests start
    // failing with 401 even though the user is still logged in
    const { data: { subscription } } = supabase.auth.onAuthStateChange(function (_event, session) {
      setSession(session);
    });

    return function () {
      subscription.unsubscribe();
    };
  }, []);

  function handleDelete(linkId) {
    setError(null);
    setSuccess(null);

    async function deleteLink() {
      try {
        const token = session.access_token;

        const response = await fetch(`${API_URL}/api/links/${linkId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          setError("Failed to delete link");
          return;
        }

        setSuccess("Link deleted successfully");
        fetchLinks(token);
      } catch {
        setError(
          "Could not connect to server. Make sure the server is running.",
        );
      }
    }

    deleteLink();
  }

  function handleEdit(link) {
    setIsEditing(link.id);
    setEditUrl(link.originalUrl);
    setEditName(link.name || '');
    // Calculate remaining days from expiresAt date
    if (link.expiresAt) {
      const now = new Date();
      const expires = new Date(link.expiresAt);
      const daysLeft = Math.ceil((expires - now) / (24 * 60 * 60 * 1000));
      setEditExpiresDays(Math.max(1, Math.min(5, daysLeft)));
    } else {
      setEditExpiresDays('');
    }
    setEditMaxClicks(link.maxClicks || '');
    setError(null);
    setSuccess(null);
  }

  function handleCancelEdit() {
    setIsEditing(null);
    setEditUrl('');
    setEditName('');
    setEditExpiresDays('');
    setEditMaxClicks('');
    setError(null);
    setSuccess(null);
  }

  function handleSaveEdit(linkId) {
    setError(null);
    setSuccess(null);
    setEditLoading(true);

    async function editLink() {
      try {
        const token = session.access_token;

        const updateData = {};
        if (editUrl) updateData.originalUrl = editUrl;
        if (editName !== '') updateData.name = editName;
        if (editExpiresDays) updateData.expiresDays = parseInt(editExpiresDays, 10);
        if (editMaxClicks) updateData.maxClicks = parseInt(editMaxClicks, 10);

        const response = await fetch(`${API_URL}/api/links/${linkId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(updateData)
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to update link');
          setEditLoading(false);
          return;
        }

        setSuccess('Link updated successfully');
        setIsEditing(null);
        setEditUrl('');
        setEditName('');
        setEditExpiresDays('');
        setEditMaxClicks('');
        fetchLinks(token);
      } catch {
        setError('Could not connect to server. Make sure the server is running.');
        setEditLoading(false);
      }
    }

    editLink();
  }
  // Sends the URL to Express to be shortened
  async function handleShorten() {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const token = session.access_token;

      const body = { url };
      if (name !== '') body.name = name;
      if (expiresDays) body.expiresDays = parseInt(expiresDays, 10);
      if (maxClicks) body.maxClicks = parseInt(maxClicks, 10);

      const response = await fetch(`${API_URL}/api/shorten`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        return;
      }

// Clear the inputs
      setUrl('');
      setName('');
      setExpiresDays('');
      setMaxClicks('')

      // Show a success message with the new short URL
      setSuccess(`Short link created: ${data.shortUrl}`);

      // Refresh the links list so the new link appears immediately
      fetchLinks(token);
    } catch {
      setError("Could not connect to server. Make sure the server is running.");
    } finally {
      setLoading(false);
    }
  }

  // Logs the user out and sends them back to login
  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  return (
    <div className="relative min-h-screen w-full bg-[#030712] text-slate-100 font-sans select-none overflow-hidden">
      <style>{`
        .links-scroll-area::-webkit-scrollbar {
          width: 8px;
        }
        .links-scroll-area::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
          border-radius: 8px;
        }
        .links-scroll-area::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.5);
          border-radius: 8px;
          border: 2px solid rgba(15, 23, 42, 0.6);
          box-shadow: 0 0 8px rgba(6, 182, 212, 0.4),
                      0 0 2px rgba(6, 182, 212, 0.6);
        }
        .links-scroll-area::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.75);
          box-shadow: 0 0 12px rgba(6, 182, 212, 0.6),
                      0 0 4px rgba(6, 182, 212, 0.8);
        }
        .links-scroll-area {
          scrollbar-width: thin;
          scrollbar-color: rgba(6, 182, 212, 0.5) rgba(15, 23, 42, 0.5);
        }
      `}</style>
      {/* Background grid */}
      <svg
        className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="dash-grid"
            width="50"
            height="50"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 50 0 L 0 0 0 50"
              fill="none"
              stroke="rgba(6, 182, 212, 0.12)"
              strokeWidth="1"
            />
            <circle cx="50" cy="0" r="1.5" fill="rgba(6, 182, 212, 0.2)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dash-grid)" />
      </svg>

      {/* Nebula glows */}
      <div className="absolute top-1/3 left-1/3 w-[600px] h-[600px] bg-cyan-950/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-950/25 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-cyan-400 text-sm font-semibold tracking-widest uppercase">
              Url Shortener
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {session?.user?.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full sm:w-auto text-xs text-slate-400 hover:text-cyan-400 border border-slate-800 hover:border-cyan-500/50 px-3 py-1.5 rounded-lg transition-all uppercase tracking-wide"
          >
            Log out
          </button>
        </div>

        {/* Shorten form */}
        <div className="relative backdrop-blur-xl bg-slate-950/45 rounded-2xl border border-cyan-500/15 p-4 sm:p-6 mb-4 sm:mb-6 shadow-[0_0_50px_rgba(6,182,212,0.08),inset_0_0_24px_rgba(6,182,212,0.03)] overflow-hidden">
          {/* Tech Corner Accents - inset on mobile, full-bleed on larger screens */}
          <div className="absolute top-2 left-2 sm:top-0 sm:left-0 w-3 h-3 sm:w-4 sm:h-4 border-t-2 border-l-2 border-cyan-400/80 rounded-tl-2xl" />
          <div className="absolute top-2 right-2 sm:top-0 sm:right-0 w-3 h-3 sm:w-4 sm:h-4 border-t-2 border-r-2 border-cyan-400/30 rounded-tr-2xl" />
          <div className="absolute bottom-2 left-2 sm:bottom-0 sm:left-0 w-3 h-3 sm:w-4 sm:h-4 border-b-2 border-l-2 border-cyan-400/30 rounded-bl-2xl" />
          <div className="absolute bottom-2 right-2 sm:bottom-0 sm:right-0 w-3 h-3 sm:w-4 sm:h-4 border-b-2 border-r-2 border-cyan-400/80 rounded-br-2xl" />

          <h2 className="text-white font-semibold mb-4">Shorten a URL</h2>

          <div className="flex flex-col sm:flex-row gap-3 mb-4">
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
              className="relative bg-transparent border border-cyan-400/60 hover:border-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-cyan-300 hover:text-white font-semibold rounded-lg px-5 py-3 text-sm transition-colors duration-300 whitespace-nowrap"
            >
              {loading ? "Shortening..." : "Shorten"}
            </button>
          </div>

          {/* Link name (optional) */}
          <div className="mb-4">
            <label className="text-xs text-cyan-400/70 uppercase tracking-wide">Link name (optional)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              placeholder="e.g. My Google Link"
              className="w-full bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-lg px-3 py-2 text-sm transition-all outline-none focus:border-cyan-500/50 focus:shadow-[0_0_15px_rgba(6,182,212,0.15)]"
            />
          </div>

          {/* Expiration options - stack on mobile, side by side on larger screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-xs text-cyan-400/70 uppercase tracking-wide">Expires in (days, max 5)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={expiresDays}
                onChange={(e) => setExpiresDays(e.target.value)}
                placeholder="Never"
                className="w-full bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-lg px-3 py-2 text-sm transition-all outline-none focus:border-cyan-500/50 focus:shadow-[0_0_15px_rgba(6,182,212,0.15)]"
              />
            </div>
            <div>
              <label className="text-xs text-cyan-400/70 uppercase tracking-wide">Max clicks (optional)</label>
              <input
                type="number"
                min="1"
                value={maxClicks}
                onChange={(e) => setMaxClicks(e.target.value)}
                placeholder="Unlimited"
                className="w-full bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-lg px-3 py-2 text-sm transition-all outline-none focus:border-cyan-500/50 focus:shadow-[0_0_15px_rgba(6,182,212,0.15)]"
              />
            </div>
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
        <div className="relative backdrop-blur-xl bg-slate-950/45 rounded-2xl border border-cyan-500/15 p-4 sm:p-6 shadow-[0_0_50px_rgba(6,182,212,0.08),inset_0_0_24px_rgba(6,182,212,0.03)] overflow-y-auto max-h-[70vh] links-scroll-area">
          {/* Tech Corner Accents - inset on mobile, full-bleed on larger screens */}
          <div className="absolute top-2 left-2 sm:top-0 sm:left-0 w-3 h-3 sm:w-4 sm:h-4 border-t-2 border-l-2 border-cyan-400/80 rounded-tl-2xl" />
          <div className="absolute top-2 right-2 sm:top-0 sm:right-0 w-3 h-3 sm:w-4 sm:h-4 border-t-2 border-r-2 border-cyan-400/30 rounded-tr-2xl" />
          <div className="absolute bottom-2 left-2 sm:bottom-0 sm:left-0 w-3 h-3 sm:w-4 sm:h-4 border-b-2 border-l-2 border-cyan-400/30 rounded-bl-2xl" />
          <div className="absolute bottom-2 right-2 sm:bottom-0 sm:right-0 w-3 h-3 sm:w-4 sm:h-4 border-b-2 border-r-2 border-cyan-400/80 rounded-br-2xl" />

          <h2 className="text-white font-semibold mb-4">Your Links</h2>

          {/* Still loading links */}
          {fetching && (
            <p className="text-gray-400 text-sm">
              Loading... (server may take up to 60 seconds to wake up on first
              load)
            </p>
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
                const isExpiredByDate = link.expiresAt && new Date(link.expiresAt) < new Date();
                const isExpiredByClicks = link.maxClicks && link.clickCount >= link.maxClicks;
                const isExpired = isExpiredByDate || isExpiredByClicks;
                const editing = isEditing === link.id;

                return (
                  <div
                    key={link.id}
                    className={`bg-slate-950/60 border rounded-xl p-4 ${isExpired ? 'border-red-500/30 opacity-60' : 'border-slate-800'}`}
                  >
                    {/* Expired badge */}
                    {isExpired && (
                      <span className="inline-block bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-medium px-2 py-0.5 rounded-md mb-2">
                        Expired
                      </span>
                    )}

                    {editing ? (
                      /* Edit mode */
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-cyan-400/70 uppercase tracking-wide">Link name (optional)</label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            maxLength={50}
                            placeholder="e.g. My Google Link"
                            className="w-full bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-lg px-3 py-2 text-sm mt-1 transition-all outline-none focus:border-cyan-500/50 focus:shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-cyan-400/70 uppercase tracking-wide">Original URL</label>
                          <input
                            type="text"
                            value={editUrl}
                            onChange={(e) => setEditUrl(e.target.value)}
                            className="w-full bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-lg px-3 py-2 text-sm mt-1 transition-all outline-none focus:border-cyan-500/50 focus:shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-cyan-400/70 uppercase tracking-wide">Expires in (days, max 5)</label>
                          <input
                            type="number"
                            min="1"
                            max="5"
                            value={editExpiresDays}
                            onChange={(e) => setEditExpiresDays(e.target.value)}
                            placeholder="Never"
                            className="w-full bg-slate-950/60 border border-slate-800 text-slate-100 rounded-lg px-3 py-2 text-sm mt-1 transition-all outline-none focus:border-cyan-500/50 focus:shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                          />
                        </div>
                          <div>
                            <label className="text-xs text-cyan-400/70 uppercase tracking-wide">Max clicks</label>
                            <input
                              type="number"
                              min="1"
                              value={editMaxClicks}
                              onChange={(e) => setEditMaxClicks(e.target.value)}
                              placeholder="Unlimited"
                              className="w-full bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-lg px-3 py-2 text-sm mt-1 transition-all outline-none focus:border-cyan-500/50 focus:shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={handleCancelEdit}
                            className="text-xs text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-600 px-3 py-1 rounded-lg transition-all uppercase tracking-wide"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEdit(link.id)}
                            disabled={editLoading || !editUrl}
                            className="text-xs text-cyan-300 hover:text-white border border-cyan-400/60 hover:border-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1 rounded-lg transition-all uppercase tracking-wide"
                          >
                            {editLoading ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* View mode */
                      <>
                        {/* Link name or fallback label */}
                        {link.name ? (
                          <span className="text-cyan-300 text-sm font-medium truncate block">
                            {link.name}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs truncate block">
                            {link.shortUrl}
                          </span>
                        )}

                        {/* Short URL */}
                        <a
                          href={link.shortUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={`text-sm font-medium ${isExpired ? 'text-slate-500 pointer-events-none' : 'text-cyan-400 hover:text-cyan-300'}`}
                        >
                          {link.shortUrl}
                        </a>

                        {/* Expiration info */}
                        {(link.expiresAt || link.maxClicks) && (
                          <div className="flex items-center gap-3 mt-2">
                            {link.expiresAt && (
                              <span className="text-amber-400/80 text-xs">
                                ⏳ Expires: {new Date(link.expiresAt).toLocaleString()}
                              </span>
                            )}
                            {link.maxClicks && (
                              <span className="text-amber-400/80 text-xs">
                                🔢 {link.clickCount}/{link.maxClicks} clicks
                              </span>
                            )}
                          </div>
                        )}

                        {/* Click count, date, and action buttons */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mt-3">
                          <span className="text-emerald-400 text-xs font-medium">
                            {link.clickCount} clicks
                          </span>
                          <span className="text-slate-500 text-xs">
                            {new Date(link.createdAt).toLocaleDateString()}
                          </span>
                          <div className="ml-auto sm:ml-0 flex gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleEdit(link)}
                              className="text-xs text-slate-400 hover:text-cyan-400 border border-slate-800 hover:border-cyan-500/50 px-3 py-1 rounded-lg transition-all uppercase tracking-wide"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(link.id)}
                              className="text-xs text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-500/50 px-3 py-1 rounded-lg transition-all uppercase tracking-wide"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </>
                    )}
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
