import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import apiClient from "../api/axios";
import CommentList from "../components/CommentList";
import PlaylistModal from "../components/PlaylistModal";

const fetchVideoById = async videoId => {
  const { data } = await apiClient.get(`/videos/${videoId}`);
  return data.data;
};

const toggleSubscription = async channelId => {
  const { data } = await apiClient.post(`/subscriptions/c/${channelId}`);
  return data.data;
};

const toggleVideoLike = async videoId => {
  const { data } = await apiClient.post(`/likes/toggle/v/${videoId}`);
  return data.data;
};

function VideoDetail() {
  const { videoId } = useParams();
  const queryClient = useQueryClient();
  const { isAuthenticated, user: loggedInUser } = useSelector(
    state => state.auth,
  );
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);

  const {
    data: video,
    error,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["video", videoId],
    queryFn: () => fetchVideoById(videoId),
    enabled: !!videoId,
  });

  const subscriptionMutation = useMutation({
    mutationFn: toggleSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video", videoId] });
    },
  });

  const likeMutation = useMutation({
    mutationFn: toggleVideoLike,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video", videoId] });
    },
  });

  const handleSubscribe = () => {
    if (!isAuthenticated) {
      alert("Please log in to subscribe.");
      return;
    }
    subscriptionMutation.mutate(video.owner._id);
  };

  const handleLike = () => {
    if (!isAuthenticated) {
      alert("Please log in to like a video.");
      return;
    }
    likeMutation.mutate(videoId);
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-950 text-slate-400 text-sm">
        Streaming media buffer...
      </div>
    );
  if (isError)
    return (
      <div className="text-center p-8 text-rose-500 bg-slate-950 min-h-screen">
        Data Sync Error: {error.message}
      </div>
    );

  const isOwner = loggedInUser?._id === video?.owner?._id;

  const formatNumber = num =>
    new Intl.NumberFormat("en-US", {
      notation: "compact",
      compactDisplay: "short",
    }).format(num);

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 py-4 md:py-8">
      <div className="container mx-auto px-4 max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Main Channel Output Engine */}
        <div className="lg:col-span-2">
          <div className="w-full bg-black aspect-video rounded-2xl overflow-hidden shadow-2xl border border-slate-900">
            <video
              src={video.videoFile}
              controls
              autoPlay
              muted
              className="w-full h-full object-contain"
            ></video>
          </div>

          <div className="mt-4">
            <h1 className="text-xl md:text-2xl font-black text-white leading-tight tracking-tight">
              {video.title}
            </h1>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-400 text-xs mt-2 border-b border-slate-900 pb-4">
              <div className="flex items-center space-x-3">
                <span className="font-medium text-slate-300">
                  {formatNumber(video.views)} views
                </span>
                <span>·</span>
                <span>
                  {new Date(video.createdAt).toLocaleDateString(undefined, {
                    dateStyle: "medium",
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleLike}
                  disabled={likeMutation.isPending}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition ${
                    video.isLiked
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-900 text-slate-300 hover:bg-slate-850 border border-slate-800"
                  }`}
                >
                  <span>👍</span>
                  <span>{formatNumber(video.likesCount)}</span>
                </button>

                {isOwner && (
                  <button
                    onClick={() => setIsPlaylistModalOpen(true)}
                    className="px-3.5 py-1.5 text-xs font-bold bg-slate-900 text-slate-300 hover:bg-slate-850 rounded-xl border border-slate-800 transition"
                  >
                    ➕ Collect Playlist
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Publisher Identity Block */}
          <div className="flex items-center justify-between mt-4 bg-slate-900/40 border border-slate-900 p-4 rounded-2xl gap-4 flex-wrap sm:flex-nowrap">
            <div className="flex items-center space-x-3.5 min-w-0">
              <Link
                to={`/channel/${video.owner.username}`}
                className="shrink-0"
              >
                <img
                  src={video.owner.avatar}
                  alt=""
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-800"
                />
              </Link>
              <div className="min-w-0">
                <Link
                  to={`/channel/${video.owner.username}`}
                  className="hover:text-indigo-400 transition block"
                >
                  <h2 className="text-sm font-bold text-slate-200 truncate">
                    {video.owner.username}
                  </h2>
                </Link>
                <p className="text-xs text-slate-500 mt-0.5">
                  {formatNumber(video.owner.subscriberCount || 0)} subscribers
                </p>
              </div>
            </div>

            {!isOwner && (
              <button
                onClick={handleSubscribe}
                disabled={subscriptionMutation.isPending}
                className={`w-full sm:w-auto px-4 py-2 text-xs font-bold rounded-xl transition shrink-0 ${
                  video.owner.isSubscribed
                    ? "bg-slate-800 text-slate-400 border border-slate-700"
                    : "bg-rose-600 text-white hover:bg-rose-700"
                }`}
              >
                {subscriptionMutation.isPending
                  ? "..."
                  : video.owner.isSubscribed
                    ? "Subscribed"
                    : "Subscribe"}
              </button>
            )}
          </div>

          <div className="mt-4 p-4 bg-slate-900 border border-slate-850 rounded-2xl">
            <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed break-words">
              {video.description}
            </p>
          </div>

          <CommentList videoId={videoId} />
        </div>

        {/* Sidebar Component Columns */}
        <div className="lg:col-span-1">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
            Up Next Node
          </h3>
          <div className="bg-slate-900 border border-slate-850 p-4 rounded-2xl text-center">
            <p className="text-xs text-slate-500">
              Related contextual updates stream coming soon.
            </p>
          </div>
        </div>
      </div>

      {isPlaylistModalOpen && isOwner && (
        <PlaylistModal
          video={video}
          onClose={() => setIsPlaylistModalOpen(false)}
        />
      )}
    </div>
  );
}

export default VideoDetail;
