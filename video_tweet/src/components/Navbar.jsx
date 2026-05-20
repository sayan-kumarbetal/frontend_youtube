// src/components/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import { persistor } from "../store/store";

function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const handleLogout = async () => {
    dispatch(logout());
    persistor.purge();
    navigate("/");
  };

  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-gray-900 border-b border-gray-700">
      {/* Logo */}
      <Link to="/" className="text-white text-xl font-bold">
        𝖵𝗂𝖽𝖾𝗈-𝖳𝗐𝖾𝖾𝗍
      </Link>

      {/* Right side */}
      <div className="flex items-center gap-4">
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

            {/* ✅ Upload button */}
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
