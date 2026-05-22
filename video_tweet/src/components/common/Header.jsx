import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { logout } from "../../store/authSlice";
import apiClient from "../../api/axios";

function Header() {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    setIsMobileMenuOpen(false);
    try {
      await apiClient.post("/users/logout");
      dispatch(logout());
      navigate("/login");
    } catch (error) {
      dispatch(logout());
      navigate("/login");
    }
  };

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Tweets", path: "/tweets" },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-lg">
      <nav className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className="text-xl font-black bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              VideoTweet
            </Link>

            <ul className="hidden md:flex items-center space-x-2">
              {isAuthenticated &&
                navItems.map(item => (
                  <li key={item.name}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                          isActive
                            ? "bg-slate-800 text-indigo-400 font-semibold"
                            : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                        }`
                      }
                    >
                      {item.name}
                    </NavLink>
                  </li>
                ))}
            </ul>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/upload-video"
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition shadow-sm shadow-emerald-900/20"
                >
                  Upload
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 rounded-lg hover:bg-slate-700 transition border border-slate-700"
                >
                  Logout
                </button>
                {user && (
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-2.5 bg-slate-800 hover:bg-slate-700/80 p-1.5 pr-3 rounded-lg transition border border-slate-700/50"
                  >
                    <img
                      src={user?.avatar}
                      alt={user?.username}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/20"
                    />
                    <span className="text-slate-200 text-sm font-medium max-w-[100px] truncate">
                      {user?.username}
                    </span>
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 rounded-lg hover:bg-slate-700 transition border border-slate-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition focus:outline-none"
              aria-label="Toggle Menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-slate-800 space-y-3 animate-fadeIn">
            <ul className="space-y-1">
              {isAuthenticated &&
                navItems.map(item => (
                  <li key={item.name}>
                    <NavLink
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `block px-3 py-2 rounded-lg text-base font-medium ${isActive ? "bg-indigo-600/10 text-indigo-400" : "text-slate-400 hover:bg-slate-800"}`
                      }
                    >
                      {item.name}
                    </NavLink>
                  </li>
                ))}
            </ul>
            <div className="pt-3 border-t border-slate-800 flex flex-col space-y-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-slate-300 bg-slate-800 hover:bg-slate-700 block px-3 py-2 rounded-lg text-base font-medium transition"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/upload-video"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-white bg-emerald-600 hover:bg-emerald-700 block px-3 py-2 rounded-lg text-base font-medium text-center transition"
                  >
                    Upload Video
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-center text-rose-400 bg-rose-950/20 hover:bg-rose-900 border border-rose-900/30 block w-full px-3 py-2 rounded-lg text-base font-medium transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-white bg-indigo-600 hover:bg-indigo-700 block px-3 py-2 rounded-lg text-base font-medium text-center transition"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-slate-300 bg-slate-800 hover:bg-slate-700 block px-3 py-2 rounded-lg text-base font-medium text-center transition border border-slate-700"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Header;
