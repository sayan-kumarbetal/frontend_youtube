// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import apiClient from "../api/axios";

// function UploadVideo() {
//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     videoFile: null,
//     thumbnail: null,
//   });
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const navigate = useNavigate();

//   const handleChange = e => {
//     const { name, value, files } = e.target;
//     setFormData({ ...formData, [name]: files ? files[0] : value });
//   };

//   const handleSubmit = async e => {
//     e.preventDefault();
//     if (
//       !formData.title ||
//       !formData.description ||
//       !formData.videoFile ||
//       !formData.thumbnail
//     ) {
//       setError("All fields are required.");
//       return;
//     }
//     setError("");
//     setLoading(true);
//     setProgress(0);

//     const submissionData = new FormData();
//     submissionData.append("title", formData.title);
//     submissionData.append("description", formData.description);
//     submissionData.append("videoFile", formData.videoFile);
//     submissionData.append("thumbnail", formData.thumbnail);

//     try {
//       const response = await apiClient.post("/videos", submissionData, {
//         headers: { "Content-Type": "multipart/form-data" },
//         onUploadProgress: progressEvent => {
//           const percent = Math.round(
//             (progressEvent.loaded * 100) / progressEvent.total,
//           );
//           setProgress(percent);
//         },
//       });

//       if (response.data && response.data.success) {
//         navigate(`/video/${response.data.data._id}`);
//       }
//     } catch (err) {
//       setError(
//         err.response?.data?.message ||
//           "Binary allocation upload process failed.",
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-slate-950 text-slate-100 py-6 md:py-10 flex justify-center items-start px-4">
//       <div className="w-full max-w-2xl p-5 md:p-8 space-y-6 bg-slate-900 border border-slate-850 rounded-2xl shadow-2xl">
//         <h2 className="text-xl md:text-2xl font-black text-center tracking-tight text-white">
//           Publish New Content Node
//         </h2>

//         {error && (
//           <p className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-center text-xs font-semibold">
//             {error}
//           </p>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-5">
//           <div>
//             <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
//               Asset Title Meta
//             </label>
//             <input
//               type="text"
//               name="title"
//               onChange={handleChange}
//               required
//               className="w-full px-3.5 py-2 mt-1.5 text-slate-200 bg-slate-800 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition"
//             />
//           </div>
//           <div>
//             <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
//               Detailed Block Description
//             </label>
//             <textarea
//               name="description"
//               onChange={handleChange}
//               required
//               rows="4"
//               className="w-full px-3.5 py-2 mt-1.5 text-slate-200 bg-slate-800 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition resize-none"
//             ></textarea>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-850">
//             <div>
//               <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
//                 Source Video File
//               </label>
//               <input
//                 type="file"
//                 name="videoFile"
//                 onChange={handleChange}
//                 required
//                 accept="video/*"
//                 className="w-full text-xs text-slate-400 mt-1.5 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-750 cursor-pointer"
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
//                 Thumbnail Frame
//               </label>
//               <input
//                 type="file"
//                 name="thumbnail"
//                 onChange={handleChange}
//                 required
//                 accept="image/*"
//                 className="w-full text-xs text-slate-400 mt-1.5 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-750 cursor-pointer"
//               />
//             </div>
//           </div>

//           {loading && (
//             <div className="space-y-1.5 pt-2">
//               <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/50">
//                 <div
//                   className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-300"
//                   style={{ width: `${progress}%` }}
//                 />
//               </div>
//               <p className="text-slate-400 text-xs text-center font-medium">
//                 {progress < 100
//                   ? `Syncing Stream Buffers... ${progress}%`
//                   : "Processing file headers on target cluster..."}
//               </p>
//             </div>
//           )}

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full px-4 py-2.5 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm transition shadow-md disabled:bg-slate-800 disabled:text-slate-500"
//           >
//             {loading
//               ? `Uploading Data... ${progress}%`
//               : "Deploy Media Resource"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default UploadVideo;
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

  // --- AI Co-Pilot State Hub ---
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value, files } = e.target;
    setFormData({ ...formData, [name]: files ? files[0] : value });
  };

  // Triggers the background AI metadata analyzer pipeline
  const handleAnalyzeMetadata = async () => {
    if (!formData.title.trim()) {
      alert(
        "Please provide an initial title concept first so the AI can analyze it!",
      );
      return;
    }
    setIsAiLoading(true);
    setAiSuggestions([]);
    try {
      const { data } = await apiClient.post("/ai/suggest-metadata", {
        currentTitle: formData.title,
        currentDescription: formData.description,
      });
      if (data.success) {
        setAiSuggestions(data.data);
      }
    } catch (err) {
      alert("Could not connect to the metadata optimization matrix array.");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Injects the AI's suggestions directly into the active form state vectors
  const handleApplySuggestion = (selectedTitle, selectedDesc) => {
    setFormData(prev => ({
      ...prev,
      title: selectedTitle,
      description: selectedDesc,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (
      !formData.title ||
      !formData.description ||
      !formData.videoFile ||
      !formData.thumbnail
    ) {
      setError("All form deployment parameters require configuration inputs.");
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
          "Binary track stream allocation upload failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 md:py-10">
      <div className="container mx-auto px-4 max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Left/Center Section: Main Upload Form Block */}
        <div className="lg:col-span-2">
          <div className="p-5 md:p-8 bg-slate-900 border border-slate-850 rounded-2xl shadow-2xl space-y-6">
            <div>
              <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
                Publish New Content Node
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Configure your media file parameters and deploy across the cloud
                index.
              </p>
            </div>

            {error && (
              <p className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-center text-xs font-semibold">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Write Your Title
                </label>
                <div className="flex gap-2 mt-1.5">
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Enter an initial title or raw idea..."
                    className="w-full px-3.5 py-2 text-slate-200 bg-slate-800 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition"
                  />
                  <button
                    type="button"
                    onClick={handleAnalyzeMetadata}
                    disabled={isAiLoading || !formData.title.trim()}
                    className="px-4 py-2 text-xs font-bold bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-600 hover:text-white rounded-xl transition shrink-0 disabled:opacity-40"
                  >
                    {isAiLoading ? "Analyzing..." : "✨ Optimize"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Detailed Block Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="5"
                  placeholder="Describe what your media file covers..."
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
                className="w-full px-4 py-2.5 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl text-sm transition shadow-md disabled:bg-slate-800 disabled:text-slate-500"
              >
                {loading
                  ? `Uploading Data... ${progress}%`
                  : "Deploy Media Resource"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Section: Sidebar AI Copilot Proposals Panel */}
        <div className="lg:col-span-1">
          <div className="p-4 md:p-5 bg-slate-900 border border-slate-850 rounded-2xl shadow-xl space-y-4 h-fit sticky top-24">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-850">
              <span className="text-base">✨</span>
              <div>
                <h3 className="text-sm font-black text-slate-100 tracking-tight">
                  AI Metadata Co-Pilot
                </h3>
                <p className="text-[10px] text-slate-500 font-medium">
                  Generate viral click optimization splits.
                </p>
              </div>
            </div>

            {isAiLoading && (
              <div className="py-12 flex flex-col justify-center items-center text-center space-y-3">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-slate-500 font-medium animate-pulse">
                  Running semantic search vectors...
                </p>
              </div>
            )}

            {!isAiLoading && aiSuggestions.length === 0 && (
              <div className="py-10 text-center text-xs text-slate-500 leading-relaxed px-2">
                Type an initial baseline name concept in the form, then click{" "}
                <strong className="text-indigo-400">Optimize</strong> to render
                high-performing variants here.
              </div>
            )}

            {!isAiLoading &&
              aiSuggestions.map((s, idx) => (
                <div
                  key={idx}
                  className="bg-slate-850/60 border border-slate-800 p-3.5 rounded-xl space-y-2.5 hover:border-slate-700 transition relative group"
                >
                  <span className="absolute top-2 right-2.5 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                    Option {idx + 1}
                  </span>

                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Catchy Title:
                    </h4>
                    <p className="text-xs font-semibold text-slate-100 mt-0.5 leading-snug">
                      "{s.title}"
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      SEO Description Variant:
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-3 mt-0.5 leading-relaxed">
                      {s.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleApplySuggestion(s.title, s.description)
                    }
                    className="w-full py-1.5 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white text-[11px] font-bold rounded-lg border border-slate-750 hover:border-transparent transition flex items-center justify-center gap-1"
                  >
                    📥 Use This Setup
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadVideo;
