import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Navigate } from 'react-router-dom';

// ProtectedRoute wraps any page that requires the user to be logged in
// It receives children — which is the page component we want to protect
// Example usage in App.jsx:
// <ProtectedRoute><DashboardPage /></ProtectedRoute>
function ProtectedRoute({ children }) {

  // session holds the current auth session from Supabase
  // We use undefined as the initial value — not null
  // undefined means "we haven't checked yet"
  // null means "we checked and there is no session"
  // This distinction prevents a flash of the login page before the check completes
  const [session, setSession] = useState(undefined);

  useEffect(function () {

    // Check if there is already an active session when the component first loads
    // This handles the case where a logged in user refreshes the page
    // Without this, refreshing would log everyone out
    supabase.auth.getSession().then(function ({ data: { session } }) {
      // { data: { session } } destructures the Supabase response
      // Supabase returns { data: { session: {...} }, error: null }
      // We dig into data and pull out session directly
      setSession(session);
    })

    // onAuthStateChange listens for any auth changes in real time
    // It fires when a user logs in, logs out, or their token refreshes
    // This keeps the session state always in sync with Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(function (_event, session) {
      // _event tells us what happened (SIGNED_IN, SIGNED_OUT etc)
      // We prefix it with _ to signal we're not using it
      // session is the new session object after the change
      setSession(session);
    })

    // Cleanup function — runs when the component unmounts
    // We unsubscribe from the listener to prevent memory leaks
    // Without this the listener would keep running even after
    // the component is no longer on screen
    return function () {
      subscription.unsubscribe();
    }

  }, [])
  // The empty [] means this useEffect only runs once
  // when the component first mounts — not on every re-render

  // Still waiting for Supabase to respond with the session
  // Return null so nothing renders while we wait
  // This prevents a flicker of the login page before the check completes
  if (session === undefined) return null;

  // Supabase responded and there is no active session
  // User is not logged in — redirect them to login
  if (!session) return <Navigate to="/login" />

  // Session exists — user is authenticated
  // Render the protected page (children)
  // In our case this is DashboardPage
  return children
}

export default ProtectedRoute;