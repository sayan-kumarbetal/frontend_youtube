import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/axios";

const fetchVideoById = async videoId => {
  const { data } = await apiClient.get(`/videos/${videoId}`);
  return data.data;
};

const updateVideoDetails = async ({ videoId, formData }) => {
  const { data } = await apiClient.patch(`/videos/${videoId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
};

function EditVideo() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    thumbnail: null,
  });
  const [error, setError] = useState("");

  const { data: video, isLoading } = useQuery({
    queryKey: ["video", videoId],
    queryFn: () => fetchVideoById(videoId),
    enabled: !!videoId,
  });

  useEffect(() => {
    if (video) {
      setFormData({
        title: video.title,
        description: video.description,
        thumbnail: null,
      });
    }
  }, [video]);

  const updateMutation = useMutation({
    mutationFn: updateVideoDetails,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboardVideos"] });
      queryClient.invalidateQueries({ queryKey: ["video", videoId] });
      navigate("/dashboard");
    },
    onError: err => {
      setError(
        err.response?.data?.message || "Metadata updates generation rejected.",
      );
    },
  });

  const handleChange = e => {
    const { name, value, files } = e.target;
    setFormData({ ...formData, [name]: files ? files[0] : value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    setError("");

    const submissionData = new FormData();
    submissionData.append("title", formData.title);
    submissionData.append("description", formData.description);
    if (formData.thumbnail) {
      submissionData.append("thumbnail", formData.thumbnail);
    }

    updateMutation.mutate({ videoId, formData: submissionData });
  };

  if (isLoading)
    return (
      <div className="text-center py-20 text-slate-400 text-sm bg-slate-950 min-h-screen">
        Acquiring current stream descriptors...
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 md:py-10 flex justify-center items-start px-4">
      <div className="w-full max-w-2xl p-5 md:p-8 space-y-6 bg-slate-900 border border-slate-850 rounded-2xl shadow-2xl">
        <h2 className="text-xl md:text-2xl font-black text-center tracking-tight text-white">
          Reconfigure Media Attributes
        </h2>

        {error && (
          <p className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-center text-xs font-semibold">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              Title Parameter
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2 mt-1.5 text-slate-200 bg-slate-800 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              Content Summary Field
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              className="w-full px-3.5 py-2 mt-1.5 text-slate-200 bg-slate-800 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition resize-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-850 items-end">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Active Poster Image
              </label>
              <div className="w-full aspect-video rounded-xl overflow-hidden bg-slate-800 mt-2 border border-slate-750">
                <img
                  src={video?.thumbnail}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Overwrite Target Thumbnail
              </label>
              <input
                type="file"
                name="thumbnail"
                onChange={handleChange}
                accept="image/*"
                className="w-full text-xs text-slate-400 mt-1.5 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-750 cursor-pointer"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="w-full px-4 py-2.5 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm transition shadow-md disabled:bg-slate-800 disabled:text-slate-500"
          >
            {updateMutation.isPending
              ? "Committing Updates..."
              : "Save Configuration Parameters"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditVideo;
