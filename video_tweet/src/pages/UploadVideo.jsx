import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/axios";

function UploadVideo() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoFile: null,
    thumbnail: null,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value, files } = e.target;
    setFormData({ ...formData, [name]: files ? files[0] : value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (
      !formData.title ||
      !formData.description ||
      !formData.videoFile ||
      !formData.thumbnail
    ) {
      setError("All fields are required.");
      return;
    }
    setError("");
    setLoading(true);
    setProgress(0);

    const submissionData = new FormData();
    submissionData.append("title", formData.title);
    submissionData.append("description", formData.description);
    submissionData.append("videoFile", formData.videoFile);
    submissionData.append("thumbnail", formData.thumbnail);

    try {
      const response = await apiClient.post("/videos", submissionData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: progressEvent => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          setProgress(percent);
        },
      });

      if (response.data && response.data.success) {
        navigate(`/video/${response.data.data._id}`);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Binary allocation upload process failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 md:py-10 flex justify-center items-start px-4">
      <div className="w-full max-w-2xl p-5 md:p-8 space-y-6 bg-slate-900 border border-slate-850 rounded-2xl shadow-2xl">
        <h2 className="text-xl md:text-2xl font-black text-center tracking-tight text-white">
          Publish New Content Node
        </h2>

        {error && (
          <p className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-center text-xs font-semibold">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              Asset Title Meta
            </label>
            <input
              type="text"
              name="title"
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2 mt-1.5 text-slate-200 bg-slate-800 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              Detailed Block Description
            </label>
            <textarea
              name="description"
              onChange={handleChange}
              required
              rows="4"
              className="w-full px-3.5 py-2 mt-1.5 text-slate-200 bg-slate-800 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition resize-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-850">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Source Video File
              </label>
              <input
                type="file"
                name="videoFile"
                onChange={handleChange}
                required
                accept="video/*"
                className="w-full text-xs text-slate-400 mt-1.5 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-750 cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Thumbnail Frame
              </label>
              <input
                type="file"
                name="thumbnail"
                onChange={handleChange}
                required
                accept="image/*"
                className="w-full text-xs text-slate-400 mt-1.5 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-750 cursor-pointer"
              />
            </div>
          </div>

          {loading && (
            <div className="space-y-1.5 pt-2">
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/50">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-slate-400 text-xs text-center font-medium">
                {progress < 100
                  ? `Syncing Stream Buffers... ${progress}%`
                  : "Processing file headers on target cluster..."}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2.5 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm transition shadow-md disabled:bg-slate-800 disabled:text-slate-500"
          >
            {loading
              ? `Uploading Data... ${progress}%`
              : "Deploy Media Resource"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UploadVideo;
