import React from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import apiClient from "../api/axios";
import VideoCard from "../components/VideoCard";

const fetchChannelProfile = async username => {
  const { data } = await apiClient.get(`/users/channel/${username}`);
  return data.data;
};

const fetchChannelVideos = async userId => {
  if (!userId) return [];
  const { data } = await apiClient.get(`/videos?userId=${userId}`);
  return data.data.docs;
};

const toggleSubscription = async channelId => {
  const { data } = await apiClient.post(`/subscriptions/c/${channelId}`);
  return data;
};

function ChannelPage() {
  const { username } = useParams();
  const queryClient = useQueryClient();
  const { isAuthenticated, user: loggedInUser } = useSelector(
    state => state.auth,
  );

  const { data: channel, isLoading: isLoadingChannel } = useQuery({
    queryKey: ["channel", username],
    queryFn: () => fetchChannelProfile(username),
    enabled: !!username,
  });

  const { data: videos, isLoading: isLoadingVideos } = useQuery({
    queryKey: ["channelVideos", channel?._id],
    queryFn: () => fetchChannelVideos(channel?._id),
    enabled: !!channel,
  });

  const { mutate: handleSubscribe, isPending } = useMutation({
    mutationFn: () => toggleSubscription(channel?._id),
    onSuccess: () => {
      queryClient.invalidateQueries(["channel", username]);
    },
  });

  if (isLoadingChannel)
    return (
      <div className="text-center py-20 text-slate-400 text-sm bg-slate-950 min-h-screen">
        Loading studio profile...
      </div>
    );
  if (!channel)
    return (
      <div className="text-center py-20 text-slate-400 text-sm bg-slate-950 min-h-screen">
        Channel node context could not be located.
      </div>
    );

  const isOwner =
    loggedInUser?._id === channel?._id ||
    loggedInUser?.username === channel?.username;

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 pb-12">
      {/* Dynamic Cover Image Banner */}
      <div className="w-full h-36 md:h-56 bg-slate-900 border-b border-slate-850">
        {channel.coverImage && (
          <img
            src={channel.coverImage}
            alt=""
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="container mx-auto px-4 max-w-7xl">
        {/* Profile Card Header Block */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-12 md:-mt-16 text-center sm:text-left gap-4 sm:gap-6">
          <img
            src={channel.avatar}
            alt=""
            className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover border-4 border-slate-950 bg-slate-900 shadow-xl"
          />
          <div className="grow min-w-0 sm:mb-2">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              {channel.fullname}
            </h1>
            <p className="text-sm text-slate-400">@{channel.username}</p>
            <div className="flex items-center justify-center sm:justify-start gap-3 text-xs font-medium text-slate-500 mt-2 flex-wrap">
              <span>{channel.subscribersCount} Subscribers</span>
              {isOwner && (
                <>
                  <span className="text-slate-800">·</span>
                  <span>
                    {channel.channelSubscribedToCount} Subscribed channels
                  </span>
                </>
              )}
            </div>
          </div>

          {isAuthenticated && !isOwner && (
            <div className="sm:mb-2 w-full sm:w-auto">
              <button
                onClick={() => handleSubscribe()}
                disabled={isPending}
                className={`w-full sm:w-auto px-6 py-2 rounded-xl text-xs font-bold transition shadow-md ${
                  channel.isSubscribed
                    ? "bg-slate-900 text-slate-400 border border-slate-800"
                    : "bg-rose-600 hover:bg-rose-700 text-white"
                }`}
              >
                {isPending
                  ? "..."
                  : channel.isSubscribed
                    ? "Subscribed"
                    : "Subscribe"}
              </button>
            </div>
          )}
        </div>

        <div className="border-t border-slate-900 my-8"></div>

        {/* Catalog Layout Section */}
        <h2 className="text-lg font-black mb-6 tracking-tight flex items-center gap-2">
          📹 Published Nodes
        </h2>
        {isLoadingVideos ? (
          <p className="text-xs text-slate-500">
            Syncing local library docs...
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-7">
            {videos?.map(video => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )}
        {videos?.length === 0 && !isLoadingVideos && (
          <p className="text-slate-500 text-xs text-center py-12 bg-slate-900 rounded-2xl border border-slate-850">
            This workspace channel has no listed video logs available.
          </p>
        )}
      </div>
    </div>
  );
}

export default ChannelPage;
