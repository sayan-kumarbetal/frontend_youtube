import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import { persistor } from "../store/store";
import { useState } from "react";

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
    <nav className="flex items-center justify-between px-6 py-3 bg-gray-900 border-b border-gray-700">
      {/* Logo */}
      <Link to="/" className="text-white text-xl font-bold shrink-0">
        𝖵𝗂𝖽𝖾𝗈-𝖳𝗐𝖾𝖾𝗍
      </Link>

      {/* ✅ Search Bar */}
      <form
        onSubmit={handleSearch}
        className="flex items-center w-full max-w-md mx-6"
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
          className="w-full px-4 py-1.5 rounded-l-full bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-indigo-500 text-sm"
        />
        <button
          type="submit"
          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-r-full text-sm border border-indigo-600"
        >
          🔍
        </button>
      </form>

      {/* Right side */}
      <div className="flex items-center gap-4 shrink-0">
        {isAuthenticated ? (
          <>
            <span className="text-gray-300 text-sm">Hi, {user?.username}</span>
            <Link
              to="/dashboard"
              className="text-gray-300 hover:text-white text-sm"
            >
              Dashboard
            </Link>
            <Link
              to="/tweets"
              className="text-gray-300 hover:text-white text-sm"
            >
              Tweets
            </Link>
            <Link
              to="/upload-video"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm"
            >
              Upload
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded text-sm"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-gray-300 hover:text-white text-sm"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm"
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
