import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import { persistor } from "../store/store";

function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = async () => {
    dispatch(logout());
    persistor.purge();
    navigate("/");
  };

  const handleSearch = e => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery("");
  };

  return (
    <nav className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
      <div className="flex items-center justify-between w-full sm:w-auto shrink-0">
        <Link
          to="/"
          className="text-white text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"
        >
          Video-Tweet
        </Link>
      </div>

      <form
        onSubmit={handleSearch}
        className="flex items-center w-full max-w-md"
      >
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={
            isAuthenticated
              ? "Search videos and tweets..."
              : "Login to search..."
          }
          className="w-full px-4 py-2 rounded-l-xl bg-slate-800 text-slate-100 border border-slate-700 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-r-xl text-sm font-medium border border-indigo-600 transition shrink-0"
        >
          🔍
        </button>
      </form>

      <div className="flex items-center gap-3 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none justify-start sm:justify-end shrink-0">
        {isAuthenticated ? (
          <>
            <span className="text-slate-400 text-xs whitespace-nowrap bg-slate-800 px-2.5 py-1 rounded-md">
              Hi, {user?.username}
            </span>
            <Link
              to="/dashboard"
              className="text-slate-300 hover:text-white text-xs font-medium whitespace-nowrap px-2 py-1"
            >
              Dashboard
            </Link>
            <Link
              to="/tweets"
              className="text-slate-300 hover:text-white text-xs font-medium whitespace-nowrap px-2 py-1"
            >
              Tweets
            </Link>
            <Link
              to="/upload-video"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition"
            >
              Upload
            </Link>
            <button
              onClick={handleLogout}
              className="bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition border border-rose-500/30 hover:border-transparent"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-slate-300 hover:text-white text-xs font-medium px-3 py-1.5"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
