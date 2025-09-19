import React from "react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
        <div className="mb-4 md:mb-0">
          © {new Date().getFullYear()} ZeroClick. All rights reserved.
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-400">Security-first, demo-only simulations.</span>
          <a
            href="mailto:hello@ZeroClick.tech"
            className="text-indigo-600 font-medium hover:text-indigo-500"
          >
            hello@ZeroClick.tech
          </a>
        </div>
      </div>
    </footer>
  );
}
