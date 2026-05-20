import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import apiClient from "../api/axios";
import VideoCard from "../components/VideoCard";
import { formatTimeAgo } from "../utils/time";

// --- API Functions ---
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
    error,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["videos"],
    queryFn: fetchVideos,
  });

  const { data: tweets, isLoading: isLoadingTweets } = useQuery({
    queryKey: ["allTweets"],
    queryFn: fetchAllTweets,
  });

  // ✅ Like mutation
  const likeMutation = useMutation({
    mutationFn: toggleTweetLike,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allTweets"] });
      queryClient.refetchQueries({ queryKey: ["allTweets"] });
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
      <div className="text-center p-8">
        <p className="text-lg text-gray-300">Loading videos...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center p-8">
        <p className="text-lg text-red-500">Error: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Videos Section */}
      <h2 className="text-2xl font-bold text-white mb-6">Videos</h2>
      {videos && videos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8">
          {videos.map(video => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      ) : (
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-white">No videos found.</h2>
          <p className="text-gray-400 mt-2">
            Try uploading a video or check back later!
          </p>
        </div>
      )}

      {/* Tweets Section */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Latest Tweets</h2>
          <Link
            to="/all-tweets"
            className="text-indigo-400 hover:text-indigo-300 text-sm"
          >
            View all →
          </Link>
        </div>

        {isLoadingTweets ? (
          <p className="text-gray-400">Loading tweets...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tweets?.slice(0, 4).map(tweet => (
              <div
                key={tweet._id}
                className="bg-gray-800 p-4 rounded-lg flex items-start space-x-4"
              >
                <img
                  src={tweet.owner.avatar}
                  alt={tweet.owner.username}
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                />
                <div className="min-w-0 grow">
                  <div className="flex items-center space-x-2 flex-wrap">
                    <p className="font-semibold text-white text-sm">
                      {tweet.owner.fullname}
                    </p>
                    <p className="text-xs text-gray-400">
                      @{tweet.owner.username}
                    </p>
                    <p className="text-xs text-gray-400">·</p>
                    <p className="text-xs text-gray-400">
                      {formatTimeAgo(tweet.createdAt)}
                    </p>
                  </div>
                  <p className="text-gray-300 mt-1 text-sm wrap-break-word">
                    {tweet.content}
                  </p>

                  {/* ✅ Like button */}
                  <div className="mt-2">
                    <button
                      onClick={() => handleLike(tweet._id)}
                      disabled={
                        likeMutation.isPending &&
                        likeMutation.variables === tweet._id
                      }
                      className={`flex items-center space-x-1 text-xs px-3 py-1 rounded-full transition-colors ${
                        tweet.isLiked
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                      }`}
                    >
                      <span>👍</span>
                      <span>{tweet.likesCount || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {tweets?.length === 0 && (
              <p className="text-gray-400 col-span-2 text-center">
                No tweets yet.{" "}
                <Link to="/tweets" className="text-indigo-400 hover:underline">
                  Be the first to post!
                </Link>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
