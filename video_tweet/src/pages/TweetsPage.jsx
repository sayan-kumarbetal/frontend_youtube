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

  // --- AI Smart Assistant State Hub ---
  const [aiTweetOptions, setAiTweetOptions] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Fetch only logged in user's tweets
  const { data: tweets, isLoading } = useQuery({
    queryKey: ["userTweets", user?._id],
    queryFn: () => fetchUserTweets(user?._id),
    enabled: !!user?._id,
  });

  const createTweetMutation = useMutation({
    mutationFn: createTweet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userTweets", user?._id] });
      setTweetContent("");
      setAiTweetOptions(null); // Clear suggestions after posting
    },
  });

  const updateTweetMutation = useMutation({
    mutationFn: updateTweet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userTweets", user?._id] });
      setEditingTweetId(null);
      setEditContent("");
    },
  });

  const deleteTweetMutation = useMutation({
    mutationFn: deleteTweet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userTweets", user?._id] });
    },
  });

  const likeMutation = useMutation({
    mutationFn: toggleTweetLike,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userTweets", user?._id] });
    },
  });

  // --- AI Prompt Engine Pipeline ---
  const handleAiRefineText = async () => {
    if (!tweetContent.trim()) {
      alert(
        "Type a rough thought or sentence into the composer first so the AI can fix it!",
      );
      return;
    }
    setIsAiLoading(true);
    setAiTweetOptions(null);
    try {
      const { data } = await apiClient.post("/ai/refine-tweet", {
        rawDraft: tweetContent,
      });
      if (data.success) {
        setAiTweetOptions(data.data);
      }
    } catch (err) {
      alert("Failed to communicate with text optimization matrix array.");
    } finally {
      setIsAiLoading(false);
    }
  };

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

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl text-center text-slate-400 bg-slate-950 min-h-screen">
        <h1 className="text-2xl font-bold text-white mb-2">My Node Stream</h1>
        <p className="text-sm">
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
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 md:py-10">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-2xl md:text-3xl font-black mb-6 tracking-tight">
          My Profile Tweets
        </h1>

        {/* Create Tweet Composer with Integrated AI Controls */}
        <div className="bg-slate-900 border border-slate-850 p-4 rounded-2xl mb-6 shadow-xl space-y-4">
          <form onSubmit={handleTweetSubmit} className="flex space-x-3.5">
            <img
              src={user?.avatar}
              alt=""
              className="w-10 h-10 rounded-full object-cover shrink-0 hidden sm:block ring-1 ring-slate-800"
            />
            <div className="grow">
              <textarea
                value={tweetContent}
                onChange={e => setTweetContent(e.target.value)}
                placeholder="What's happening? Type a rough thought..."
                className="w-full bg-slate-800 text-slate-100 p-3 rounded-xl border border-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none transition"
                rows="3"
              ></textarea>

              <div className="flex justify-between items-center mt-2.5">
                <div className="flex items-center gap-2">
                  <img
                    src={user?.avatar}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover sm:hidden ring-1 ring-slate-800"
                  />

                  {/* ✨ AI Magic Button */}
                  <button
                    type="button"
                    onClick={handleAiRefineText}
                    disabled={isAiLoading || !tweetContent.trim()}
                    className="px-3.5 py-1.5 bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-500/20 text-xs font-bold rounded-xl transition flex items-center gap-1 disabled:opacity-40"
                  >
                    {isAiLoading ? "Processing..." : "✨ AI Fix"}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={
                    createTweetMutation.isPending || !tweetContent.trim()
                  }
                  className="px-5 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition shadow-md disabled:bg-slate-800 disabled:text-slate-500"
                >
                  {createTweetMutation.isPending ? "Sharing..." : "Tweet Node"}
                </button>
              </div>
            </div>
          </form>

          {/* AI Refiner Options Dropdown Container Layout */}
          {isAiLoading && (
            <div className="pt-3 border-t border-slate-850 flex items-center justify-center space-x-2 py-4">
              <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-slate-500 font-medium animate-pulse">
                Running semantic rewrite vectors...
              </p>
            </div>
          )}

          {!isAiLoading && aiTweetOptions && (
            <div className="pt-4 border-t border-slate-850 space-y-3 animate-fadeIn">
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                <span>⚡</span> Gemini Smart Rewrite Suggestions
              </p>

              <div className="grid grid-cols-1 gap-2.5">
                {[
                  { type: "🔥 Viral", text: aiTweetOptions.viral },
                  {
                    type: "💼 Professional",
                    text: aiTweetOptions.professional,
                  },
                  { type: "🎭 Funny / Witty", text: aiTweetOptions.funny },
                ].map((option, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-850 border border-slate-800 p-3 rounded-xl flex flex-col justify-between items-start gap-2 hover:border-slate-750 transition group"
                  >
                    <div className="w-full">
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">
                        {option.type}
                      </span>
                      <p className="text-xs text-slate-200 mt-1 leading-relaxed italic">
                        "{option.text}"
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTweetContent(option.text)}
                      className="text-[10px] font-bold text-indigo-400 hover:text-white bg-indigo-500/5 hover:bg-indigo-600 px-2.5 py-1 rounded-md border border-indigo-500/10 hover:border-transparent transition self-end"
                    >
                      📥 Inject to Composer
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tweet List Logs */}
        {isLoading ? (
          <p className="text-xs text-slate-500">
            Processing collection records...
          </p>
        ) : (
          <div className="space-y-4">
            {tweets?.map(tweet => {
              const isEditing = editingTweetId === tweet._id;

              return (
                <div
                  key={tweet._id}
                  className="bg-slate-900 border border-slate-850 p-4 rounded-2xl flex items-start space-x-3.5"
                >
                  <img
                    src={tweet.owner?.avatar}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-slate-800"
                  />
                  <div className="grow min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                      <div className="flex items-baseline space-x-2 flex-wrap text-xs">
                        <span className="font-bold text-slate-200 truncate">
                          {tweet.owner?.fullname}
                        </span>
                        <span className="text-slate-500 truncate">
                          @{tweet.owner?.username}
                        </span>
                        <span className="text-slate-600">·</span>
                        <span className="text-slate-500 shrink-0">
                          {formatTimeAgo(tweet.createdAt)}
                        </span>
                      </div>

                      {!isEditing && (
                        <div className="flex items-center space-x-1 shrink-0 ml-auto sm:ml-0 bg-slate-850/60 rounded-md p-0.5 border border-slate-800/40">
                          <button
                            onClick={() => handleEditStart(tweet)}
                            className="text-[11px] text-indigo-400 font-semibold px-2 py-0.5 rounded hover:bg-slate-800 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(tweet._id)}
                            disabled={deleteTweetMutation.isPending}
                            className="text-[11px] text-rose-400 font-semibold px-2 py-0.5 rounded hover:bg-slate-800 transition"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="mt-2 bg-slate-850/40 p-2 rounded-xl border border-slate-800">
                        <textarea
                          value={editContent}
                          onChange={e => setEditContent(e.target.value)}
                          className="w-full bg-slate-800 text-slate-100 p-2 rounded-lg border border-slate-700 text-sm resize-none"
                          rows="2"
                        />
                        <div className="flex space-x-2 mt-2 justify-end">
                          <button
                            onClick={() => setEditingTweetId(null)}
                            className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-md transition"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleEditSubmit(tweet._id)}
                            disabled={updateTweetMutation.isPending}
                            className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded-md transition"
                          >
                            {updateTweetMutation.isPending
                              ? "Saving..."
                              : "Save"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-300 text-sm mt-1.5 break-words whitespace-pre-wrap leading-relaxed pr-1">
                        {tweet.content}
                      </p>
                    )}

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
                            : "bg-slate-800 text-slate-400 hover:bg-slate-750"
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
              <p className="text-center text-xs text-slate-500 py-12">
                No active broadcast logs found on this user node context.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TweetsPage;
