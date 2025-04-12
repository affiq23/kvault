// vault-web/src/components/NoteEditor.tsx

"use client";

import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "../../lib/supabaseClient";

interface Note {
  id: string;
  title: string;
  content: string;
  branch: string;
  created_at: string;
}

const NoteEditor: React.FC = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const fetchNotes = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("notes")
      .select("id, title, content, branch, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching notes:", error.message);
    } else {
      setNotes(data as Note[]);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleSave = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert("Not authenticated");
      return;
    }

    if (selectedNoteId) {
      const { error } = await supabase
        .from("notes")
        .update({ title, content, updated_at: new Date().toISOString() })
        .eq("id", selectedNoteId);

      if (error) {
        console.error("Update failed:", error.message);
        alert("Update failed. Check console.");
      } else {
        alert("✅ Note updated!");
        fetchNotes();
      }
    } else {
      const { error } = await supabase.from("notes").insert([
        {
          title,
          content,
          branch: "main",
          user_id: user.id,
        },
      ]);

      if (error) {
        console.error("Save failed:", error.message);
        alert("Save failed. Check console.");
      } else {
        setPreviewMode(true);
        alert("✅ Note saved to Supabase!");
        fetchNotes();
      }
    }
  };

  const handleDelete = async () => {
    if (!selectedNoteId) return;
    const { error } = await supabase.from("notes").delete().eq("id", selectedNoteId);
    if (error) {
      console.error("Delete failed:", error.message);
      alert("Delete failed.");
    } else {
      setTitle("");
      setContent("");
      setSelectedNoteId(null);
      setPreviewMode(false);
      alert("🗑️ Note deleted.");
      fetchNotes();
    }
  };

  const handleNoteSelect = (note: Note) => {
    setSelectedNoteId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setPreviewMode(false);
  };

  const handleNewNote = () => {
    setSelectedNoteId(null);
    setTitle("");
    setContent("");
    setPreviewMode(false);
  };

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-neutral-900 text-white p-4 border-r border-neutral-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">My Notes</h2>
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
              onClick={() => handleNoteSelect(note)}
              className={`cursor-pointer p-2 rounded hover:bg-neutral-800 ${
                selectedNoteId === note.id ? "bg-neutral-800" : ""
              }`}
            >
              {note.title || "Untitled"}
            </li>
          ))}
        </ul>
      </aside>

      <main className="flex-1 p-8 bg-neutral-950 text-white">
        <div className="flex flex-col gap-4">
          <input
            className="text-2xl font-bold bg-transparent border-b border-neutral-700 focus:outline-none px-2 py-1"
            type="text"
            placeholder="Untitled"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {!previewMode ? (
            <textarea
              className="w-full min-h-[400px] bg-neutral-900 border border-neutral-700 rounded p-4 font-mono text-base focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Write your markdown here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          ) : (
            <div className="prose prose-invert bg-neutral-900 p-4 rounded max-w-none border border-neutral-700">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {selectedNoteId ? "Update" : "Save"}
            </button>
            {selectedNoteId && (
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Delete
              </button>
            )}
            {previewMode && (
              <button
                onClick={() => setPreviewMode(false)}
                className="text-sm text-neutral-400 underline hover:text-white"
              >
                Edit again
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default NoteEditor;
