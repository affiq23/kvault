"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import Layout from "@/components/Layout";

export default function UploadPage() {
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
      } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email ?? null); // if user exists, extract email and name to display
        setUserName(
          user.user_metadata?.full_name || user.user_metadata?.name || null
        );
      }
    };
    init();
  }, []); // empty array means this only runs once when mounted

  // handle when a file is selected from the file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // check if files were selected and at least one exists
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]); // store first selected file
    }
  };

  // upload file to backend API (not directly to Supabase)
  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file to upload.");
      return;
    }

    setUploading(true); // indicate uploading
    setMessage(null);

    try {
      // grab auth session to send with API request
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        setMessage("Authentication required. Please log in again.");
        return;
      }

      // create FormData object to send file in form data format
      const formData = new FormData(); // 
      formData.append("file", file);

      // HTTP POST request to endpoint
      const res = await fetch("/api/upload", { 
        method: "POST", 
        headers: {
          'Authorization': `Bearer ${session.access_token}`, // API can verify user
        },
        body: formData 
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Upload failed");
      }

      // parse response for later
      const result = await res.json();
      
      setMessage(`Successfully uploaded ${file.name}`);
      setFile(null);
      
      // reset HTML file input element
      const fileInput = document.getElementById("file-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      
      // error handling
    } catch (err: unknown) {
      console.error("Upload error:", err);
      setMessage(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    location.reload();
  };

  // will replace later
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
        <div
          className="bg-gray-900 p-8 rounded-xl shadow-lg w-full max-w-lg flex flex-col gap-6 items-center
          border-2 border-dashed border-gray-700 hover:border-blue-500 transition"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
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

          <label
            htmlFor="file-upload"
            className="cursor-pointer px-6 py-3 bg-blue-600 hover:bg-blue-800 text-gray-100 rounded-md transition text-sm font-medium"
          >
            {file ? file.name : "Browse Files"}
          </label>

          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.pptx,.txt,.md"
          />

          {file && (
            <button
              onClick={() => setFile(null)}
              className="text-sm text-red-500 hover:underline"
            >
              Remove file
            </button>
          )}

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="px-7 py-3 rounded-md bg-green-500 hover:bg-green-700 text-gray-100 transition text-sm font-medium disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload File"}
          </button>

          {message && (
            <p className={`text-sm mt-2 ${message.includes('Successfully') ? 'text-green-400' : 'text-red-400'}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
}