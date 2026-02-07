import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  lazy,
  memo,
  useMemo,
  Suspense,
} from "react";
import { useNavigate } from "react-router-dom";
import { hasMerchantAccount } from "../../utils/roleMode";
import axios from "axios";
import { apiURL } from "../../Backend/Api/api";

const Header = lazy(() => import("../Header"));
const Footer = lazy(() => import("../Footer"));

const LoadingSpinner = memo(() => (
  <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-emerald-500 mx-auto"></div>
));
LoadingSpinner.displayName = "LoadingSpinner";

const SearchLoadingSpinner = memo(() => (
  <i className="fa-solid fa-spinner animate-spin text-xl"></i>
));
SearchLoadingSpinner.displayName = "SearchLoadingSpinner";

const BlogCard = memo(({ blog, onVisit, onAction, currentUserBlog = false }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex flex-col justify-between"> 
      <div>
        <h3 className="font-bold text-xl mb-2">{blog.blogTitle}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{blog.content}</p>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); onAction(blog.id, 'like'); }}
            className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-all"
          >
            <i className={`text-xl transition-all ${
              blog.isLiked 
                ? "fa-solid fa-heart !text-red-500" 
                : "fa-regular fa-heart text-gray-400"
            }`}></i> 
            <span className="text-gray-700">Like</span>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onAction(blog.id, 'save'); }}
            className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-all"
          >
            <i className={`text-xl transition-all ${
              blog.isSaved 
                ? "fa-solid fa-bookmark !text-blue-600" 
                : "fa-regular fa-bookmark text-gray-400"
            }`}></i> 
            <span className="text-gray-700">Save</span>
          </button>

        </div>
      </div>
    </div>
  );
});
BlogCard.displayName = "BlogCard";

const Notification = memo(({ notification, onClose }) => {
  if (!notification) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div
        className={`${
          notification.type === "success" ? "bg-green-500" : "bg-red-500"
        } text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in`}
      >
        <i
          className={`fa-solid ${
            notification.type === "success"
              ? "fa-check-circle"
              : "fa-exclamation-triangle"
          } text-xl`}
        ></i>
        <span className="font-medium">{notification.message}</span>
        <button
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200 transition-colors"
        >
          <i className="fa-solid fa-times"></i>
        </button>
      </div>
    </div>
  );
});
Notification.displayName = "Notification";

const FilterSidebar = memo(
  ({
    sortBy,
    sortDirection,
    onSortChange,
    blogs,
    totalElements,
    lastSearchTerm,
    hasMerchantAccess,
    onCreateBlog,
    userOwnedBlog,
    onGoToDashboard,
  }) => {
    const handleSortChange = useCallback(
      (e) => {
        const [field, direction] = e.target.value.split(",");
        onSortChange(field, direction);
      },
      [onSortChange],
    );

    return (
      <div className="w-full lg:w-80 space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 lg:sticky lg:top-8">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
            <i className="fa-solid fa-filter mr-2 text-emerald-600"></i>
            Filters
          </h3>

          <div className="space-y-6 lg:space-y-6">
            {hasMerchantAccess && userOwnedBlog && (
              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg p-4 border border-emerald-200">
                <div className="flex items-center mb-3">
                  <i className="fa-solid fa-blog text-emerald-600 mr-2"></i>
                  <span className="font-semibold text-emerald-800">
                    Your Blog
                  </span>
                </div>
                <p className="text-sm text-emerald-700 mb-4">
                  {userOwnedBlog.blogTitle}
                </p>
                <button
                  onClick={onGoToDashboard}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-tachometer-alt"></i>
                  Go to Dashboard
                </button>
              </div>
            )}

            <div className="flex-1 lg:flex-none">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <i className="fa-solid fa-sort mr-2 text-emerald-600"></i>
                Sort By
              </label>
              <select
                value={`${sortBy},${sortDirection}`}
                onChange={handleSortChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 text-sm font-medium bg-gray-50 hover:bg-white transition-all"
              >
                <option value="createdAt,desc">🆕 Newest First</option>
                <option value="createdAt,asc">⏰ Oldest First</option>
                <option value="blogTitle,asc">🔤 Title A-Z</option>
                <option value="blogTitle,desc">🔤 Title Z-A</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-4 lg:gap-6">
              <div className="flex-1 lg:flex-none bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-gray-600 text-sm font-medium">
                  <i className="fa-solid fa-newspaper mr-2 text-emerald-600"></i>
                  <span className="hidden sm:inline">Showing </span>
                  {blogs.length} of {totalElements} blogs
                  {lastSearchTerm && (
                    <div className="mt-2 text-emerald-600 truncate">
                      for &quot;{lastSearchTerm}&quot;
                    </div>
                  )}
                </div>
              </div>

              {hasMerchantAccess && !userOwnedBlog && (
                <div className="flex-1 lg:flex-none">
                  <button
                    onClick={onCreateBlog}
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-3 rounded-lg font-semibold text-sm hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-plus"></i>
                    <span className="hidden sm:inline">Create Blog</span>
                    <span className="sm:hidden">Create</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
);
FilterSidebar.displayName = "FilterSidebar";

const PaginationControls = memo(
  ({ currentPage, totalPages, totalElements, blogs, onPageChange }) => {
    const getPageNumbers = useMemo(() => {
      const pageNumbers = [];
      const maxPagesToShow = 5;

      let startPage = Math.max(0, currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);

      if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(0, endPage - maxPagesToShow + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      return pageNumbers;
    }, [currentPage, totalPages]);

    return (
      <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="w-full sm:w-auto px-4 lg:px-6 py-2.5 lg:py-3 border-2 border-gray-200 rounded-lg lg:rounded-xl hover:border-emerald-500 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium transform hover:scale-105 text-sm lg:text-base"
          >
            <i className="fa-solid fa-chevron-left mr-1"></i>
            Previous
          </button>

          <div className="flex gap-1 lg:gap-2 overflow-x-auto pb-2 sm:pb-0">
            {getPageNumbers.map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`w-10 lg:w-12 h-10 lg:h-12 rounded-lg lg:rounded-xl font-bold transition-all transform hover:scale-110 text-sm lg:text-base flex-shrink-0 ${
                  currentPage === pageNum
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg"
                    : "border-2 border-gray-200 hover:border-emerald-500 hover:bg-emerald-50"
                }`}
              >
                {pageNum + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            className="w-full sm:w-auto px-4 lg:px-6 py-2.5 lg:py-3 border-2 border-gray-200 rounded-lg lg:rounded-xl hover:border-emerald-500 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium transform hover:scale-105 text-sm lg:text-base"
          >
            Next
            <i className="fa-solid fa-chevron-right ml-1"></i>
          </button>
        </div>

        <div className="text-center mt-4 lg:mt-6 text-gray-600 text-xs lg:text-sm">
          Page {currentPage + 1} of {totalPages} • Showing {blogs.length} of{" "}
          {totalElements} blogs
        </div>
      </div>
    );
  },
);
PaginationControls.displayName = "PaginationControls";

const CreateBlogModal = memo(
  ({
    isOpen,
    onClose,
    formData,
    formErrors,
    isLoading,
    onSubmit,
    onInputChange,
  }) => {
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Create New Blog
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <i className="fa-solid fa-times text-xl"></i>
            </button>
          </div>

          <form onSubmit={onSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blog Title
              </label>
              <input
                type="text"
                name="blogTitle"
                value={formData.blogTitle}
                onChange={onInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  formErrors.blogTitle ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter blog title"
              />
              {formErrors.blogTitle && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.blogTitle}
                </p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={onInputChange}
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  formErrors.description ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Describe your blog"
              />
              {formErrors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.description}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? "Creating..." : "Create Blog"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  },
);
CreateBlogModal.displayName = "CreateBlogModal";

const Blogs = memo(() => {
  const [blogsData, setBlogsData] = useState({
    blogs: [],
    totalElements: 0,
    totalPages: 1,
    currentPage: 0,
  });

  const [loadingStates, setLoadingStates] = useState({
    loading: true,
    searchLoading: false,
    createLoading: false,
  });

  const [searchState, setSearchState] = useState({
    searchTerm: "",
    lastSearchTerm: "",
    sortBy: "createdAt",
    sortDirection: "desc",
  });

  const [modalState, setModalState] = useState({
    showCreateModal: false,
    formData: { blogTitle: "", content: "" },
    formErrors: {},
  });

  const [userBlogData, setUserBlogData] = useState({
    userOwnedBlog: null,
    loadingUserBlog: false,
  });

  const [notification, setNotification] = useState(null);
  const [error, setError] = useState("");

  const pageSize = 12;
  const navigate = useNavigate();
  const searchTimeoutRef = useRef(null);
  const apiCache = useRef(new Map());

  const { blogs, totalElements, totalPages, currentPage } = blogsData;
  const { loading, searchLoading, createLoading } = loadingStates;
  const { searchTerm, lastSearchTerm, sortBy, sortDirection } = searchState;
  const { showCreateModal, formData, formErrors } = modalState;
  const { userOwnedBlog, loadingUserBlog } = userBlogData;
   
  const hasMerchantAccess = useMemo(() => hasMerchantAccount(), []);

  const processedBlogs = useMemo(() => {
    if (!userOwnedBlog) return blogs;

    return blogs.map((blog) => ({
      ...blog,
      isUserBlog: blog.id === userOwnedBlog.id,
    }));
  }, [blogs, userOwnedBlog]);

  const fetchBlogs = useCallback(
    async (searchQuery = "", showLoader = true) => {
      const cacheKey = JSON.stringify({
        searchQuery,
        page: currentPage,
        size: pageSize,
        sort: `${sortBy},${sortDirection}`,
      });

      if (apiCache.current.has(cacheKey)) {
        setBlogsData(apiCache.current.get(cacheKey));
        return;
      }

      try {
        setLoadingStates((prev) => ({
          ...prev,
          loading: showLoader,
          searchLoading: !showLoader,
        }));
        
        const params = {
          page: currentPage,
          size: pageSize,
          sort: `${sortBy},${sortDirection}`,
        };

        if (searchQuery.trim()) {
          params.blogTitle = searchQuery.trim();
        }

        const response = await axios.get(`${apiURL}/blogs`, { params });

        if (response.data.status === "OK" && response.data.data) {
          const pageData = response.data.data;
          const newData = {
            blogs: pageData.content || [],
            totalPages: pageData.totalPages || 1,
            totalElements: pageData.totalElements || 0,
            currentPage: pageData.pageable?.pageNumber || 0,
          };
          setBlogsData(newData);
          setSearchState((prev) => ({ ...prev, lastSearchTerm: searchQuery }));
          apiCache.current.set(cacheKey, newData);
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
        setError("Failed to load blogs.");
      } finally {
        setLoadingStates((prev) => ({ ...prev, loading: false, searchLoading: false }));
      }
    },
    [currentPage, sortBy, sortDirection]
  );

  useEffect(() => {
    fetchBlogs(searchTerm, true);
  }, [fetchBlogs]);

  const handleBlogVisit = useCallback((blogId, manage = false) => {
  if (manage) {
    const blogToEdit = blogs.find(b => b.id === blogId);
    setModalState({
      showCreateModal: true,
      formData: { blogTitle: blogToEdit.blogTitle, description: blogToEdit.description },
      formErrors: {},
      editingId: blogId 
    });
    } else {
      navigate(`/blogs/${blogId}`);
    }
  }, [navigate, blogs]);
  const handleSearchChange = (e) => {
    setSearchState(prev => ({ ...prev, searchTerm: e.target.value }));
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    fetchBlogs(searchTerm, false);
  };

  const handleClearSearch = () => {
    setSearchState(prev => ({ ...prev, searchTerm: "", lastSearchTerm: "" }));
    fetchBlogs("", false);
  };
  const handleBlogAction = useCallback(async (blogId, actionType, updateData = null) => {
  try {
    let response;
    switch (actionType) {
      case 'delete':
        if (window.confirm("Bloqu silmək istədiyinizə əminsiniz?")) {
          response = await axios.delete(`${apiURL}/users/me/blogs/${blogId}`);
        } else return;
        break;
      case 'like':
        response = await axios.post(`${apiURL}/users/me/blogs/${blogId}/like`);
        break;
      case 'save':
        response = await axios.post(`${apiURL}/users/me/blogs/${blogId}/save`);
        break;
    }

    if (response && response.data.status === "OK") {
      setBlogsData(prev => ({
        ...prev,
        blogs: prev.blogs.map(blog => 
          blog.id === blogId 
            ? { 
                ...blog, 
                isLiked: actionType === 'like' ? !blog.isLiked : blog.isLiked,
                isSaved: actionType === 'save' ? !blog.isSaved : blog.isSaved 
              } 
            : blog
        )
      }));
      setNotification({ type: "success", message: `Success!` });
    }
  } catch (err) {
    setNotification({ type: "error", message: "Error happening" });
  }
}, [apiURL]);
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Header />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pb-12">
        
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Discover Our Blogs
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
              Explore stories, news, and insights from our community of writers.
            </p>
          </div>
        </div>

        <div className="relative -mt-8 z-10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100 transform transition-all duration-300">
              <form
                onSubmit={handleManualSearch}
                className="flex flex-col lg:flex-row gap-6"
              >
                <div className="flex-1">
                  <div className="relative group">
                    <input
                      type="text"
                      placeholder="Search for blogs by name..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className="w-full px-6 py-4 pl-14 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-300 bg-gray-50 focus:bg-white"
                    />
                    <div className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                      {searchLoading ? (
                        <SearchLoadingSpinner />
                      ) : (
                        <i className="fa-solid fa-search text-xl"></i>
                      )}
                    </div>
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <i className="fa-solid fa-times"></i>
                      </button>
                    )}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={searchLoading}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-12 py-4 rounded-xl font-semibold text-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {searchLoading ? (
                    <>
                      <SearchLoadingSpinner />
                      <span className="ml-2">Searching...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-search mr-2"></i>
                      Search
                    </>
                  )}
                </button>
              </form>
            </div>

            <Notification 
              notification={notification} 
              onClose={() => setNotification(null)} 
            />
            
            <div className="flex flex-col lg:flex-row gap-8">
              <FilterSidebar 
                blogs={blogs}
                totalElements={totalElements}
                sortBy={sortBy}
                sortDirection={sortDirection}
                lastSearchTerm={lastSearchTerm}
                hasMerchantAccess={hasMerchantAccess}
                userOwnedBlog={userOwnedBlog}
                onSortChange={(field, dir) => setSearchState(prev => ({ ...prev, sortBy: field, sortDirection: dir }))}
                onCreateBlog={() => setModalState(prev => ({ ...prev, showCreateModal: true }))}
              />

              <div className="flex-1">
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <LoadingSpinner />
                  </div>
                ) : processedBlogs.length > 0 ? (
                  <>
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                      {processedBlogs.map((blog, index) => (
                        <BlogCard 
                          key={blog.id} 
                          blog={blog} 
                          index={index} 
                          onVisit={handleBlogVisit}
                          onAction={handleBlogAction} 
                          currentUserBlog={blog.isUserBlog}
                        />
                      ))}
                    </div>
                    <div className="mt-10">
                      <PaginationControls 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalElements={totalElements}
                        blogs={blogs}
                        onPageChange={(page) => setBlogsData(prev => ({ ...prev, currentPage: page }))}
                      />
                    </div>
                  </>
                ) : (
                  
                    <div className="flex gap-2 mb-4">
                    <button onClick={() => navigate('/blogs/liked')} className="text-sm text-red-500 bg-red-50 px-3 py-1 rounded-full">
                      <i className="fa-solid fa-heart mr-1"></i> Like
                    </button>
                    <button onClick={() => navigate('/blogs/saved')} className="text-sm text-blue-500 bg-blue-50 px-3 py-1 rounded-full">
                      <i className="fa-solid fa-bookmark mr-1"></i> Update
                    </button>
                  
                  </div>
                )}
              </div>
               
              
            </div>
          </div>
        </div>
      </div>

      <CreateBlogModal 
        isOpen={showCreateModal}
        onClose={() => setModalState(prev => ({ ...prev, showCreateModal: false }))}
        formData={formData}
        formErrors={formErrors}
        isLoading={createLoading}
        onInputChange={(e) => {
          const { name, value } = e.target;
          setModalState(prev => ({ ...prev, formData: { ...prev.formData, [name]: value } }));
        }}
        onSubmit={(e) => {
          e.preventDefault();
        }}

      />
      
      <Footer />
    </Suspense>
  );
});

Blogs.displayName = "Blogs";
export default Blogs;