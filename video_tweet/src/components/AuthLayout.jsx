import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

function AuthLayout({ authentication = true }) {
  const { isAuthenticated } = useSelector(state => state.auth);
  const rehydrated = useSelector(state => state.auth?._persist?.rehydrated);

  // ✅ Consistent dark-theme loader matching main.jsx
  if (!rehydrated) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-slate-950">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 text-sm font-semibold tracking-wider uppercase animate-pulse">
          Authenticating Session...
        </p>
      </div>
    );
  }

  if (authentication && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default AuthLayout;
