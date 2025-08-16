"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import Layout from "@/components/Layout";

export default function UploadPage() {
  // State variables
  const [file, setFile] = useState<File | null>(null); // stores the file selected by the user
  const [uploading, setUploading] = useState(false); // indicates if upload is in progress
  const [message, setMessage] = useState<string | null>(null); // displays status messages to user
  const [userEmail, setUserEmail] = useState<string | null>(null); // current user's email
  const [userName, setUserName] = useState<string | null>(null); // current user's display name

  // fetch logged-in user info on component mount
  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser(); // get current user
      if (user) {
        setUserEmail(user.email ?? null);
        setUserName(
          user.user_metadata?.full_name || user.user_metadata?.name || null
        );
      }
    };
    init();
  }, []);

  // handle when a file is selected from the file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]); // store the selected file
    }
  };

  // upload file to backend API
  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file to upload."); // prompt user if no file selected
      return;
    }

    setUploading(true); // indicate uploading
    setMessage(null);

    try {
      const formData = new FormData(); // create form data for POST
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });

      if (!res.ok) throw new Error("Upload failed"); // handle failed requests

      setMessage(`Successfully uploaded ${file.name}`); // success message
      setFile(null); // reset selected file
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Upload failed"); // error handling
    } finally {
      setUploading(false); // reset uploading state
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    location.reload(); // reload page to reset state
  };

  // temporary - will get rid of later
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
      <div className="flex items-center justify-center min-h-[70vh]">
        {/* Upload container */}
        <div
          className="bg-gray-900 p-8 rounded-xl shadow-lg w-full max-w-lg flex flex-col gap-6 items-center
          border-2 border-dashed border-gray-700 hover:border-blue-500 transition"
          onDragOver={(e) => e.preventDefault()} // allow drag over
          onDrop={(e) => { // handle file drop
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              setFile(e.dataTransfer.files[0]);
            }
          }}
        >
          <h2 className="text-xl font-semibold text-gray-200">Upload your file</h2>
          <p className="text-gray-400 text-sm">
            Drag & drop a file here or click Browse
          </p>

          {/* Browse file label */}
          <label
            htmlFor="file-upload"
            className="cursor-pointer px-6 py-3 bg-blue-600 hover:bg-blue-800 text-gray-100 rounded-md transition text-sm font-medium"
          >
            {file ? file.name : "Browse Files"} {/* show filename if selected */}
          </label>

          {/* Hidden file input */}
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange} // use handleFileChange function
            accept=".pdf,.pptx,.txt,.md" // limit accepted file types
          />

          {/* Show remove file button if a file is selected */}
          {file && (
            <button
              onClick={() => setFile(null)}
              className="text-sm text-red-500 hover:underline"
            >
              Remove file
            </button>
          )}

          {/* Upload button */}
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full px-4 py-3 rounded-md bg-green-500 hover:bg-green-700 text-gray-100 transition text-sm font-medium"
          >
            {uploading ? "Uploading..." : "Upload"} {/* show uploading state */}
          </button>

          {/* Message display */}
          {message && <p className="text-gray-300 text-sm mt-2">{message}</p>}
        </div>
      </div>
    </Layout>
  );
}
