import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../api/axios";
import VideoCard from "../components/VideoCard";

const fetchPlaylistById = async playlistId => {
  const { data } = await apiClient.get(`/playlist/${playlistId}`);
  return data.data;
};

function PlaylistDetail() {
  const { playlistId } = useParams();

  const {
    data: playlist,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["playlist", playlistId],
    queryFn: () => fetchPlaylistById(playlistId),
    enabled: !!playlistId,
  });

  if (isLoading)
    return (
      <div className="text-center py-20 text-slate-400 text-sm bg-slate-950 min-h-screen">
        Indexing collection items...
      </div>
    );
  if (isError)
    return (
      <div className="text-center p-8 text-rose-500 text-sm bg-slate-950 min-h-screen">
        Sync Failure: {error.message}
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 md:py-10">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header Block Section */}
        <div className="mb-8 bg-slate-900 border border-slate-850 p-5 md:p-6 rounded-2xl shadow-xl">
          <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md tracking-wider uppercase">
            System Playlist Collection
          </span>
          <h1 className="text-2xl md:text-4xl font-black text-white mt-3 tracking-tight">
            {playlist.name}
          </h1>
          <p className="text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
            {playlist.description || "No metadata description provided."}
          </p>
          <div className="flex items-center space-x-3 text-xs font-semibold text-slate-500 mt-4 border-t border-slate-800/60 pt-3">
            <span>By @{playlist.owner?.username}</span>
            <span className="text-slate-800">·</span>
            <span className="text-slate-400">
              {playlist.videos?.length || 0} items indexed
            </span>
          </div>
        </div>

        {/* Video Grid Indexing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-7">
          {playlist.videos?.map(video => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>

        {playlist.videos?.length === 0 && (
          <div className="text-center py-12 bg-slate-900 border border-slate-850 rounded-2xl p-6">
            <h2 className="text-base font-bold text-slate-300">
              Empty Collection
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              No content assets have been explicitly targeted to this
              compilation yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlaylistDetail;
