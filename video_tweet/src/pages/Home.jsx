import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import apiClient from "../api/axios";
import VideoCard from "../components/VideoCard";
import { formatTimeAgo } from "../utils/time";

const fetchVideos = async () => {
  const { data } = await apiClient.get("/videos");
  return data.data.docs;
};

const fetchAllTweets = async () => {
  const { data } = await apiClient.get("/tweets");
  return data.data.tweets;
};

const toggleTweetLike = async tweetId => {
  const { data } = await apiClient.post(`/likes/toggle/t/${tweetId}`);
  return data.data;
};

function Home() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useSelector(state => state.auth);

  const {
    data: videos,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["videos"],
    queryFn: fetchVideos,
  });

  const { data: tweets, isLoading: isLoadingTweets } = useQuery({
    queryKey: ["allTweets"],
    queryFn: fetchAllTweets,
  });

  const likeMutation = useMutation({
    mutationFn: toggleTweetLike,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allTweets"] });
    },
  });

  const handleLike = tweetId => {
    if (!isAuthenticated) {
      alert("Please log in to like a tweet.");
      return;
    }
    likeMutation.mutate(tweetId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-950 text-slate-400 text-sm">
        Loading core node feed...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center p-8 bg-slate-950 min-h-screen text-rose-400 text-sm">
        Error mounting dashboard matrix pipeline: {error.message}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 md:py-10">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Videos Feed Section */}
        <h2 className="text-xl font-black mb-6 tracking-tight flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
          Recommended Stream Media
        </h2>

        {videos && videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-7">
            {videos.map(video => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-900 border border-slate-850 rounded-2xl p-6">
            <h3 className="text-base font-bold text-slate-300">
              No content pipelines detected
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Initialize media updates by uploading custom project video nodes.
            </p>
          </div>
        )}

        {/* Micro-Tweets Node Grid Feed */}
        <div className="mt-14">
          <div className="flex items-center justify-between mb-6 border-b border-slate-850 pb-3">
            <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
              Global Node Micro-Tweets
            </h2>
            <Link
              to="/all-tweets"
              className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold transition tracking-wide uppercase"
            >
              View Feed →
            </Link>
          </div>

          {isLoadingTweets ? (
            <p className="text-xs text-slate-500">
              Syncing platform tweets data...
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tweets?.slice(0, 4).map(tweet => (
                <div
                  key={tweet._id}
                  className="bg-slate-900 border border-slate-850 p-4 rounded-xl flex items-start space-x-3.5 shadow-md"
                >
                  <img
                    src={tweet.owner.avatar}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-800"
                  />
                  <div className="min-w-0 grow">
                    <div className="flex items-baseline space-x-2 flex-wrap text-xs">
                      <span className="font-bold text-slate-200 truncate">
                        {tweet.owner.fullname}
                      </span>
                      <span className="text-slate-500 truncate">
                        @{tweet.owner.username}
                      </span>
                      <span className="text-slate-600 hidden sm:inline">·</span>
                      <span className="text-slate-500 shrink-0">
                        {formatTimeAgo(tweet.createdAt)}
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm mt-1.5 break-words whitespace-pre-wrap leading-relaxed pr-1">
                      {tweet.content}
                    </p>

                    <div className="mt-3">
                      <button
                        onClick={() => handleLike(tweet._id)}
                        disabled={
                          likeMutation.isPending &&
                          likeMutation.variables === tweet._id
                        }
                        className={`inline-flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-md font-medium transition ${
                          tweet.isLiked
                            ? "bg-indigo-500/10 text-indigo-400"
                            : "bg-slate-800 text-slate-400 hover:bg-slate-750 hover:text-slate-200"
                        }`}
                      >
                        <span>{tweet.isLiked ? "👍" : "👍"}</span>
                        <span>{tweet.likesCount || 0}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {tweets?.length === 0 && (
                <p className="text-slate-500 text-xs text-center col-span-2 py-6">
                  No platform micro-messages discovered.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
