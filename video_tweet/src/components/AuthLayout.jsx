import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

function AuthLayout({ authentication = true }) {
  const { isAuthenticated } = useSelector(state => state.auth);
  const rehydrated = useSelector(state => state.auth?._persist?.rehydrated); // ← add this

  // ✅ Wait for localStorage to finish loading into Redux
  if (!rehydrated) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  if (authentication && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default AuthLayout;
