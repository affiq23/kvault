'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setSession(data.session ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setSession(session ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          prompt: 'select_account',
        },
      },
    });
    
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    alert("You've been logged out of the web app. Run `kvault logout` to log out the CLI too.");
    setUser(null);
    setSession(null);
  };
  const handleExportToken = async () => {
    if (!session) {
      console.error('No session available');
      return;
    }

    const token = {
      refresh_token: session.refresh_token,
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
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
        backgroundColor: '#f9f9f9',
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      <div
        style={{
          background: '#fff',
          padding: '2rem',
          borderRadius: '10px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        <h1 style={{ marginBottom: '1.5rem', color: '#333' }}>
          {user ? `welcome, ${user.email}` : 'welcome to kvault'}
        </h1>

        {!user ? (
          <button
            onClick={handleLogin}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              backgroundColor: '#0070f3',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            login with Google
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button
              onClick={handleExportToken}
              style={{
                padding: '0.75rem',
                backgroundColor: '#111',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              export CLI token
            </button>
            <button
              onClick={handleLogout}
              style={{
                padding: '0.75rem',
                backgroundColor: '#e00',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              logout
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
