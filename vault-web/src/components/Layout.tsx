import React, { useState } from "react";
import Link from "next/link";

interface LayoutProps {
  children: React.ReactNode;
  userEmail: string | null;
  userName: string | null;
  onLogout: () => void;
  onExport: () => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  userEmail,
  userName,
  onLogout,
  onExport,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-300 font-mono">
      <header className="flex justify-between items-center bg-gray-850 px-6 py-3 shadow-md border-b border-gray-700">
        <span className="text-xl font-bold tracking-wide">{`Welcome, ${
          userName?.split(" ")[0] || userEmail
        }!`}</span>
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
            onClick={onExport}
            className="px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600 transition text-sm text-gray-200"
          >
            export CLI token
          </button>
          <button
            onClick={onLogout}
            className="px-3 py-1 rounded-md bg-red-700 hover:bg-red-800 transition text-sm text-gray-200"
          >
            logout
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <aside
          className={`bg-gray-850 p-4 border-r border-gray-700 overflow-y-auto transition-width duration-300 ease-in-out flex flex-col ${
            sidebarCollapsed ? "w-16" : "w-64"
          }`}
        >
          {/* Header with toggle button */}
          <div
            className={`flex items-center justify-between mb-4 ${
              sidebarCollapsed ? "h-full justify-center" : ""
            }`}
            style={{ height: sidebarCollapsed ? "64px" : "auto" }} // fix height when collapsed
          >
          
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              aria-label={
                sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
              }
              className="p-1 rounded hover:bg-gray-700 transition flex items-center justify-center"
              style={{ width: 32, height: 32 }}
            >
              {sidebarCollapsed ? (
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

          {/* Navigation links */}
          <nav
            className={`space-y-2 flex-1 ${
              sidebarCollapsed ? "pointer-events-none" : "pointer-events-auto"
            }`}
          >
            {!sidebarCollapsed && (
              <>
                <Link
                  href="/"
                  className="block px-3 py-2 rounded-md hover:bg-gray-700 transition"
                >
                  Dashboard
                </Link>
                <Link
                  href="/notes"
                  className="block px-3 py-2 rounded-md hover:bg-gray-700 transition"
                >
                  Notes
                </Link>
                <Link
                  href="/upload"
                  className="block px-3 py-2 rounded-md hover:bg-gray-700 transition"
                >
                  Upload & Summarize
                </Link>
                <Link
                  href="/flashcards"
                  className="block px-3 py-2 rounded-md hover:bg-gray-700 transition"
                >
                  Flashcards
                </Link>
              </>
            )}
          </nav>
        </aside>

        <main className="flex-1 p-6 overflow-auto bg-gray-900 rounded-r-lg">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
