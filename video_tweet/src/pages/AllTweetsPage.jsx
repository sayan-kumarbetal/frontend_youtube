import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import apiClient from "../api/axios";
import { formatTimeAgo } from "../utils/time";

// --- API Functions ---
const fetchAllTweets = async () => {
  const { data } = await apiClient.get("/tweets");
  return data.data.tweets;
};

const toggleTweetLike = async tweetId => {
  const { data } = await apiClient.post(`/likes/toggle/t/${tweetId}`);
  return data.data;
};

// --- Component ---
function AllTweetsPage() {
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useSelector(state => state.auth);

  const { data: tweets, isLoading } = useQuery({
    queryKey: ["allTweets"],
    queryFn: fetchAllTweets,
  });

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-white mb-6">All Tweets</h1>

      {isLoading ? (
        <p className="text-gray-400">Loading tweets...</p>
      ) : (
        <div className="space-y-4">
          {tweets?.map(tweet => {
            const isOwner = user?._id === tweet.owner._id;

            return (
              <div
                key={tweet._id}
                className="bg-gray-800 p-4 rounded-lg flex items-start space-x-4"
              >
                <img
                  src={tweet.owner.avatar}
                  alt={tweet.owner.username}
                  className="w-12 h-12 rounded-full object-cover shrink-0"
                />
                <div className="grow min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <p className="font-semibold text-white">
                        {tweet.owner.fullname}
                      </p>
                      <p className="text-sm text-gray-400">
                        @{tweet.owner.username}
                      </p>
                      <p className="text-sm text-gray-400">·</p>
                      <p className="text-sm text-gray-400">
                        {formatTimeAgo(tweet.createdAt)}
                      </p>
                    </div>

                    {/* ✅ Show owner badge */}
                    {isOwner && (
                      <span className="text-xs text-indigo-400 bg-indigo-900 px-2 py-0.5 rounded-full shrink-0 ml-2">
                        You
                      </span>
                    )}
                  </div>

                  <p className="text-gray-300 mt-1 wrap-break-word">
                    {tweet.content}
                  </p>

                  {/* ✅ Like Button */}
                  <div className="mt-3">
                    <button
                      onClick={() => handleLike(tweet._id)}
                      disabled={
                        likeMutation.isPending &&
                        likeMutation.variables === tweet._id
                      }
                      className={`flex items-center space-x-1 text-sm px-3 py-1 rounded-full transition-colors ${
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
            );
          })}

          {tweets?.length === 0 && (
            <p className="text-center text-gray-400">No tweets yet.</p>
          )}

          {!isAuthenticated && (
            <p className="text-center text-gray-400 mt-4">
              <a href="/login" className="text-indigo-400 hover:underline">
                Log in
              </a>{" "}
              to like tweets.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default AllTweetsPage;
