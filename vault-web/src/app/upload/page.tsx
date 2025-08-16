"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import Layout from "@/components/Layout";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null); // all files stored in database for user
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null); // extracted text
  const [userEmail, setUserEmail] = useState<string | null>(null); // pulled from Supabase auth
  const [userName, setUserName] = useState<string | null>(null);

  // fetch logged-in user info
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
    };
    init();
  }, []);

  // captures file user wants to upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  // Python API will handle file processing
  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file to upload.");
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

        setMessage(`Successfully uploaded ${file.name}`);
      setFile(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage(err.message);
      } else {
        setMessage("Upload failed");
      }
    } finally {
      setUploading(false);
    }
  };


  const handleLogout = async () => {
    await supabase.auth.signOut();
    location.reload();
  };

  // will get rid of this later and add a separate page instead of having it on layout component
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
          <h2 className="text-xl font-semibold text-gray-200">
            Upload your file
          </h2>
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
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0)
                setFile(e.target.files[0]);
            }}
            accept=".pdf,.pptx,.txt,.md"
          />

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full px-4 py-3 rounded-md bg-green-500 hover:bg-green-700 text-gray-100 transition text-sm font-medium"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>

          {message && <p className="text-gray-300 text-sm mt-2">{message}</p>}
        </div>
      </div>
    </Layout>
  );
}
