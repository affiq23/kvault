"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Layout from "../components/Layout";

export default function Page() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email ?? null);
        setUserName(user.user_metadata?.full_name || user.user_metadata?.name || null);
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    alert("Logged out. Run `kvault logout` in CLI too.");
    location.reload();
  };

  const handleExport = async () => {
    const session = (await supabase.auth.getSession()).data.session;
    if (!session) return;

    const token = {
      refresh_token: session.refresh_token,
      user: {
        id: session.user.id,
        email: session.user.email,
      },
    };

    const blob = new Blob([JSON.stringify(token, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "kvault-token.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="text-gray-300 bg-gray-900 p-8 h-screen flex items-center justify-center font-mono">
        Loading...
      </div>
    );
  }

  if (!userEmail) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-gray-300 font-mono">
        <h1 className="text-4xl mb-6 tracking-wide font-semibold">
          welcome to kvault
        </h1>
        <button
          onClick={() => supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: window.location.origin,
              queryParams: {
                prompt: 'select_account',
              },
            },
          })}
          className="bg-gray-300 text-gray-900 px-8 py-3 rounded-full font-semibold hover:bg-gray-600 transition"
        >
          sign in
        </button>
      </div>
    );
  }

  return (
    <Layout userEmail={userEmail} userName={userName} onLogout={handleLogout} onExport={handleExport}>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <h4 className="text-xl mb-6 italic">Welcome to your dashboard. Use the sidebar to navigate to different features.</h4>
    </Layout>
  );
}