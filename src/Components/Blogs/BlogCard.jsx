import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { apiURL } from "../../Backend/Api/api";

const HeartIcon = ({ filled }) => (
    <svg width="15" height="15" viewBox="0 0 15 15" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
      <path d="M7.5 12.5S1.5 8.5 1.5 4.5a3 3 0 015.5-1.7A3 3 0 0113.5 4.5c0 4-6 8-6 8z" strokeLinejoin="round"/>
    </svg>
);

const BookmarkIcon = ({ filled }) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
      <path d="M2.5 2a1 1 0 011-1h7a1 1 0 011 1v10.5l-4.5-2.5-4.5 2.5V2z" strokeLinejoin="round"/>
    </svg>
);

const BlogPreviewModal = ({ blog, onClose, onLike, onSave, isLiked, isSaved, token }) => {
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
      <div
          onClick={onClose}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(10, 10, 10, 0.65)",
            backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "24px",
            animation: "fadeOverlay 0.2s ease",
          }}
      >
        <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#FAFAF8",
              borderRadius: "20px",
              width: "100%",
              maxWidth: "680px",
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              animation: "slideModal 0.3s cubic-bezier(0.34, 1.2, 0.64, 1)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.18)",
            }}
        >
          {blog?.imageUrl && (
              <div style={{ height: "240px", flexShrink: 0, overflow: "hidden", position: "relative" }}>
                <img
                    src={blog.imageUrl}
                    alt={blog.blogTitle}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(to bottom, transparent 50%, rgba(250,250,248,0.95) 100%)"
                }} />
              </div>
          )}

          <div style={{ padding: "28px 32px 0", flexShrink: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", marginBottom: "16px" }}>
              <h2 style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: "26px",
                fontWeight: 400,
                color: "#1A1A18",
                lineHeight: 1.25,
                margin: 0,
                flex: 1,
              }}>
                {blog?.blogTitle}
              </h2>
              <button
                  onClick={onClose}
                  style={{
                    background: "#EFEDE8", border: "none", cursor: "pointer",
                    width: "32px", height: "32px", borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#6B6B65", flexShrink: 0, transition: "background 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#E5E2DA"}
                  onMouseLeave={e => e.currentTarget.style.background = "#EFEDE8"}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", paddingBottom: "16px", borderBottom: "1px solid #E8E6E0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "50%",
                  background: "#D4C9B0",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  overflow: "hidden",
                }}>
                  {blog?.author?.profilePhotoUrl ? (
                      <img src={blog.author.profilePhotoUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                  ) : (
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "#6B5A3E", fontFamily: "'Instrument Sans', sans-serif" }}>
                                        {blog?.author?.name?.charAt(0) || "?"}
                                    </span>
                  )}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#2C2C28", fontFamily: "'Instrument Sans', sans-serif" }}>
                    {blog?.author?.name || "Anonymous"}
                  </p>
                  <p style={{ margin: 0, fontSize: "11px", color: "#9B9B94", fontFamily: "'Instrument Sans', sans-serif" }}>
                    {blog?.createdAt ? new Date(blog.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : ""}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                    onClick={() => onLike && onLike(blog.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: "6px",
                      padding: "7px 13px",
                      borderRadius: "20px",
                      border: "1px solid",
                      borderColor: isLiked ? "#E57373" : "#E0DDD6",
                      background: isLiked ? "#FFF0F0" : "transparent",
                      color: isLiked ? "#C0392B" : "#7A7A74",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 500,
                      fontFamily: "'Instrument Sans', sans-serif",
                      transition: "all 0.15s",
                    }}
                >
                  <HeartIcon filled={isLiked} />
                  {blog?.likeCount || 0}
                </button>
                <button
                    onClick={() => onSave && onSave(blog.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: "6px",
                      padding: "7px 13px",
                      borderRadius: "20px",
                      border: "1px solid",
                      borderColor: isSaved ? "#9B8B6E" : "#E0DDD6",
                      background: isSaved ? "#F5F0E8" : "transparent",
                      color: isSaved ? "#6B5A3E" : "#7A7A74",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 500,
                      fontFamily: "'Instrument Sans', sans-serif",
                      transition: "all 0.15s",
                    }}
                >
                  <BookmarkIcon filled={isSaved} />
                  {isSaved ? "Saved" : "Save"}
                </button>
              </div>
            </div>
          </div>

          <div style={{ padding: "20px 32px 32px", overflowY: "auto", flex: 1 }}>
            <p style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: "17px",
              fontWeight: 400,
              color: "#3C3C38",
              lineHeight: 1.85,
              margin: 0,
              whiteSpace: "pre-line",
            }}>
              {blog?.content}
            </p>
          </div>

          <div style={{
            padding: "16px 32px",
            borderTop: "1px solid #E8E6E0",
            display: "flex",
            justifyContent: "flex-end",
            flexShrink: 0,
            background: "#FAFAF8",
          }}>
          </div>
        </div>

        <style>{`
                @keyframes fadeOverlay { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideModal {
                    from { opacity: 0; transform: translateY(24px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
      </div>
  );
};

const BlogCard = ({
                    blog,
                    isOwner = false,
                    onDelete,
                    onEdit,
                    onArchive,
                    onLike,
                    onSave,
                    token,
                  }) => {
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState(false);

  const stop = (e, cb) => {
    e.stopPropagation();
    if (typeof cb === "function" && blog?.id) cb(blog.id);
  };

  const handleCardClick = () => {
    setShowPreview(true);
  };

  return (
      <>
        <div
            onClick={handleCardClick}
            style={{
              background: "#FFFFFF",
              border: "1px solid #ECEAE4",
              borderRadius: "16px",
              overflow: "hidden",
              cursor: "pointer",
              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
              fontFamily: "'Instrument Sans', sans-serif",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.09)";
              e.currentTarget.style.borderColor = "#D4D1C8";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.borderColor = "#ECEAE4";
            }}
        >
          <div style={{ height: "200px", background: "#F5F3EE", overflow: "hidden", position: "relative" }}>
            {blog?.imageUrl ? (
                <img
                    src={blog.imageUrl}
                    alt={blog?.blogTitle || "Blog cover"}
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                />
            ) : (
                <div style={{
                  width: "100%", height: "100%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "#F0EDE5",
                }}>
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <rect x="4" y="6" width="24" height="20" rx="3" stroke="#C4BFB4" strokeWidth="1.5"/>
                    <circle cx="12" cy="13" r="2.5" stroke="#C4BFB4" strokeWidth="1.5"/>
                    <path d="M4 22l7-6 5 5 4-3.5 8 5.5" stroke="#C4BFB4" strokeWidth="1.5" strokeLinejoin="round"/>
                  </svg>
                </div>
            )}
          </div>

          <div style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "10px" }}>
              <h3 style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: "18px",
                fontWeight: 400,
                color: "#1A1A18",
                lineHeight: 1.3,
                margin: 0,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}>
                {blog?.blogTitle}
              </h3>
              <span style={{ fontSize: "11px", color: "#B0ADA5", fontWeight: 500, whiteSpace: "nowrap", flexShrink: 0, marginTop: "3px" }}>
                            {blog?.createdAt ? new Date(blog.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
                        </span>
            </div>

            <p style={{
              fontSize: "13.5px",
              color: "#6B6B65",
              lineHeight: 1.65,
              margin: "0 0 16px",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              minHeight: "66px",
            }}>
              {blog?.content}
            </p>

            {!isOwner && blog?.author?.name && (
                <div style={{ fontSize: "12px", color: "#9B9B94", marginBottom: "14px", fontWeight: 500 }}>
                  By {blog.author.name}
                </div>
            )}

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                  onClick={(e) => stop(e, onLike)}
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "7px 12px",
                    borderRadius: "8px",
                    border: "1px solid",
                    borderColor: blog?.isLiked ? "#FECACA" : "#ECEAE4",
                    background: blog?.isLiked ? "#FFF0F0" : "transparent",
                    color: blog?.isLiked ? "#C0392B" : "#9B9B94",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: 500,
                    transition: "all 0.15s",
                    fontFamily: "'Instrument Sans', sans-serif",
                  }}
              >
                <HeartIcon filled={blog?.isLiked} />
                {blog?.likeCount || 0}
              </button>

              <button
                  onClick={(e) => stop(e, onSave)}
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "7px 12px",
                    borderRadius: "8px",
                    border: "1px solid",
                    borderColor: blog?.isSaved ? "#D4C9B0" : "#ECEAE4",
                    background: blog?.isSaved ? "#F5F0E8" : "transparent",
                    color: blog?.isSaved ? "#6B5A3E" : "#9B9B94",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: 500,
                    transition: "all 0.15s",
                    fontFamily: "'Instrument Sans', sans-serif",
                  }}
              >
                <BookmarkIcon filled={blog?.isSaved} />
                {blog?.isSaved ? "Saved" : "Save"}
              </button>
            </div>

            {isOwner && (
                <div style={{ marginTop: "14px", display: "flex", gap: "8px", borderTop: "1px solid #F0EDE8", paddingTop: "14px" }}>
                  <button
                      onClick={(e) => stop(e, onEdit)}
                      style={{
                        flex: 1, padding: "9px",
                        background: "#FAFAF8", border: "1px solid #ECEAE4",
                        borderRadius: "8px", fontSize: "11.5px",
                        fontWeight: 600, color: "#4A4A44",
                        cursor: "pointer", letterSpacing: "0.04em",
                        fontFamily: "'Instrument Sans', sans-serif",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "#F0EDE8"}
                      onMouseLeave={e => e.currentTarget.style.background = "#FAFAF8"}
                  >
                    EDIT
                  </button>
                  <button
                      onClick={(e) => stop(e, onArchive)}
                      style={{
                        flex: 1, padding: "9px",
                        background: "#F5F3FF", border: "1px solid #DDD8F0",
                        borderRadius: "8px", fontSize: "11.5px",
                        fontWeight: 600, color: "#5B52A3",
                        cursor: "pointer", letterSpacing: "0.04em",
                        fontFamily: "'Instrument Sans', sans-serif",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "#ECEAFF"}
                      onMouseLeave={e => e.currentTarget.style.background = "#F5F3FF"}
                  >
                    ARCHIVE
                  </button>
                  <button
                      onClick={(e) => stop(e, onDelete)}
                      style={{
                        flex: 1, padding: "9px",
                        background: "#FFF5F5", border: "1px solid #FECACA",
                        borderRadius: "8px", fontSize: "11.5px",
                        fontWeight: 600, color: "#C0392B",
                        cursor: "pointer", letterSpacing: "0.04em",
                        fontFamily: "'Instrument Sans', sans-serif",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "#FEECEC"}
                      onMouseLeave={e => e.currentTarget.style.background = "#FFF5F5"}
                  >
                    DELETE
                  </button>
                </div>
            )}
          </div>
        </div>

        {showPreview && (
            <BlogPreviewModal
                blog={blog}
                onClose={() => setShowPreview(false)}
                onLike={onLike}
                onSave={onSave}
                isLiked={blog?.isLiked}
                isSaved={blog?.isSaved}
                token={token}
            />
        )}
      </>
  );
};

export default BlogCard;