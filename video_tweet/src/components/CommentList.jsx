import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import apiClient from "../api/axios";
import { formatTimeAgo } from "../utils/time";

const fetchComments = async videoId => {
  const { data } = await apiClient.get(`/comments/${videoId}`);
  return data.data.docs;
};

const addComment = async ({ videoId, content }) => {
  const { data } = await apiClient.post(`/comments/${videoId}`, { content });
  return data.data;
};

function CommentList({ videoId }) {
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const [newComment, setNewComment] = useState("");
  const [likedMap, setLikedMap] = useState({});

  // Query to fetch comments
  const { data: comments, isLoading } = useQuery({
    queryKey: ["comments", videoId],
    queryFn: () => fetchComments(videoId),
    enabled: !!videoId,
  });

  // Mutation to add a new comment
  const addCommentMutation = useMutation({
    mutationFn: addComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", videoId] });
      setNewComment("");
    },
  });

  const handleCommentSubmit = e => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addCommentMutation.mutate({ videoId, content: newComment });
  };

  // Mutation to toggle comment like
  const toggleCommentLikeMutation = useMutation({
    mutationFn: async commentId => {
      const { data } = await apiClient.post(`/likes/toggle/c/${commentId}`);
      return data.data;
    },
    onSuccess: (data, commentId) => {
      setLikedMap(prev => ({ ...prev, [commentId]: data.isLiked }));
      queryClient.invalidateQueries({ queryKey: ["comments", videoId] });
    },
  });

  return (
    <div className="mt-8 bg-slate-900 rounded-xl p-4 md:p-6 border border-slate-850">
      <h3 className="text-lg font-bold text-slate-100 mb-6">
        {comments?.length || 0} Comments
      </h3>

      {/* Add Comment Form */}
      {isAuthenticated && (
        <div className="mb-6">
          <form
            onSubmit={handleCommentSubmit}
            className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4"
          >
            <img
              src={user?.avatar}
              alt={user?.username}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-800 shrink-0 hidden sm:block"
            />
            <div className="w-full">
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full bg-slate-800 text-slate-100 p-3 rounded-xl border border-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                rows="2"
              ></textarea>
              <div className="flex justify-between items-center mt-2">
                <img
                  src={user?.avatar}
                  alt={user?.username}
                  className="w-7 h-7 rounded-full object-cover sm:hidden"
                />
                <button
                  type="submit"
                  disabled={addCommentMutation.isPending || !newComment.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-500 disabled:border-slate-700 border border-transparent transition ml-auto"
                >
                  {addCommentMutation.isPending ? "Posting..." : "Comment"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Display Comments */}
      {isLoading ? (
        <p className="text-sm text-slate-400">Loading comments...</p>
      ) : (
        <div className="space-y-5 divide-y divide-slate-850">
          {comments?.map((comment, index) => (
            <div
              key={comment._id}
              className={`flex items-start space-x-3 text-sm ${index !== 0 ? "pt-5" : ""}`}
            >
              <img
                src={comment.owner?.avatar}
                alt={comment.owner?.username}
                className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-800"
              />
              <div className="min-w-0 grow">
                <div className="flex items-baseline space-x-2 flex-wrap">
                  <span className="font-semibold text-slate-200 truncate">
                    {comment.owner?.username || "Anonymous"}
                  </span>
                  <span className="text-xs text-slate-500 shrink-0">
                    {formatTimeAgo(comment.createdAt)}
                  </span>
                </div>
                <p className="text-slate-300 mt-1 break-words leading-relaxed whitespace-pre-wrap pr-2">
                  {comment.content}
                </p>
                <div className="mt-2 flex items-center">
                  {isAuthenticated && (
                    <button
                      onClick={() =>
                        toggleCommentLikeMutation.mutate(comment._id)
                      }
                      disabled={toggleCommentLikeMutation.isPending}
                      className={`text-xs flex items-center space-x-1.5 px-2 py-1 rounded-md transition ${
                        likedMap[comment._id]
                          ? "text-indigo-400 bg-indigo-500/10"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                      }`}
                    >
                      <span>{likedMap[comment._id] ? "❤️" : "🤍"}</span>
                      <span>{likedMap[comment._id] ? "Liked" : "Like"}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {comments?.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-4">
              No comments yet. Be the first to join the conversation!
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default CommentList;
