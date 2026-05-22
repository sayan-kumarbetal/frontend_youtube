import React from "react";
import { Link } from "react-router-dom";
import { formatTimeAgo } from "../utils/time";

function VideoCard({ video }) {
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

  const formatDuration = seconds => {
    if (!seconds || isNaN(seconds)) return "00:00";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const paddedMins = String(mins).padStart(2, "0");
    const paddedSecs = String(secs).padStart(2, "0");

    if (hrs > 0) return `${hrs}:${paddedMins}:${paddedSecs}`;
    return `${mins}:${paddedSecs}`;
  };

  if (!video || !video.owner) return null;

  return (
    <div className="w-full group flex flex-col">
      {/* Thumbnail Container */}
      <Link
        to={`/video/${video._id}`}
        className="w-full block overflow-hidden rounded-2xl bg-slate-900 border border-slate-800/60 aspect-video relative"
      >
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <span className="absolute bottom-2 right-2 bg-slate-950/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-800/40">
          {formatDuration(video.duration)}
        </span>
      </Link>

      {/* Meta Content Details Block */}
      <div className="flex items-start mt-3 px-0.5">
        <Link to={`/channel/${video.owner.username}`} className="shrink-0">
          <img
            src={video.owner.avatar}
            alt=""
            className="w-9 h-9 rounded-full object-cover border border-slate-800 ring-2 ring-transparent group-hover:ring-indigo-500/20 transition"
          />
        </Link>

        <div className="ml-3 grow min-w-0">
          <Link to={`/video/${video._id}`}>
            <h3 className="text-sm font-semibold text-slate-100 line-clamp-2 leading-tight group-hover:text-indigo-400 transition duration-150 pr-2">
              {video.title}
            </h3>
          </Link>

          <Link to={`/channel/${video.owner.username}`}>
            <p className="text-xs text-slate-400 mt-1 hover:text-slate-200 truncate transition">
              {video.owner.fullName || video.owner.username}
            </p>
          </Link>

          <div className="text-[11px] text-slate-500 font-medium flex items-center mt-0.5 whitespace-nowrap">
            <span>{formatViews(video.views)} views</span>
            <span className="mx-1.5 text-slate-700">·</span>
            <span>{formatTimeAgo(video.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoCard;
