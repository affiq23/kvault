"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { saveNote, deleteNote } from "../../../lib/noteActions";
import Layout from "@/components/Layout";
import ReactMarkdown from "react-markdown";


type Note = {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
};

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email ?? null);
        setUserName(
          user.user_metadata?.full_name || user.user_metadata?.name || null
        );
      }
      fetchNotes();
    };
    init();
  }, []);

  const fetchNotes = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) setNotes(data);
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNoteId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setIsEditing(false);
  };

  const handleNewNote = () => {
    setSelectedNoteId(null);
    setTitle("");
    setContent("");
    setIsEditing(true);
  };

  const handleSave = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await saveNote(user.id, title, content, selectedNoteId ?? undefined);
    handleNewNote();
    fetchNotes();
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!selectedNoteId) return;
    await deleteNote(selectedNoteId);
    handleNewNote();
    fetchNotes();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    location.reload();
  };

  const handleExport = async () => {
    const session = (await supabase.auth.getSession()).data.session;
    if (!session) return;

    const token = {
      refresh_token: session.refresh_token,
      user: { id: session.user.id, email: session.user.email },
    };
    const blob = new Blob([JSON.stringify(token, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "kvault-token.json";
    a.click();
  };

  return (
    <Layout
      userEmail={userEmail}
      userName={userName}
      onLogout={handleLogout}
      onExport={handleExport}
    >
      <div className="flex h-full gap-4 relative">
        {/* Main Editor / Viewer */}
        <main className="flex-1 p-6 bg-gray-900 rounded-lg shadow-inner overflow-auto relative">
          <div className="flex flex-col gap-6 max-w-4xl mx-auto">
            {isEditing ? (
              <>
                <input
                  className="w-full text-3xl font-bold bg-transparent border-b border-gray-600 pb-2 focus:outline-none"
                  placeholder="Note title…"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />

                <textarea
                  className="min-h-[500px] w-full bg-gray-850 text-gray-200 p-4 rounded-lg border border-gray-700
             focus:outline-none focus:ring-2 focus:ring-yellow-500 leading-relaxed resize-y"
                  placeholder="Start writing…"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />

                <div className="flex gap-4 pt-2">
                  <button
                    onClick={() => {
                      handleSave();
                      setIsEditing(false);
                    }}
                    className="px-3 py-1 rounded-md bg-green-500 hover:bg-green-800 transition text-sm text-gray-200"
                  >
                    {selectedNoteId ? "Update" : "Save"}
                  </button>
                  <button
                    onClick={() => {
                      if (selectedNoteId) {
                        const note = notes.find((n) => n.id === selectedNoteId);
                        if (note) {
                          setTitle(note.title);
                          setContent(note.content);
                        }
                      } else {
                        setTitle("");
                        setContent("");
                        setSelectedNoteId(null);
                      }
                      setIsEditing(false);
                    }}
                   className="px-3 py-1 rounded-md bg-gray-500 hover:bg-gray-800 transition text-sm text-gray-200"
                  >
                    Cancel
                  </button>
                  {selectedNoteId && (
                    <button
                      onClick={handleDelete}
                      className="px-3 py-1 rounded-md bg-red-700 hover:bg-red-900 transition text-sm text-gray-200"
                  >
                      Delete
                    </button>
                  )}
                </div>
              </>
            ) : selectedNoteId ? (
              <>
                <h1 className="text-4xl font-bold">{title || "Untitled"}</h1>
                <article className="prose max-w-none mt-4 text-gray-300 leading-relaxed">
                  <ReactMarkdown>{content || "No content"}</ReactMarkdown>
                </article>
                <div className="pt-4 flex gap-4">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1 rounded-md bg-blue-500 hover:bg-blue-800 transition text-sm text-gray-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-3 py-1 rounded-md bg-red-700 hover:bg-red-900 transition text-sm text-gray-200"
          >
                    Delete
                  </button>
                </div>
              </>
            ) : (
              <h4 className="text-xl text-gray-400 italic">
                Select a note to view or create a new one.
              </h4>
            )}
          </div>
        </main>

        {/* Notes List (RIGHT sidebar) */}
        <aside className="w-64 bg-gray-850 p-4 border-l border-gray-700 rounded-l-lg overflow-y-auto">
  <div className="flex items-center justify-between mb-4">
    <h2 className="font-bold text-lg">My Notes</h2>
    <button
      onClick={() => {
        handleNewNote();
        setIsEditing(true);
      }}
      className="px-3 py-1 rounded-md bg-yellow-500 hover:bg-yellow-600 transition text-sm text-gray-900"
      title="Create new note"
      aria-label="Create new note"
    >
      New
    </button>
  </div>
  <ul className="space-y-2">
    {notes.map((note) => (
      <li
        key={note.id}
        onClick={() => {
          handleSelectNote(note);
          setIsEditing(false);
        }}
        className={`px-3 py-2 rounded cursor-pointer truncate
                  ${
                    selectedNoteId === note.id
                      ? "bg-gray-700 text-gray-100"
                      : "hover:bg-gray-700 text-gray-300"
                  }`}
      >
        {note.title || "Untitled"}
      </li>
    ))}
  </ul>
</aside>

      </div>
    </Layout>
  );
}
