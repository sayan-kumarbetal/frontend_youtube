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
    setIsMobileMenuOpen(false); // Close mobile menu if logging out from there
    try {
      // Await backend session destruction first
      await apiClient.post("/users/logout");
      dispatch(logout());
      navigate("/login");
    } catch (error) {
      console.error(
        "Logout API call failed, but logging out on frontend anyway.",
        error,
      );
      dispatch(logout());
      navigate("/login");
    }
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const navItems = [
    { name: "Home", path: "/", active: true },
    { name: "Tweets", path: "/tweets", active: true },
  ];

  return (
    <header className="bg-gray-800 shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          {/* Left side: Logo and Desktop Nav */}
          <div className="flex items-center space-x-8">
            <Link
              to="/"
              className="text-xl font-bold text-white"
              onClick={closeMobileMenu}
            >
              VideoTweet
            </Link>

            <ul className="hidden md:flex items-center space-x-4">
              {isAuthenticated &&
                navItems.map(item => (
                  <li key={item.name}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `px-3 py-2 rounded-md text-sm font-medium ${isActive ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700"}`
                      }
                    >
                      {item.name}
                    </NavLink>
                  </li>
                ))}
            </ul>
          </div>

          {/* Right side: Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/upload-video"
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  Upload
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700"
                >
                  Logout
                </button>
                {user && (
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-3 hover:bg-gray-700 p-2 rounded-md transition"
                  >
                    <img
                      src={user?.avatar}
                      alt={user?.username}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-600"
                    />
                    <span className="text-white font-semibold hidden sm:block">
                      {user?.username}
                    </span>
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-300 hover:text-white focus:outline-none"
              aria-label="Toggle Menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                ></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4">
            <ul className="flex flex-col space-y-2">
              {isAuthenticated &&
                navItems.map(item => (
                  <li key={item.name}>
                    <NavLink
                      to={item.path}
                      onClick={closeMobileMenu}
                      className={({ isActive }) =>
                        `block px-3 py-2 rounded-md text-base font-medium ${isActive ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700"}`
                      }
                    >
                      {item.name}
                    </NavLink>
                  </li>
                ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-gray-700 flex flex-col space-y-3">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={closeMobileMenu}
                    className="text-gray-300 hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/upload-video"
                    onClick={closeMobileMenu}
                    className="text-gray-300 hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium"
                  >
                    Upload Video
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-left text-red-400 hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="text-gray-300 hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={closeMobileMenu}
                    className="text-gray-300 hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium"
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
