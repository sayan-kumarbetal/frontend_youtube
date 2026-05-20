// import React, { useEffect, useState } from "react";
// import { useDispatch } from "react-redux";
// import { Outlet } from "react-router-dom";
// import { login, logout } from "./store/authSlice";
// import apiClient from "./api/axios";

// function RootLayout() {
//   const dispatch = useDispatch();
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const controller = new AbortController();
//     let canceled = false; // ← track this

//     apiClient
//       .get("/users/currentUser", { signal: controller.signal })
//       .then(response => {
//         if (response.data?.success) {
//           dispatch(login(response.data.data));
//         } else {
//           dispatch(logout());
//         }
//       })
//       .catch(error => {
//         if (error.name === "CanceledError") return;

//         if (error.response?.status === 401) {
//           console.log("RootLayout: No current user, continuing as guest.");
//         } else {
//           console.error("RootLayout: Auth check failed.", error);
//         }

//         dispatch(logout());
//       })
//       .finally(() => {
//         if (!canceled) {
//           setLoading(false);
//         }
//       });

//     return () => {
//       canceled = true; // ← mark as canceled before abort
//       controller.abort();
//     };
//   }, [dispatch]);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen bg-gray-900">
//         <p className="text-white text-xl">Loading application...</p>
//       </div>
//     );
//   }

//   return <Outlet />;
// }

// export default RootLayout;

import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar.jsx"; // ← import your Navbar

function RootLayout() {
  return (
    <>
      <Navbar /> {/* ← shows on every page */}
      <Outlet />
    </>
  );
}

export default RootLayout;
