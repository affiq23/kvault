'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null); // new state to hold session

  useEffect(() => {
    // Load session on initial mount
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setSession(data.session ?? null); // store session
    });

    // Listen for auth changes (login event)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setSession(session ?? null); // store session on login
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const handleExportToken = async () => {
    if (!session) {
      console.error('No session available');
      return;
    }

    const token = {
      refresh_token: session.refresh_token, // now we have it!
      user: {
        id: session.user.id,
        email: session.user.email,
      },
    };

    const blob = new Blob([JSON.stringify(token, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kvault-token.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main style={{ padding: '2rem' }}>
      {!user ? (
        <>
          <h1>Welcome to kvault</h1>
          <button onClick={handleLogin}>Login with Google</button>
        </>
      ) : (
        <>
          <h1>Logged in as: {user.email}</h1>
          <button onClick={handleExportToken}>Export CLI Token</button>
          <button onClick={handleLogout}>Logout</button>
        </>
      )}
    </main>
  );
}
