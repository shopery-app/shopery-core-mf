import React from "react";
import { useNavigate } from "react-router-dom";

const BlogCard = ({
                    blog,
                    isOwner = false,
                    onDelete,
                    onEdit,
                    onArchive,
                    onLike,
                    onSave,
                  }) => {
  const navigate = useNavigate();

  const stop = (e, cb) => {
    e.stopPropagation();
    if (typeof cb === "function" && blog?.id) cb(blog.id);
  };

  return (
      <div
          onClick={() => blog?.id && navigate(`/blogs/${blog.id}`)}
          className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group"
      >
        <div className="h-56 bg-slate-100 overflow-hidden">
          {blog?.imageUrl ? (
              <img
                  src={blog.imageUrl}
                  alt={blog?.blogTitle || "Blog cover"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
          ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300 text-sm font-bold">
                NO IMAGE
              </div>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="text-lg font-black text-slate-900 line-clamp-2">
              {blog?.blogTitle}
            </h3>

            <div className="shrink-0 text-[10px] text-slate-400 font-bold uppercase whitespace-nowrap">
              {blog?.createdAt ? new Date(blog.createdAt).toLocaleDateString() : ""}
            </div>
          </div>

          <p className="text-slate-600 text-sm leading-6 line-clamp-4 min-h-[96px]">
            {blog?.content}
          </p>

          {!isOwner && blog?.author?.name && (
              <div className="mt-4 text-xs text-slate-400 font-semibold">
                By {blog.author.name}
              </div>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            <button
                onClick={(e) => stop(e, onLike)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    blog?.isLiked ? "bg-rose-600 text-white" : "bg-rose-50 text-rose-600 hover:bg-rose-100"
                }`}
            >
              <i className={`${blog?.isLiked ? "fa-solid" : "fa-regular"} fa-heart`}></i>
              {blog?.likeCount || 0}
            </button>

            <button
                onClick={(e) => stop(e, onSave)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    blog?.isSaved ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
            >
              <i className={`${blog?.isSaved ? "fa-solid" : "fa-regular"} fa-bookmark`}></i>
              {blog?.isSaved ? "Saved" : "Save"}
            </button>
          </div>

          {isOwner && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                    onClick={(e) => stop(e, onEdit)}
                    className="px-4 py-3 bg-amber-50 text-amber-700 rounded-xl text-xs font-bold hover:bg-amber-100 transition-all"
                >
                  EDIT
                </button>

                <button
                    onClick={(e) => stop(e, onArchive)}
                    className="px-4 py-3 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all"
                >
                  ARCHIVE
                </button>

                <button
                    onClick={(e) => stop(e, onDelete)}
                    className="px-4 py-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-all"
                >
                  DELETE
                </button>
              </div>
          )}
        </div>
      </div>
  );
};

export default BlogCard;