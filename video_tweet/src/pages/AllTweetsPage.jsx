import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import apiClient from "../api/axios";
import { formatTimeAgo } from "../utils/time";

const fetchAllTweets = async () => {
  const { data } = await apiClient.get("/tweets");
  return data.data.tweets;
};

const toggleTweetLike = async tweetId => {
  const { data } = await apiClient.post(`/likes/toggle/t/${tweetId}`);
  return data.data;
};

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
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 md:py-10">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-2xl font-black mb-6 tracking-tight">
          Global Node Stream Feed
        </h1>

        {isLoading ? (
          <p className="text-xs text-slate-500">
            Parsing global database index arrays...
          </p>
        ) : (
          <div className="space-y-4">
            {tweets?.map(tweet => {
              const isOwner = user?._id === tweet.owner?._id;

              return (
                <div
                  key={tweet._id}
                  className="bg-slate-900 border border-slate-850 p-4 rounded-2xl flex items-start space-x-3.5 shadow-md"
                >
                  <img
                    src={tweet.owner?.avatar}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-slate-800"
                  />
                  <div className="grow min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline space-x-2 flex-wrap text-xs">
                        <p className="font-bold text-slate-200 truncate">
                          {tweet.owner?.fullname}
                        </p>
                        <p className="text-slate-500 truncate">
                          @{tweet.owner?.username}
                        </p>
                        <p className="text-slate-600">·</p>
                        <p className="text-slate-500 shrink-0">
                          {formatTimeAgo(tweet.createdAt)}
                        </p>
                      </div>

                      {isOwner && (
                        <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full shrink-0 ml-2 border border-indigo-500/20">
                          Owner
                        </span>
                      )}
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
                No active message threads posted within this domain cluster.
              </p>
            )}

            {!isAuthenticated && (
              <p className="text-center text-slate-500 text-xs mt-6 bg-slate-900/50 p-3 rounded-xl border border-slate-900">
                Please{" "}
                <a
                  href="/login"
                  className="text-indigo-400 font-bold hover:underline"
                >
                  authorize credentials log
                </a>{" "}
                to issue likes metrics.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AllTweetsPage;
