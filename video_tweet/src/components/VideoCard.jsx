import React from "react";
import { Link } from "react-router-dom";
import { formatTimeAgo } from "../utils/time";

function VideoCard({ video }) {
  // Enhanced formatting: handles flat numbers cleanly (e.g., 10K instead of 10.0K)
  const formatViews = views => {
    if (!views) return "0";
    if (views >= 1_000_000) {
      const formatted = (views / 1_000_000).toFixed(1);
      return formatted.endsWith(".0")
        ? `${Math.floor(views / 1_000_000)}M`
        : `${formatted}M`;
    }
    if (views >= 1_000) {
      const formatted = (views / 1_000).toFixed(1);
      return formatted.endsWith(".0")
        ? `${Math.floor(views / 1_000)}K`
        : `${formatted}K`;
    }
    return views;
  };

  // Robust formatting for video duration (Supports HH:MM:SS)
  const formatDuration = seconds => {
    if (!seconds || isNaN(seconds)) return "00:00";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const paddedMins = String(mins).padStart(2, "0");
    const paddedSecs = String(secs).padStart(2, "0");

    if (hrs > 0) {
      return `${hrs}:${paddedMins}:${paddedSecs}`;
    }
    return `${mins}:${paddedSecs}`; // e.g. "4:05" instead of "04:05" if you prefer, or pad it
  };

  // Prevent errors if video or owner data is missing
  if (!video || !video.owner) {
    return null;
  }

  return (
    <div className="w-full group">
      {/* Link for Thumbnail */}
      <Link to={`/video/${video._id}`}>
        <div className="relative mb-2 w-full pt-[56.25%] bg-gray-900 rounded-xl overflow-hidden">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="absolute top-0 left-0 w-full h-full object-cover transition duration-200 group-hover:scale-[1.02]"
            loading="lazy"
          />
          <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium px-2 py-0.5 rounded">
            {formatDuration(video.duration)}
          </span>
        </div>
      </Link>

      <div className="flex items-start px-1">
        {/* Link for Avatar */}
        <Link to={`/channel/${video.owner.username}`} className="shrink-0 mt-1">
          <img
            src={video.owner.avatar}
            alt={video.owner.username}
            className="w-9 h-9 rounded-full object-cover border border-gray-700"
          />
        </Link>

        <div className="ml-3 grow">
          {/* Link for Title */}
          <Link to={`/video/${video._id}`}>
            <h3 className="text-sm font-semibold text-white line-clamp-2 leading-tight hover:text-gray-300">
              {video.title}
            </h3>
          </Link>

          {/* Link for Channel Name */}
          <Link to={`/channel/${video.owner.username}`}>
            <p className="text-xs text-gray-400 mt-1.5 hover:text-white transition-colors duration-155">
              {video.owner.fullName || video.owner.username}
            </p>
          </Link>

          {/* Meta Information */}
          <div className="text-xs text-gray-400 flex items-center mt-0.5">
            <span>{formatViews(video.views)} views</span>
            <span className="mx-1.5">·</span>
            <span>{formatTimeAgo(video.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoCard;
