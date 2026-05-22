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

// ✅ Optimized QueryClient Configuration
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

// ✅ Premium, Consistent Slate Theme Loader
const PageLoader = () => (
  <div className="flex flex-col justify-center items-center min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30">
    <div className="relative flex items-center justify-center mb-4">
      {/* Outer pulsing ring */}
      <div className="absolute w-12 h-12 rounded-full border-2 border-indigo-500/20 scale-125 animate-pulse"></div>
      {/* Spinning loading indicator */}
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
    <p className="text-slate-400 text-sm font-semibold tracking-wider uppercase animate-pulse">
      Syncing Channel Feed...
    </p>
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
      { path: "all-tweets", element: <AllTweetsPage /> },

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
            <RouterProvider router={router} />
          </Suspense>
        </PersistGate>
      </Provider>
    </QueryClientProvider>
  </React.StrictMode>,
);
