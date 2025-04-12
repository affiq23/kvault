"use client";

import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "../styles/editor.module.css";

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

  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);
  }, [initialTitle, initialContent]);

  const handleSave = () => {
    if (onSave) onSave(title, content);
    setPreviewMode(true);
  };

  return (
    <div className={styles.editorWrapper}>
      <input
        className={styles.titleInput}
        type="text"
        placeholder="untitled"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {!previewMode ? (
        <textarea
          className={styles.textarea}
          placeholder="start typing here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      ) : (
        <div className={styles.preview}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      )}

      <div className={styles.buttonGroup}>
        <button
          className={`${styles.button} ${styles.save}`}
          onClick={handleSave}
        >
          {previewMode ? "saved" : "save"}
        </button>
        {previewMode && (
          <button
            onClick={() => setPreviewMode(false)}
            className={`${styles.button} ${styles.previewToggle}`}
          >
            edit again
          </button>
        )}
      </div>
    </div>
  );
};

export default NoteEditor;
