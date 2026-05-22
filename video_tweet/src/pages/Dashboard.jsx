import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import apiClient from "../api/axios";

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

function Dashboard() {
  const queryClient = useQueryClient();
  const { user } = useSelector(state => state.auth);
  const [playlistName, setPlaylistName] = useState("");
  const [playlistDescription, setPlaylistDescription] = useState("");
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

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
    },
  });

  const createPlaylistMutation = useMutation({
    mutationFn: createPlaylist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists", user?._id] });
      setPlaylistName("");
      setPlaylistDescription("");
    },
  });

  const deletePlaylistMutation = useMutation({
    mutationFn: deletePlaylist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists", user?._id] });
    },
  });

  const coverImageMutation = useMutation({
    mutationFn: updateUserCoverImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channel", user.username] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      setCoverImageFile(null);
    },
  });

  const avatarMutation = useMutation({
    mutationFn: updateUserAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channel", user.username] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      setAvatarFile(null);
    },
  });

  if (isLoadingStats || isLoadingVideos) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-950 text-slate-400 text-sm">
        Loading dashboard metrics...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 md:py-10">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="text-2xl md:text-3xl font-black mb-6 tracking-tight">
          Channel Studio
        </h1>

        {/* Channel Customization Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900 border border-slate-850 p-4 md:p-6 rounded-2xl lg:col-span-2">
            <h2 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2">
              🖼️ Branding Settings
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Banner Cover
                </label>
                <div className="w-full h-32 md:h-40 rounded-xl bg-slate-800 overflow-hidden relative group border border-slate-700/40">
                  {user?.coverImage ? (
                    <img
                      src={user.coverImage}
                      alt="Cover Banner"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-xs text-slate-500">
                      No cover banner set
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
                    className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 cursor-pointer"
                  />
                  <button
                    type="submit"
                    disabled={!coverImageFile || coverImageMutation.isPending}
                    className="w-full sm:w-auto px-4 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:bg-slate-800 disabled:text-slate-500 transition shrink-0"
                  >
                    Update
                  </button>
                </form>
              </div>

              <div className="pt-2 border-t border-slate-850">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Avatar Brand
                </label>
                <div className="flex items-center space-x-4">
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
                      className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 cursor-pointer"
                    />
                    <button
                      type="submit"
                      disabled={!avatarFile || avatarMutation.isPending}
                      className="w-full sm:w-auto px-4 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:bg-slate-800 disabled:text-slate-500 transition shrink-0"
                    >
                      Update
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Core Analytics Cards */}
          <div className="grid grid-cols-2 gap-4 lg:flex lg:flex-col lg:justify-between">
            {[
              {
                val: stats?.totalSubscribers,
                label: "Subscribers",
                icon: "👥",
              },
              { val: stats?.totalViews, label: "Total Views", icon: "👁️" },
              { val: stats?.totalVideos, label: "Total Videos", icon: "📹" },
              { val: stats?.totalLikes, label: "Total Likes", icon: "❤️" },
            ].map((s, idx) => (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-850 p-4 rounded-2xl flex flex-col justify-center relative overflow-hidden"
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

        {/* Playlists Infrastructure */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-900 border border-slate-850 p-4 md:p-6 rounded-2xl">
            <h2 className="text-base font-bold text-slate-200 mb-4">
              ✨ Create Playlist
            </h2>
            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Playlist Name"
                  value={playlistName}
                  onChange={e => setPlaylistName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <textarea
                  placeholder="Add a rich description description..."
                  value={playlistDescription}
                  onChange={e => setPlaylistDescription(e.target.value)}
                  rows="2"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={createPlaylistMutation.isPending}
                className="w-full px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white transition shadow-sm"
              >
                {createPlaylistMutation.isPending
                  ? "Building..."
                  : "Build Matrix Playlist"}
              </button>
            </form>
          </div>

          <div className="bg-slate-900 border border-slate-850 p-4 md:p-6 rounded-2xl flex flex-col">
            <h2 className="text-base font-bold text-slate-200 mb-4">
              📁 Active Playlists
            </h2>
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1 grow scrollbar-thin">
              {playlists?.map(playlist => (
                <div
                  key={playlist._id}
                  className="bg-slate-850 border border-slate-800/60 p-3 rounded-xl flex justify-between items-center gap-4 hover:border-slate-700/80 transition"
                >
                  <Link
                    to={`/playlist/${playlist._id}`}
                    className="grow min-w-0 group"
                  >
                    <p className="font-semibold text-slate-200 text-sm truncate group-hover:text-indigo-400 transition">
                      {playlist.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {playlist.videoCount} videos indexed
                    </p>
                  </Link>
                  <button
                    onClick={() => {
                      if (confirm("Delete playlist?"))
                        deletePlaylistMutation.mutate(playlist._id);
                    }}
                    className="px-2.5 py-1 text-xs font-medium text-rose-400 bg-rose-950/20 rounded-md hover:bg-rose-900 hover:text-white transition"
                  >
                    Delete
                  </button>
                </div>
              ))}
              {playlists?.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-8">
                  No collections listed yet.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Video Catalog Database Display */}
        <h2 className="text-lg font-bold text-slate-200 mb-4">
          Indexed Video Catalog
        </h2>
        <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden shadow-xl">
          <div className="w-full overflow-x-auto scrollbar-thin">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-850/60 text-slate-400 border-b border-slate-800 text-xs font-semibold tracking-wider uppercase">
                  <th className="p-4 w-32">Media</th>
                  <th className="p-4">Title Meta</th>
                  <th className="p-4 w-28">Status</th>
                  <th className="p-4 w-56 text-right">Actions</th>
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
                        {video.isPublished ? "Public" : "Draft"}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => togglePublishMutation.mutate(video._id)}
                        className="px-2.5 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition"
                      >
                        Toggle Status
                      </button>
                      <Link
                        to={`/edit-video/${video._id}`}
                        className="px-2.5 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition inline-block"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => {
                          if (confirm("Delete video resource?"))
                            deleteVideoMutation.mutate(video._id);
                        }}
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
              No assets uploaded to this node channel context.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
