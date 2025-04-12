// vault-web/src/components/NoteEditor.tsx

"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "../../lib/supabaseClient";


interface NoteEditorProps {
  initialTitle?: string;
  initialContent?: string;
  onSave?: (title: string, content: string) => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({
  initialTitle = "",
  initialContent = "",
  onSave,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [previewMode, setPreviewMode] = useState(false);

 
const handleSave = async () => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    alert("❌ Not authenticated");
    return;
  }

  const { error } = await supabase.from("notes").insert([
    {
      title,
      content,
      branch: "main",
      user_id: user.id,
    },
  ]);

  if (error) {
    console.error("❌ Save failed:", error.message);
    alert("Save failed. Check console.");
  } else {
    setPreviewMode(true);
    alert("✅ Note saved to Supabase!");
  }
};

  return (
    <div className="flex flex-col gap-4">
      <input
        className="text-2xl font-bold bg-transparent border-b border-neutral-700 focus:outline-none px-2 py-1 text-white"
        type="text"
        placeholder="Untitled"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {!previewMode ? (
        <textarea
          className="w-full min-h-[400px] bg-neutral-900 text-white border border-neutral-700 rounded p-4 font-mono text-base focus:outline-none focus:ring-2 focus:ring-blue-600"
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
          {previewMode ? "Saved" : "Save"}
        </button>
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
  );
};

export default NoteEditor;
