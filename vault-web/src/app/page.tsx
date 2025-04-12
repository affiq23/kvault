"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { saveNote, deleteNote } from "../../lib/noteActions";
import NoteEditor from "../components/NoteEditor";

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

  const fetchNotes = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    setUserEmail(user.email ?? null);

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
      await saveNote(user.id, newTitle, newContent, selectedNoteId ?? undefined); 
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
        queryParams: {
          prompt: "select_account", // forces account picker every time
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
    return <div className="text-white p-8">Loading...</div>;
  }

  if (!userEmail) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black text-white">
        <h1 className="text-3xl mb-4">welcome to kvault</h1>
        <button
          onClick={handleLogin}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          sign in
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-neutral-900 text-white px-6 py-3 border-b border-neutral-800 flex justify-between items-center">
        <span className="text-sm">{`welcome, ${userEmail}`}</span>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="bg-black text-white px-3 py-1 text-sm rounded hover:bg-neutral-800"
          >
            export CLI token
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-3 py-1 text-sm rounded hover:bg-red-700"
          >
            logout
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="w-64 bg-neutral-900 text-white p-4 border-r border-neutral-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">my notes</h2>
            <button
              onClick={handleNewNote}
              className="text-sm text-blue-400 underline hover:text-blue-600"
            >
              + New
            </button>
          </div>
          <ul className="space-y-2">
            {notes.map((note) => (
              <li
                key={note.id}
                className={`p-2 rounded cursor-pointer hover:bg-neutral-800 ${
                  selectedNoteId === note.id ? "bg-neutral-800" : ""
                }`}
                onClick={() => handleSelectNote(note)}
              >
                {note.title || "untitled"}
              </li>
            ))}
          </ul>
        </aside>

        <main className="flex-1 p-6 bg-neutral-950 text-white">
          <div className="flex flex-col gap-4">
            <input
              className="text-2xl font-bold bg-transparent border-b border-neutral-700 focus:outline-none px-2 py-1"
              type="text"
              placeholder="untitled"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className="w-full min-h-[400px] bg-neutral-900 border border-neutral-700 rounded p-4 font-mono text-base focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="start typing here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleSave(title, content)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {selectedNoteId ? "update" : "save"}
              </button>
              {selectedNoteId && (
                <button
                  onClick={() => handleDelete(selectedNoteId)}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
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
