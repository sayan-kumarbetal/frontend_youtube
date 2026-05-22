import React from "react";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 bg-slate-950 text-slate-100">
      <h1 className="text-8xl md:text-9xl font-black bg-gradient-to-b from-indigo-500 to-purple-700 bg-clip-text text-transparent leading-none">
        404
      </h1>
      <h2 className="text-2xl md:text-3xl font-black text-white mt-4 tracking-tight">
        Endpoint Not Configured
      </h2>
      <p className="text-slate-400 text-xs md:text-sm mt-2 max-w-xs leading-relaxed">
        The system routing map parameters could not resolve this specific URL
        directory branch node.
      </p>
      <div className="mt-8">
        <Link
          to="/"
          className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition shadow-md"
        >
          Return to Dashboard Core
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
