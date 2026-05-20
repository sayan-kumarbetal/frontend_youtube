import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import apiClient from "../api/axios";
import { Link } from "react-router-dom";

// --- API Functions ---
const fetchUserPlaylists = async userId => {
  if (!userId) return [];
  const { data } = await apiClient.get(`/playlist/user/${userId}`);
  return data.data.playlists;
};

const toggleVideoInPlaylist = async ({
  playlistId,
  videoId,
  isCurrentlyInPlaylist,
}) => {
  const endpoint = isCurrentlyInPlaylist
    ? `/playlist/remove/${videoId}/${playlistId}`
    : `/playlist/add/${videoId}/${playlistId}`;

  const { data } = await apiClient.patch(endpoint);
  return data.data;
};

// --- Component ---
function PlaylistModal({ video, onClose }) {
  const queryClient = useQueryClient();
  const { user } = useSelector(state => state.auth);

  const { data: playlists, isLoading } = useQuery({
    queryKey: ["playlists", user?._id],
    queryFn: () => fetchUserPlaylists(user?._id),
    enabled: !!user,
  });

  const toggleMutation = useMutation({
    mutationFn: toggleVideoInPlaylist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists", user?._id] });
      queryClient.refetchQueries({ queryKey: ["playlists", user?._id] });
    },
    onError: error => {
      alert(
        `Error: ${error.response?.data?.message || "Could not update playlist."}`,
      );
    },
  });

  const handlePlaylistToggle = playlist => {
    // ✅ Fixed — convert both to string before comparing
    const isCurrentlyInPlaylist = playlist.videos?.some(
      v => v.toString() === video._id.toString(),
    );

    toggleMutation.mutate({
      playlistId: playlist._id,
      videoId: video._id,
      isCurrentlyInPlaylist,
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-sm"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Save to...</h2>
          <button
            onClick={onClose}
            className="text-gray-400 text-2xl hover:text-white"
          >
            &times;
          </button>
        </div>

        {isLoading ? (
          <p className="text-gray-400 text-sm">Loading playlists...</p>
        ) : (
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {playlists?.map(playlist => {
              // ✅ Fixed — convert both to string before comparing
              const isVideoInPlaylist = playlist.videos?.some(
                v => v.toString() === video._id.toString(),
              );

              return (
                <div
                  key={playlist._id}
                  className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-700"
                >
                  <input
                    type="checkbox"
                    id={playlist._id}
                    checked={isVideoInPlaylist}
                    onChange={() => handlePlaylistToggle(playlist)}
                    disabled={
                      toggleMutation.isPending &&
                      toggleMutation.variables?.playlistId === playlist._id
                    }
                    className="h-5 w-5 shrink-0 rounded bg-gray-600 border-gray-500 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <label
                    htmlFor={playlist._id}
                    className="text-white grow min-w-0 truncate text-sm font-medium cursor-pointer"
                    title={playlist.name}
                  >
                    {playlist.name}
                  </label>
                </div>
              );
            })}

            {playlists?.length === 0 && (
              <p className="text-gray-400 text-sm">
                No playlists found.{" "}
                <Link
                  to="/dashboard"
                  className="text-indigo-400 hover:underline"
                >
                  Create one!
                </Link>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PlaylistModal;
