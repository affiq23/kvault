"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { saveNote, deleteNote } from "../../lib/noteActions";

interface Note {
  id: string;
  title: string;
  content: string;
  branch: string;
  created_at: string;
}

export default function Page() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const fetchNotes = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }
    const fullName =
      user.user_metadata?.full_name || user.user_metadata?.name || null;
    setUserEmail(user.email ?? null);
    setUserName(fullName);

    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) setNotes(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleSave = async (newTitle: string, newContent: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    try {
      await saveNote(
        user.id,
        newTitle,
        newContent,
        selectedNoteId ?? undefined
      );
      setTitle("");
      setContent("");
      setSelectedNoteId(null);
      fetchNotes();
    } catch (err) {
      console.error(err);
      alert("Error saving note.");
    }
  };

  const handleDelete = async (noteId: string) => {
    try {
      await deleteNote(noteId);
      if (selectedNoteId === noteId) {
        setTitle("");
        setContent("");
        setSelectedNoteId(null);
      }
      fetchNotes();
    } catch (err) {
      console.error(err);
      alert("Error deleting note.");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    alert("Logged out. Run `kvault logout` in CLI too.");
    location.reload();
  };

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          prompt: "select_account",
        },
      },
    });

    if (error) alert("Login failed: " + error.message);
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

  const handleSelectNote = (note: Note) => {
    setSelectedNoteId(note.id);
    setTitle(note.title);
    setContent(note.content);
  };

  const handleNewNote = () => {
    setSelectedNoteId(null);
    setTitle("");
    setContent("");
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
          onClick={handleLogin}
          className="bg-gray-300 text-gray-900 px-8 py-3 rounded-full font-semibold hover:bg-gray-600 transition"
        >
          sign in
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-300 font-mono">
      <header className="flex justify-between items-center bg-gray-850 px-6 py-3 shadow-md border-b border-gray-700">
        <span className="text-sm tracking-wide">{`welcome, ${
          userName?.split(" ")[0] || userEmail
        }`}</span>
        <div className="flex gap-3">
          <a
            href="https://www.npmjs.com/package/@affiq/kvault-cli"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600 transition text-sm text-gray-200"
          >
            command line on npm
          </a>
          <button
            onClick={handleExport}
            className="px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600 transition text-sm text-gray-200"
          >
            export CLI token
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-1 rounded-md bg-red-700 hover:bg-red-800 transition text-sm text-gray-200"
          >
            logout
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <aside
          className={`bg-gray-850 p-4 border-r border-gray-700 overflow-y-auto transition-width duration-300 ease-in-out ${
            sidebarCollapsed ? "w-16" : "w-64"
          } flex flex-col`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              className={`font-semibold tracking-wide text-lg select-none ${
                sidebarCollapsed ? "hidden" : "block"
              }`}
            >
              my notes
            </h2>
            {/* Chevron toggle */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              aria-label={
                sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
              }
              className="p-1 rounded hover:bg-gray-700 transition"
            >
              {sidebarCollapsed ? (
                // Right pointing chevron (expand)
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              ) : (
                // Left pointing chevron (collapse)
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              )}
            </button>
          </div>
          <ul className="space-y-2 flex-1 overflow-y-auto">
            {!sidebarCollapsed &&
              notes.map((note) => (
                <li
                  key={note.id}
                  className={`cursor-pointer rounded-md px-3 py-2 transition select-none ${
                    selectedNoteId === note.id
                      ? "bg-gray-700 text-gray-100 font-semibold"
                      : "hover:bg-gray-700 text-gray-300"
                  }`}
                  onClick={() => handleSelectNote(note)}
                  title={note.title || "Note title..."}
                >
                  {note.title || "Note title..."}
                </li>
              ))}
          </ul>
        </aside>

        {/* Floating +New button */}
        <button
          onClick={handleNewNote}
          aria-label="Create new note"
          className="fixed bottom-6 right-6 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-full w-14 h-14 flex items-center justify-center text-3xl font-bold shadow-lg transition focus:outline-none focus:ring-4 focus:ring-yellow-400"
          title="New Note"
        >
          +
        </button>

        {/* Main editor */}
        <main className="flex-1 p-6 overflow-auto bg-gray-900 rounded-r-lg">
          <div className="flex flex-col gap-4 max-w-4xl mx-auto">
            <input
              className="text-3xl font-bold bg-transparent border-b border-gray-300 focus:outline-none px-2 py-1 tracking-wide placeholder-gray-500 text-gray-100"
              type="text"
              placeholder="Note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className="w-full min-h-[400px] bg-gray-850 border border-gray-300 rounded-lg p-4 font-mono text-base text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
              placeholder="start typing here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="flex gap-4">
              <button
                onClick={() => handleSave(title, content)}
                className="bg-gray-700 hover:bg-gray-600 text-gray-100 px-6 py-2 rounded-full font-semibold transition"
              >
                {selectedNoteId ? "update" : "save"}
              </button>
              {selectedNoteId && (
                <button
                  onClick={() => handleDelete(selectedNoteId)}
                  className="bg-red-700 hover:bg-red-800 text-gray-100 px-6 py-2 rounded-full font-semibold transition"
                >
                  delete
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
