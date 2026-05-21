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
  const [avatarFile, setAvatarFile] = useState(null); // ✅ added

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
      alert("Video deleted successfully!");
    },
    onError: () => {
      alert("Failed to delete video. Please try again.");
    },
  });

  const createPlaylistMutation = useMutation({
    mutationFn: createPlaylist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists", user?._id] });
      setPlaylistName("");
      setPlaylistDescription("");
      alert("Playlist created!");
    },
    onError: error => {
      alert(
        `Failed to create playlist: ${error.response?.data?.message || error.message}`,
      );
    },
  });

  const deletePlaylistMutation = useMutation({
    mutationFn: deletePlaylist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists", user?._id] });
      alert("Playlist deleted successfully!");
    },
  });

  const coverImageMutation = useMutation({
    mutationFn: updateUserCoverImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channel", user.username] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      alert("Cover image updated successfully!");
      setCoverImageFile(null);
    },
    onError: error => {
      alert(
        `Failed to update cover image: ${error.response?.data?.message || error.message}`,
      );
    },
  });

  // ✅ Avatar mutation
  const avatarMutation = useMutation({
    mutationFn: updateUserAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channel", user.username] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      alert("Avatar updated successfully!");
      setAvatarFile(null);
    },
    onError: error => {
      alert(
        `Failed to update avatar: ${error.response?.data?.message || error.message}`,
      );
    },
  });

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
      alert("Playlist name is required.");
      return;
    }
    createPlaylistMutation.mutate({
      name: playlistName,
      description: playlistDescription,
    });
  };

  const handleDeletePlaylist = playlistId => {
    if (window.confirm("Are you sure you want to delete this playlist?")) {
      deletePlaylistMutation.mutate(playlistId);
    }
  };

  const handleCoverImageSubmit = e => {
    e.preventDefault();
    if (!coverImageFile) {
      alert("Please select a file to upload.");
      return;
    }
    coverImageMutation.mutate(coverImageFile);
  };

  // ✅ Avatar submit handler
  const handleAvatarSubmit = e => {
    e.preventDefault();
    if (!avatarFile) {
      alert("Please select a file to upload.");
      return;
    }
    avatarMutation.mutate(avatarFile);
  };

  if (isLoadingStats || isLoadingVideos) {
    return (
      <div className="text-center p-8 text-white">Loading dashboard...</div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Your Dashboard</h1>

      {/* ✅ Channel Settings */}
      <div className="bg-gray-800 p-6 rounded-lg mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">Channel Settings</h2>

        {/* ✅ Cover Image — fixed height, not aspect-video */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Current Cover Image
          </label>
          <div className="w-full h-48  rounded-lg overflow-hidden flex items-center justify-center">
            {user?.coverImage ? (
              <img
                src={user.coverImage}
                alt="Cover"
                className="max-w-full max-h-full object-contain" // ← full image
              />
            ) : (
              <div className="flex justify-center items-center h-full">
                <p className="text-gray-400">No cover image uploaded.</p>
              </div>
            )}
          </div>
          <form
            onSubmit={handleCoverImageSubmit}
            className="mt-3 flex items-center space-x-4"
          >
            <input
              type="file"
              id="coverImage"
              onChange={e => setCoverImageFile(e.target.files[0])}
              accept="image/*"
              className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-600 file:text-gray-200 hover:file:bg-gray-500"
            />
            <button
              type="submit"
              disabled={!coverImageFile || coverImageMutation.isPending}
              className="px-4 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed shrink-0"
            >
              {coverImageMutation.isPending ? "Uploading..." : "Upload"}
            </button>
          </form>
        </div>

        {/* ✅ Avatar section */}
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Current Avatar
          </label>
          <div className="flex items-center space-x-4">
            <img
              src={user?.avatar}
              alt="Avatar"
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-600"
              onError={e => {
                e.target.src = "https://via.placeholder.com/80";
              }}
            />
            <form
              onSubmit={handleAvatarSubmit}
              className="flex items-center space-x-4 grow"
            >
              <input
                type="file"
                id="avatar"
                onChange={e => setAvatarFile(e.target.files[0])}
                accept="image/*"
                className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-600 file:text-gray-200 hover:file:bg-gray-500"
              />
              <button
                type="submit"
                disabled={!avatarFile || avatarMutation.isPending}
                className="px-4 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed shrink-0"
              >
                {avatarMutation.isPending ? "Uploading..." : "Upload"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold text-white">
            {stats?.totalSubscribers || 0}
          </p>
          <p className="text-gray-400">Subscribers</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold text-white">
            {stats?.totalViews || 0}
          </p>
          <p className="text-gray-400">Total Views</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold text-white">
            {stats?.totalVideos || 0}
          </p>
          <p className="text-gray-400">Total Videos</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold text-white">
            {stats?.totalLikes || 0}
          </p>
          <p className="text-gray-400">Total Likes</p>
        </div>
      </div>

      {/* Playlists Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-white mb-4">
            Create New Playlist
          </h2>
          <form onSubmit={handleCreatePlaylist} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Playlist Name
              </label>
              <input
                type="text"
                id="playlistName"
                value={playlistName}
                onChange={e => setPlaylistName(e.target.value)}
                className="w-full px-3 py-2 mt-1 text-gray-300 bg-gray-700 border border-gray-600 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Description
              </label>
              <textarea
                id="playlistDescription"
                value={playlistDescription}
                onChange={e => setPlaylistDescription(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 mt-1 text-gray-300 bg-gray-700 border border-gray-600 rounded-md"
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={createPlaylistMutation.isPending}
              className="w-full px-4 py-2 font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
            >
              {createPlaylistMutation.isPending
                ? "Creating..."
                : "Create Playlist"}
            </button>
          </form>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-white mb-4">Your Playlists</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {playlists?.map(playlist => (
              <div
                key={playlist._id}
                className="bg-gray-700 p-3 rounded-md flex justify-between items-center"
              >
                <Link
                  to={`/playlist/${playlist._id}`}
                  className="grow hover:underline"
                >
                  <p className="font-semibold text-white">{playlist.name}</p>
                  <p className="text-sm text-gray-400">
                    {playlist.videoCount} videos
                  </p>
                </Link>
                <button
                  onClick={() => handleDeletePlaylist(playlist._id)}
                  className="ml-4 px-3 py-1 text-xs text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                  disabled={deletePlaylistMutation.isPending}
                >
                  Delete
                </button>
              </div>
            ))}
            {playlists?.length === 0 && (
              <p className="text-gray-400">
                You haven't created any playlists yet.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Videos Table */}
      <h2 className="text-2xl font-bold text-white mb-4">Your Videos</h2>
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full text-left text-white">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-4">Thumbnail</th>
              <th className="p-4">Title</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {videos?.map(video => (
              <tr key={video._id} className="border-t border-gray-700">
                <td className="p-4">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-24 h-14 object-cover rounded-md"
                  />
                </td>
                <td className="p-4 font-semibold">{video.title}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      video.isPublished ? "bg-green-600" : "bg-yellow-600"
                    }`}
                  >
                    {video.isPublished ? "Published" : "Unpublished"}
                  </span>
                </td>
                <td className="p-4 space-x-2">
                  <button
                    onClick={() => handleTogglePublish(video._id)}
                    className="px-3 py-1 text-sm bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Toggle Publish
                  </button>
                  <Link
                    to={`/edit-video/${video._id}`}
                    className="px-3 py-1 text-sm bg-gray-600 rounded-md hover:bg-gray-700 inline-block"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteVideo(video._id)}
                    className="px-3 py-1 text-sm bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                    disabled={deleteVideoMutation.isPending}
                  >
                    {deleteVideoMutation.isPending &&
                    deleteVideoMutation.variables === video._id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {videos?.length === 0 && (
          <p className="p-4 text-center text-gray-400">
            You haven't uploaded any videos yet.
          </p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
