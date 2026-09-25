import { useCallback, useEffect, useState } from "react";
import * as blogsApi from "../api/blogs";
import { isAuthenticated } from "../utils/auth";

// Tracks which blog ids the current user has liked/saved, since
// BlogResponseDto itself carries no per-viewer liked/saved flag.
const useBlogInteractions = () => {
  const [likedIds, setLikedIds] = useState(new Set());
  const [savedIds, setSavedIds] = useState(new Set());

  const refresh = useCallback(async () => {
    if (!isAuthenticated()) return;
    const [liked, saved] = await Promise.all([
      blogsApi.getLikedBlogs({ size: 500 }).catch(() => null),
      blogsApi.getSavedBlogs({ size: 500 }).catch(() => null),
    ]);
    if (liked) setLikedIds(new Set((liked.content || []).map((b) => b.id)));
    if (saved) setSavedIds(new Set((saved.content || []).map((b) => b.id)));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggleLike = useCallback(async (blogId) => {
    await blogsApi.likeBlog(blogId);
    setLikedIds((prev) => {
      const next = new Set(prev);
      next.has(blogId) ? next.delete(blogId) : next.add(blogId);
      return next;
    });
  }, []);

  const toggleSave = useCallback(async (blogId) => {
    await blogsApi.saveBlog(blogId);
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.has(blogId) ? next.delete(blogId) : next.add(blogId);
      return next;
    });
  }, []);

  return { likedIds, savedIds, refresh, toggleLike, toggleSave };
};

export default useBlogInteractions;
