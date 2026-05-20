import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import apiClient from "../api/axios";
import { formatTimeAgo } from "../utils/time";

// --- API Functions ---
const fetchUserTweets = async userId => {
  const { data } = await apiClient.get(`/tweets/user/${userId}`);
  return data.data.tweets;
};

const createTweet = async content => {
  const { data } = await apiClient.post("/tweets", { content });
  return data.data;
};

const updateTweet = async ({ tweetId, content }) => {
  const { data } = await apiClient.patch(`/tweets/${tweetId}`, { content });
  return data.data;
};

const deleteTweet = async tweetId => {
  const { data } = await apiClient.delete(`/tweets/${tweetId}`);
  return data.data;
};

const toggleTweetLike = async tweetId => {
  const { data } = await apiClient.post(`/likes/toggle/t/${tweetId}`);
  return data.data;
};

// --- Component ---
function TweetsPage() {
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const [tweetContent, setTweetContent] = useState("");
  const [editingTweetId, setEditingTweetId] = useState(null);
  const [editContent, setEditContent] = useState("");

  // ✅ Fetch only logged in user's tweets
  const { data: tweets, isLoading } = useQuery({
    queryKey: ["userTweets", user?._id],
    queryFn: () => fetchUserTweets(user?._id),
    enabled: !!user?._id,
  });

  const createTweetMutation = useMutation({
    mutationFn: createTweet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userTweets", user?._id] });
      queryClient.refetchQueries({ queryKey: ["userTweets", user?._id] });
      setTweetContent("");
    },
  });

  const updateTweetMutation = useMutation({
    mutationFn: updateTweet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userTweets", user?._id] });
      queryClient.refetchQueries({ queryKey: ["userTweets", user?._id] });
      setEditingTweetId(null);
      setEditContent("");
    },
  });

  const deleteTweetMutation = useMutation({
    mutationFn: deleteTweet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userTweets", user?._id] });
      queryClient.refetchQueries({ queryKey: ["userTweets", user?._id] });
    },
  });

  const likeMutation = useMutation({
    mutationFn: toggleTweetLike,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userTweets", user?._id] });
      queryClient.refetchQueries({ queryKey: ["userTweets", user?._id] });
    },
  });

  const handleTweetSubmit = e => {
    e.preventDefault();
    if (!tweetContent.trim()) return;
    createTweetMutation.mutate(tweetContent);
  };

  const handleEditStart = tweet => {
    setEditingTweetId(tweet._id);
    setEditContent(tweet.content);
  };

  const handleEditSubmit = tweetId => {
    if (!editContent.trim()) return;
    updateTweetMutation.mutate({ tweetId, content: editContent });
  };

  const handleDelete = tweetId => {
    if (window.confirm("Are you sure you want to delete this tweet?")) {
      deleteTweetMutation.mutate(tweetId);
    }
  };

  const handleLike = tweetId => {
    if (!isAuthenticated) {
      alert("Please log in to like a tweet.");
      return;
    }
    likeMutation.mutate(tweetId);
  };

  // ✅ Show message if not logged in
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl text-center">
        <h1 className="text-3xl font-bold text-white mb-4">My Tweets</h1>
        <p className="text-gray-400">
          Please{" "}
          <a href="/login" className="text-indigo-400 hover:underline">
            log in
          </a>{" "}
          to see your tweets.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-white mb-6">My Tweets</h1>

      {/* Create Tweet Form */}
      <div className="bg-gray-800 p-4 rounded-lg mb-8">
        <form
          onSubmit={handleTweetSubmit}
          className="flex items-start space-x-4"
        >
          <img
            src={user?.avatar}
            alt={user?.username}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="grow">
            <textarea
              value={tweetContent}
              onChange={e => setTweetContent(e.target.value)}
              placeholder="What's happening?"
              className="w-full bg-gray-700 text-white p-2 rounded-lg border border-gray-600"
              rows="3"
            ></textarea>
            <div className="text-right mt-2">
              <button
                type="submit"
                disabled={createTweetMutation.isPending}
                className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 disabled:bg-indigo-400"
              >
                {createTweetMutation.isPending ? "Posting..." : "Tweet"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Tweet List */}
      {isLoading ? (
        <p className="text-gray-400">Loading tweets...</p>
      ) : (
        <div className="space-y-4">
          {tweets?.map(tweet => {
            const isEditing = editingTweetId === tweet._id;

            return (
              <div
                key={tweet._id}
                className="bg-gray-800 p-4 rounded-lg flex items-start space-x-4"
              >
                <img
                  src={tweet.owner?.avatar}
                  alt={tweet.owner?.username}
                  className="w-12 h-12 rounded-full object-cover shrink-0"
                />
                <div className="grow min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <p className="font-semibold text-white">
                        {tweet.owner?.fullname}
                      </p>
                      <p className="text-sm text-gray-400">
                        @{tweet.owner?.username}
                      </p>
                      <p className="text-sm text-gray-400">·</p>
                      <p className="text-sm text-gray-400">
                        {formatTimeAgo(tweet.createdAt)}
                      </p>
                    </div>

                    {/* ✅ Edit/Delete — always shown since these are user's own tweets */}
                    {!isEditing && (
                      <div className="flex items-center space-x-2 shrink-0 ml-2">
                        <button
                          onClick={() => handleEditStart(tweet)}
                          className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded hover:bg-gray-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(tweet._id)}
                          disabled={deleteTweetMutation.isPending}
                          className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-gray-700"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Edit mode */}
                  {isEditing ? (
                    <div className="mt-2">
                      <textarea
                        value={editContent}
                        onChange={e => setEditContent(e.target.value)}
                        className="w-full bg-gray-700 text-white p-2 rounded-lg border border-gray-600 text-sm"
                        rows="3"
                      />
                      <div className="flex space-x-2 mt-2 justify-end">
                        <button
                          onClick={() => setEditingTweetId(null)}
                          className="text-xs text-gray-400 hover:text-white px-3 py-1 rounded hover:bg-gray-700"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleEditSubmit(tweet._id)}
                          disabled={updateTweetMutation.isPending}
                          className="text-xs text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded"
                        >
                          {updateTweetMutation.isPending ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-300 mt-1 wrap-break-word">
                      {tweet.content}
                    </p>
                  )}

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
            <p className="text-center text-gray-400">
              No tweets yet. Post your first one!
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default TweetsPage;
