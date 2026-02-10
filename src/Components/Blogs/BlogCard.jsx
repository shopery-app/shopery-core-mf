import React from "react";
import { useNavigate } from "react-router-dom";

const BlogCard = ({ blog, onLike, onSave, isOwner, onDelete, onEdit }) => {
  const navigate = useNavigate();

  const handleAction = (e, action) => {
    e.stopPropagation();
    action();
  };

  return (
    <div 
      onClick={() => navigate(`/blogs/${blog.id}`)}
      className="group bg-white border border-slate-200 rounded-[2rem] overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full"
    >
      <div className="h-56 bg-slate-100 relative overflow-hidden">
        {blog.imageUrl ? (
          <img 
            src={blog.imageUrl} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
            alt={blog.blogTitle} 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
            <i className="fa-solid fa-feather text-4xl"></i>
          </div>
        )}
        
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-900 shadow-sm">
          {new Date(blog.createdAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric' })}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-900 border border-slate-100 flex-shrink-0">
            {blog.author?.profilePhotoUrl ? (
              <img src={blog.author.profilePhotoUrl} className="w-full h-full object-cover" alt="author" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-[10px] font-bold">
                {blog.author?.name?.charAt(0) || "U"}
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-slate-900 leading-tight">
              {blog.author?.name || "Unknown Author"}
            </span>
            <span className="text-[10px] font-medium text-slate-400">
              Author
            </span>
          </div>
        </div>

        <h3 className="text-xl font-black text-slate-900 mb-3 line-clamp-2 leading-tight group-hover:text-emerald-600 transition-colors">
          {blog.blogTitle}
        </h3>
        
        <p className="text-slate-500 text-sm line-clamp-3 mb-6 leading-relaxed font-medium">
          {blog.content}
        </p>

        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <button 
              onClick={(e) => handleAction(e, () => onLike(blog.id))}
              className="flex items-center gap-1.5 text-slate-400 hover:text-rose-500 transition-colors group/btn"
            >
              <i className={`fa-heart ${blog.isLiked ? 'fa-solid text-rose-500' : 'fa-regular'} text-lg transition-transform group-active/btn:scale-75`}></i>
              <span className="text-xs font-bold">{blog.likeCount || 0}</span>
            </button>

            <button 
              onClick={(e) => handleAction(e, () => onSave(blog.id))}
              className="text-slate-400 hover:text-indigo-600 transition-colors"
              title="Save for later"
            >
              <i className="fa-regular fa-bookmark text-lg"></i>
            </button>
          </div>

          {isOwner && (
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => handleAction(e, () => onEdit(blog.id))}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white transition-all"
              >
                <i className="fa-solid fa-pen text-xs"></i>
              </button>
              <button 
                onClick={(e) => handleAction(e, () => onDelete(blog.id))}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
              >
                <i className="fa-solid fa-trash text-xs"></i>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default BlogCard;