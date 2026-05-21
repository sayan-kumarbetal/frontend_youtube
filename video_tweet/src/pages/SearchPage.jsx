import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../api/axios";
import VideoCard from "../components/VideoCard";
import { formatTimeAgo } from "../utils/time";

// --- API Functions ---
const searchVideos = async query => {
  const { data } = await apiClient.get(
    `/videos?query=${encodeURIComponent(query)}`,
  );
  return data.data.docs;
};

const searchTweets = async query => {
  const { data } = await apiClient.get(
    `/tweets?query=${encodeURIComponent(query)}`,
  );
  return data.data.tweets;
};

function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const { data: videos, isLoading: isLoadingVideos } = useQuery({
    queryKey: ["searchVideos", query],
    queryFn: () => searchVideos(query),
    enabled: !!query,
  });

  const { data: tweets, isLoading: isLoadingTweets } = useQuery({
    queryKey: ["searchTweets", query],
    queryFn: () => searchTweets(query),
    enabled: !!query,
  });

  if (!query) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-400 text-lg">
          Enter a search term to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-8">
        Search results for: <span className="text-indigo-400">"{query}"</span>
      </h1>

      {/* Videos Section */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-white mb-4">Videos</h2>
        {isLoadingVideos ? (
          <p className="text-gray-400">Searching videos...</p>
        ) : videos?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8">
            {videos.map(video => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No videos found for "{query}"</p>
        )}
      </div>

      {/* Tweets Section */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Tweets</h2>
        {isLoadingTweets ? (
          <p className="text-gray-400">Searching tweets...</p>
        ) : tweets?.length > 0 ? (
          <div className="space-y-4 max-w-2xl">
            {tweets.map(tweet => (
              <div
                key={tweet._id}
                className="bg-gray-800 p-4 rounded-lg flex items-start space-x-4"
              >
                <img
                  src={tweet.owner.avatar}
                  alt={tweet.owner.username}
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                />
                <div className="min-w-0">
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
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No tweets found for "{query}"</p>
        )}
      </div>
    </div>
  );
}

export default SearchPage;
