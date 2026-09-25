import { apiClient, unwrap } from "./client";

// Public
export const getAllBlogs = ({ page = 0, size = 12 } = {}) =>
  apiClient.get("/blogs", { params: { page, size } }).then(unwrap);
export const searchBlogs = (query, { page = 0, size = 12 } = {}) =>
  apiClient.get("/blogs/search", { params: { query, page, size } }).then(unwrap);

// Owned
export const getMyBlogs = ({ page = 0, size = 20 } = {}) =>
  apiClient.get("/users/me/blogs", { params: { page, size } }).then(unwrap);
export const getMyBlog = (blogId) => apiClient.get(`/users/me/blogs/${blogId}`).then(unwrap);
export const createBlog = (payload) => apiClient.post("/users/me/blogs", payload).then(unwrap);
export const updateBlog = (blogId, payload) => apiClient.put(`/users/me/blogs/${blogId}`, payload).then(unwrap);
export const deleteBlog = (blogId) => apiClient.delete(`/users/me/blogs/${blogId}`).then(unwrap);

export const uploadBlogImage = (blogId, file) => {
  const form = new FormData();
  form.append("image", file);
  return apiClient
    .post(`/users/me/blogs/${blogId}/image`, form, { headers: { "Content-Type": "multipart/form-data" } })
    .then(unwrap);
};
export const deleteBlogImage = (blogId) => apiClient.delete(`/users/me/blogs/${blogId}/image`).then(unwrap);

export const getLikedBlogs = ({ page = 0, size = 20 } = {}) =>
  apiClient.get("/users/me/blogs/like", { params: { page, size } }).then(unwrap);
export const likeBlog = (blogId) => apiClient.post(`/users/me/blogs/${blogId}/like`).then(unwrap);

export const getSavedBlogs = ({ page = 0, size = 20 } = {}) =>
  apiClient.get("/users/me/blogs/save", { params: { page, size } }).then(unwrap);
export const saveBlog = (blogId) => apiClient.post(`/users/me/blogs/${blogId}/save`).then(unwrap);

export const getArchivedBlogs = ({ page = 0, size = 20 } = {}) =>
  apiClient.get("/users/me/blogs/archive", { params: { page, size } }).then(unwrap);
export const archiveBlog = (blogId) => apiClient.post(`/users/me/blogs/${blogId}/archive`).then(unwrap);
