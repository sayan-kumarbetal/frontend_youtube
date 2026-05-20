import React from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import apiClient from "../api/axios";
import VideoCard from "../components/VideoCard";

// --- API Functions ---
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

// --- Component ---
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
      queryClient.refetchQueries(["channel", username]);
    },
  });

  if (isLoadingChannel) {
    return <div className="text-center p-8">Loading channel...</div>;
  }

  if (!channel) {
    return <div className="text-center p-8">Channel not found.</div>;
  }

  // ✅ Check if logged in user is the channel owner
  const isOwner =
    loggedInUser?._id === channel?._id ||
    loggedInUser?.username === channel?.username;

  return (
    <div className="text-white">
      {/* Cover Image */}
      <div className="w-full h-48 md:h-64 bg-gray-700">
        {channel.coverImage && (
          <img
            src={channel.coverImage}
            alt={`${channel.username}'s cover`}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Channel Header */}
        <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 md:-mt-20">
          <img
            src={channel.avatar}
            alt={channel.username}
            className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-gray-900 bg-gray-800"
          />
          <div className="md:ml-6 mt-4 md:mt-0 text-center md:text-left">
            <h1 className="text-3xl font-bold">{channel.fullname}</h1>
            <p className="text-gray-400">@{channel.username}</p>
            <div className="flex space-x-4 mt-2 text-gray-400">
              {/* ✅ Fixed field names to match backend */}
              <span>{channel.subscribersCount} Subscribers</span>

              {/* ✅ Only show "Subscribed" count to channel owner */}
              {isOwner && (
                <>
                  <span>·</span>
                  <span>{channel.channelSubscribedToCount} Subscribed</span>
                </>
              )}
            </div>
          </div>

          {/* ✅ Subscribe button — only show to logged in non-owners */}
          {isAuthenticated && !isOwner && (
            <div className="md:ml-auto mt-4 md:mt-0">
              <button
                onClick={() => handleSubscribe()}
                disabled={isPending}
                className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                  channel.isSubscribed
                    ? "bg-gray-600 hover:bg-gray-500 text-white"
                    : "bg-red-600 hover:bg-red-700 text-white"
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

        <hr className="border-gray-700 my-8" />

        {/* Videos Section */}
        <h2 className="text-2xl font-bold mb-4">Videos</h2>
        {isLoadingVideos ? (
          <p>Loading videos...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8">
            {videos?.map(video => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )}
        {videos?.length === 0 && !isLoadingVideos && (
          <p className="text-gray-400">
            This channel has no public videos yet.
          </p>
        )}
      </div>
    </div>
  );
}

export default ChannelPage;
