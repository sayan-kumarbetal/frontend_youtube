import React from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../api/axios";
import VideoCard from "../components/VideoCard";
import { formatTimeAgo } from "../utils/time";

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
      <div className="container mx-auto px-4 py-20 text-center text-slate-500 text-sm bg-slate-950 min-h-screen">
        Submit a search parameter string inside the header navigation interface.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 md:py-10">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="text-xl md:text-2xl font-black mb-8 tracking-tight">
          Query Results Matrix for:{" "}
          <span className="text-indigo-400 font-extrabold">"{query}"</span>
        </h1>

        {/* Media Module Results */}
        <div className="mb-12">
          <h2 className="text-base font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            📹 Target Video Logs
          </h2>
          {isLoadingVideos ? (
            <p className="text-xs text-slate-500">
              Querying media records logs...
            </p>
          ) : videos?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-7">
              {videos.map(video => (
                <VideoCard key={video._id} video={video} />
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-4">
              No structural match returned for video nodes mapping criteria.
            </p>
          )}
        </div>

        {/* Micro-Tweet Logs Match */}
        <div>
          <h2 className="text-base font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            💬 Microbroadcast Message Matches
          </h2>
          {isLoadingTweets ? (
            <p className="text-xs text-slate-500">
              Scanning server text packets...
            </p>
          ) : tweets?.length > 0 ? (
            <div className="space-y-4 max-w-2xl">
              {tweets.map(tweet => (
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
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-500 shrink-0">
                        {formatTimeAgo(tweet.createdAt)}
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm mt-1.5 break-words whitespace-pre-wrap leading-relaxed pr-1">
                      {tweet.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-4">
              No text entries matched the provided string signature index.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchPage;
