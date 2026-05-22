import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import apiClient from "../api/axios";

// --- API Functions ---
const fetchChannelStats = async () => {
  const { data } = await apiClient.get("/dashboard/stats");
  return data.data;
};

const fetchChannelVideos = async () => {
  const { data } = await apiClient.get("/dashboard/videos");
  return data.data.videos;
};

const togglePublishStatus = async videoId => {
  const { data } = await apiClient.patch(`/videos/toggle/publish/${videoId}`);
  return data.data;
};

const deleteVideo = async videoId => {
  const { data } = await apiClient.delete(`/videos/${videoId}`);
  return data;
};

const fetchUserPlaylists = async userId => {
  if (!userId) return [];
  const { data } = await apiClient.get(`/playlist/user/${userId}`);
  return data.data.playlists;
};

const createPlaylist = async playlistData => {
  const { data } = await apiClient.post("/playlist", playlistData);
  return data.data;
};

const deletePlaylist = async playlistId => {
  const { data } = await apiClient.delete(`/playlist/${playlistId}`);
  return data;
};

const updateUserCoverImage = async coverImage => {
  const formData = new FormData();
  formData.append("coverImage", coverImage);
  const { data } = await apiClient.patch("/users/coverImage", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
};

const updateUserAvatar = async avatar => {
  const formData = new FormData();
  formData.append("avatar", avatar);
  const { data } = await apiClient.patch("/users/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
};

// --- Component ---
function Dashboard() {
  const queryClient = useQueryClient();
  const { user } = useSelector(state => state.auth);
  const [playlistName, setPlaylistName] = useState("");
  const [playlistDescription, setPlaylistDescription] = useState("");
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  // --- React Query Fetching Handles ---
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: fetchChannelStats,
  });

  const { data: videos, isLoading: isLoadingVideos } = useQuery({
    queryKey: ["dashboardVideos"],
    queryFn: fetchChannelVideos,
  });

  const { data: playlists } = useQuery({
    queryKey: ["playlists", user?._id],
    queryFn: () => fetchUserPlaylists(user?._id),
    enabled: !!user,
  });

  // --- Mutations Pipeline ---
  const togglePublishMutation = useMutation({
    mutationFn: togglePublishStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboardVideos"] });
    },
  });

  const deleteVideoMutation = useMutation({
    mutationFn: deleteVideo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardVideos"] });
      alert("Video resources removed successfully!");
    },
    onError: () => {
      alert("Failed to delete video instance from target cluster node.");
    },
  });

  const createPlaylistMutation = useMutation({
    mutationFn: createPlaylist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists", user?._id] });
      setPlaylistName("");
      setPlaylistDescription("");
      alert("Matrix Playlist index generated successfully!");
    },
    onError: error => {
      alert(
        `Playlist allocation failure: ${error.response?.data?.message || error.message}`,
      );
    },
  });

  const deletePlaylistMutation = useMutation({
    mutationFn: deletePlaylist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists", user?._id] });
      alert("Playlist allocation dropped.");
    },
  });

  const coverImageMutation = useMutation({
    mutationFn: updateUserCoverImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channel", user.username] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      alert("Cover image asset updated successfully!");
      setCoverImageFile(null);
    },
  });

  const avatarMutation = useMutation({
    mutationFn: updateUserAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channel", user.username] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      alert("Channel context brand avatar modified.");
      setAvatarFile(null);
    },
  });

  // --- Dynamic Action Handlers ---
  const handleTogglePublish = videoId => {
    togglePublishMutation.mutate(videoId);
  };

  const handleDeleteVideo = videoId => {
    if (
      window.confirm(
        "Are you sure you want to delete this video? This action cannot be undone.",
      )
    ) {
      deleteVideoMutation.mutate(videoId);
    }
  };

  const handleCreatePlaylist = e => {
    e.preventDefault();
    if (!playlistName.trim()) {
      alert("Playlist name identifier is required.");
      return;
    }
    createPlaylistMutation.mutate({
      name: playlistName,
      description: playlistDescription,
    });
  };

  const handleDeletePlaylist = playlistId => {
    if (
      window.confirm("Are you sure you want to delete this compilation array?")
    ) {
      deletePlaylistMutation.mutate(playlistId);
    }
  };

  if (isLoadingStats || isLoadingVideos) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-950 text-slate-400 text-sm">
        Syncing Channel Studio metrics...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 md:py-10">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="text-2xl md:text-3xl font-black mb-6 tracking-tight">
          Channel Studio Layout
        </h1>

        {/* Branding Configurations Interface Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900 border border-slate-850 p-4 md:p-6 rounded-2xl lg:col-span-2">
            <h2 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2">
              🖼️ Brand Settings Matrix
            </h2>

            <div className="space-y-5">
              {/* Cover Banner Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Workspace Cover Image
                </label>
                <div className="w-full h-32 md:h-40 rounded-xl bg-slate-800 overflow-hidden relative border border-slate-700/40">
                  {user?.coverImage ? (
                    <img
                      src={user.coverImage}
                      alt="Cover Banner"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-xs text-slate-500">
                      No cover image uploaded to this hub container.
                    </div>
                  )}
                </div>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    if (coverImageFile)
                      coverImageMutation.mutate(coverImageFile);
                  }}
                  className="mt-3 flex items-center gap-2 flex-wrap sm:flex-nowrap"
                >
                  <input
                    type="file"
                    onChange={e => setCoverImageFile(e.target.files[0])}
                    accept="image/*"
                    className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-750 cursor-pointer"
                  />
                  <button
                    type="submit"
                    disabled={!coverImageFile || coverImageMutation.isPending}
                    className="w-full sm:w-auto px-4 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:bg-slate-800 disabled:text-slate-500 transition shrink-0"
                  >
                    {coverImageMutation.isPending
                      ? "Uploading..."
                      : "Update Banner"}
                  </button>
                </form>
              </div>

              {/* Avatar Field */}
              <div className="pt-4 border-t border-slate-850">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Studio Profile Identity
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <img
                    src={user?.avatar}
                    alt="Avatar"
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-indigo-500/30 shrink-0"
                  />
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      if (avatarFile) avatarMutation.mutate(avatarFile);
                    }}
                    className="flex items-center gap-2 w-full flex-wrap sm:flex-nowrap"
                  >
                    <input
                      type="file"
                      onChange={e => setAvatarFile(e.target.files[0])}
                      accept="image/*"
                      className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-750 cursor-pointer"
                    />
                    <button
                      type="submit"
                      disabled={!avatarFile || avatarMutation.isPending}
                      className="w-full sm:w-auto px-4 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:bg-slate-800 disabled:text-slate-500 transition shrink-0"
                    >
                      {avatarMutation.isPending
                        ? "Syncing..."
                        : "Update Brand Icon"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Analytics Panels */}
          <div className="grid grid-cols-2 gap-4 lg:flex lg:flex-col lg:justify-between">
            {[
              {
                val: stats?.totalSubscribers,
                label: "Total Subscribers",
                icon: "👥",
              },
              { val: stats?.totalViews, label: "Aggregate Views", icon: "👁️" },
              { val: stats?.totalVideos, label: "Indexed Videos", icon: "📹" },
              {
                val: stats?.totalLikes,
                label: "Accumulated Likes",
                icon: "❤️",
              },
            ].map((s, idx) => (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-850 p-4 rounded-2xl flex flex-col justify-center relative overflow-hidden shadow-sm"
              >
                <span className="absolute right-3 top-3 text-lg opacity-20">
                  {s.icon}
                </span>
                <p className="text-xl md:text-2xl font-black text-white tracking-tight">
                  {s.val || 0}
                </p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Playlists Hub Infrastructure */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-900 border border-slate-850 p-4 md:p-6 rounded-2xl">
            <h2 className="text-base font-bold text-slate-200 mb-4">
              ✨ Initialize Index Playlist
            </h2>
            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Compilation Identifier Name..."
                  value={playlistName}
                  onChange={e => setPlaylistName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
              <div>
                <textarea
                  placeholder="Add target descriptive meta parameters..."
                  value={playlistDescription}
                  onChange={e => setPlaylistDescription(e.target.value)}
                  rows="2"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none transition"
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={createPlaylistMutation.isPending}
                className="w-full px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white transition shadow-sm"
              >
                {createPlaylistMutation.isPending
                  ? "Generating Token..."
                  : "Generate Matrix Playlist"}
              </button>
            </form>
          </div>

          <div className="bg-slate-900 border border-slate-850 p-4 md:p-6 rounded-2xl flex flex-col">
            <h2 className="text-base font-bold text-slate-200 mb-4">
              📁 Active Storage Playlists
            </h2>
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1 grow scrollbar-thin">
              {playlists?.map(playlist => (
                <div
                  key={playlist._id}
                  className="bg-slate-850 border border-slate-800/60 p-3 rounded-xl flex justify-between items-center gap-4 hover:border-slate-700 transition"
                >
                  <Link
                    to={`/playlist/${playlist._id}`}
                    className="grow min-w-0 group"
                  >
                    <p className="font-semibold text-slate-200 text-sm truncate group-hover:text-indigo-400 transition">
                      {playlist.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {playlist.videoCount || 0} tracks synchronized
                    </p>
                  </Link>
                  <button
                    onClick={() => handleDeletePlaylist(playlist._id)}
                    className="px-2.5 py-1 text-xs font-medium text-rose-400 bg-rose-950/20 rounded-md hover:bg-rose-600 hover:text-white transition shrink-0"
                  >
                    Delete
                  </button>
                </div>
              ))}
              {playlists?.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-10 my-auto">
                  No structured collections initialized.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Video Resources Catalog Data Table Container */}
        <h2 className="text-lg font-bold text-slate-200 mb-4">
          Channel Media Directory Registry
        </h2>
        <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden shadow-xl">
          <div className="w-full overflow-x-auto scrollbar-thin">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-slate-850/60 text-slate-400 border-b border-slate-800 text-xs font-semibold tracking-wider uppercase">
                  <th className="p-4 w-32">Media Layer</th>
                  <th className="p-4">Track Title Identifier</th>
                  <th className="p-4 w-28">Status Mode</th>
                  <th className="p-4 w-56 text-right">Registry Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {videos?.map(video => (
                  <tr
                    key={video._id}
                    className="hover:bg-slate-850/20 transition group"
                  >
                    <td className="p-4">
                      <div className="w-24 h-14 bg-slate-800 rounded-lg overflow-hidden border border-slate-700/40 relative">
                        <img
                          src={video.thumbnail}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-200 max-w-xs truncate">
                      {video.title}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          video.isPublished
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {video.isPublished ? "Public Node" : "Draft Cache"}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleTogglePublish(video._id)}
                        className="px-2.5 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-md transition"
                      >
                        Toggle Status
                      </button>
                      <Link
                        to={`/edit-video/${video._id}`}
                        className="px-2.5 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-md transition inline-block"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteVideo(video._id)}
                        className="px-2.5 py-1 text-xs font-semibold bg-rose-600/10 text-rose-400 hover:bg-rose-600 hover:text-white rounded-md transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {videos?.length === 0 && (
            <p className="p-8 text-center text-xs text-slate-500 bg-slate-900">
              No files map arrays allocated within this node directory context
              scope.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
