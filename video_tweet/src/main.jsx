import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Provider } from "react-redux";
import store, { persistor } from "./store/store.js";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistGate } from "redux-persist/integration/react";

// ✅ Lazy load all pages
const Home = lazy(() => import("./pages/Home.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const Signup = lazy(() => import("./pages/Signup.jsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const VideoDetail = lazy(() => import("./pages/VideoDetail.jsx"));
const UploadVideo = lazy(() => import("./pages/UploadVideo.jsx"));
const EditVideo = lazy(() => import("./pages/EditVideo.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));
const PlaylistDetail = lazy(() => import("./pages/PlaylistDetail.jsx"));
const TweetsPage = lazy(() => import("./pages/TweetsPage.jsx"));
const ChannelPage = lazy(() => import("./pages/ChannelPage.jsx"));
const AllTweetsPage = lazy(() => import("./pages/AllTweetsPage.jsx"));
const SearchPage = lazy(() => import("./pages/SearchPage.jsx"));

// Small layout components — no need to lazy load
import AuthLayout from "./components/AuthLayout.jsx";
import RootLayout from "./RootLayout.jsx";

// ✅ Optimized QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// ✅ Loading screen
const PageLoader = () => (
  <div className="flex justify-center items-center min-h-screen bg-gray-900">
    <p className="text-white text-xl">Loading...</p>
  </div>
);

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "signup", element: <Signup /> },
      { path: "video/:videoId", element: <VideoDetail /> },
      { path: "playlist/:playlistId", element: <PlaylistDetail /> },
      { path: "channel/:username", element: <ChannelPage /> },
      { path: "all-tweets", element: <AllTweetsPage /> }, // ✅ public route

      // ✅ Protected routes
      {
        element: <AuthLayout authentication={true} />,
        children: [
          { path: "dashboard", element: <Dashboard /> },
          { path: "upload-video", element: <UploadVideo /> },
          { path: "edit-video/:videoId", element: <EditVideo /> },
          { path: "tweets", element: <TweetsPage /> },
          { path: "search", element: <SearchPage /> },
        ],
      },

      { path: "*", element: <NotFound /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <PersistGate loading={<PageLoader />} persistor={persistor}>
          <Suspense fallback={<PageLoader />}>
            {" "}
            {/* ✅ Suspense for lazy loading */}
            <RouterProvider router={router} />
          </Suspense>
        </PersistGate>
      </Provider>
    </QueryClientProvider>
  </React.StrictMode>,
);

// import React from "react";
// import ReactDOM from "react-dom/client";
// import "./index.css";
// import { Provider } from "react-redux";
// import store, { persistor } from "./store/store.js"; // ← import persistor
// import { RouterProvider, createBrowserRouter } from "react-router-dom";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { PersistGate } from "redux-persist/integration/react"; // ← import PersistGate

// import Home from "./pages/Home.jsx";
// import Login from "./pages/Login.jsx";
// import Signup from "./pages/Signup.jsx";
// import Dashboard from "./pages/Dashboard.jsx";
// import VideoDetail from "./pages/VideoDetail.jsx";
// import UploadVideo from "./pages/UploadVideo.jsx";
// import EditVideo from "./pages/EditVideo.jsx";
// import NotFound from "./pages/NotFound.jsx";
// import PlaylistDetail from "./pages/PlaylistDetail.jsx";
// import TweetsPage from "./pages/TweetsPage.jsx";
// import ChannelPage from "./pages/ChannelPage.jsx";
// import AuthLayout from "./components/AuthLayout.jsx";
// import RootLayout from "./RootLayout.jsx";
// import AllTweetsPage from "./pages/AllTweetsPage.jsx";
// import SearchPage from "./pages/SearchPage.jsx";

// const queryClient = new QueryClient();

// const router = createBrowserRouter([
//   {
//     element: <RootLayout />,
//     children: [
//       { index: true, element: <Home /> }, // ← "path: ''" replaced with index: true
//       { path: "login", element: <Login /> },
//       { path: "signup", element: <Signup /> },
//       { path: "video/:videoId", element: <VideoDetail /> },
//       { path: "playlist/:playlistId", element: <PlaylistDetail /> },
//       { path: "channel/:username", element: <ChannelPage /> },

//       // ← AuthLayout moved BEFORE the wildcard
//       {
//         element: <AuthLayout authentication={true} />,
//         children: [
//           { path: "dashboard", element: <Dashboard /> },
//           { path: "upload-video", element: <UploadVideo /> },
//           { path: "edit-video/:videoId", element: <EditVideo /> },
//           { path: "tweets", element: <TweetsPage /> },
//           { path: "all-tweets", element: <AllTweetsPage /> },
//           { path: "search", element: <SearchPage /> },
//         ],
//       },

//       { path: "*", element: <NotFound /> }, // ← only one wildcard, at the end
//     ],
//   },
// ]);

// ReactDOM.createRoot(document.getElementById("root")).render(
//   <React.StrictMode>
//     <QueryClientProvider client={queryClient}>
//       <Provider store={store}>
//         <PersistGate loading={null} persistor={persistor}>
//           {" "}
//           {/* ← added PersistGate */}
//           <RouterProvider router={router} />
//         </PersistGate>
//       </Provider>
//     </QueryClientProvider>
//   </React.StrictMode>,
// );
