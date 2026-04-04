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
import axios from "axios";
import { apiURL } from "../../Backend/Api/api";

const Header = lazy(() => import("../Header"));
const Footer = lazy(() => import("../Footer"));

// ─── Loading Spinners ────────────────────────────────────────────────────────

const LoadingSpinner = memo(() => (
    <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-emerald-500 mx-auto" />
));
LoadingSpinner.displayName = "LoadingSpinner";

const SearchLoadingSpinner = memo(() => (
    <i className="fa-solid fa-spinner animate-spin text-xl" />
));
SearchLoadingSpinner.displayName = "SearchLoadingSpinner";

// ─── Shop Card ───────────────────────────────────────────────────────────────

const ShopCard = memo(({ shop, index, onVisit }) => (
    <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group border border-gray-100 transform hover:-translate-y-2 cursor-pointer">
      <div className="p-4 lg:p-6">
        <h3 className="font-bold text-lg lg:text-xl text-gray-800 mb-2 lg:mb-3 truncate group-hover:text-emerald-600 transition-colors">
          {shop.shopName || `Shop ${index + 1}`}
        </h3>
        <div className="text-gray-600 text-sm mb-4 h-12 lg:h-16 overflow-hidden">
          <p className="leading-relaxed line-clamp-2 lg:line-clamp-3">
            {shop.description || "Discover amazing products and exceptional service at this wonderful shop"}
          </p>
        </div>

        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <div className="flex items-center">
            <div className="flex text-yellow-400 text-base lg:text-lg">
              {[1, 2, 3, 4, 5].map((star) => (
                  <i key={star} className="fa-solid fa-star" />
              ))}
            </div>
            <span className="text-gray-700 text-sm ml-2 font-semibold">
            {shop.rating || "4.8"}
          </span>
          </div>
          <div className="text-right">
            <div className="text-gray-500 text-xs">Products</div>
            <div className="text-gray-800 font-bold">
              {shop.products?.length ?? 0}
            </div>
          </div>
        </div>

        <button
            onClick={() => onVisit(shop.id)}
            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <i className="fa-solid fa-store" />
          Visit Shop
        </button>
      </div>
    </div>
));
ShopCard.displayName = "ShopCard";

// ─── Notification ────────────────────────────────────────────────────────────

const Notification = memo(({ notification, onClose }) => {
  if (!notification) return null;
  return (
      <div className="fixed top-4 right-4 z-50 max-w-sm">
        <div
            className={`${
                notification.type === "success" ? "bg-green-500" : "bg-red-500"
            } text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3`}
        >
          <i className={`fa-solid ${notification.type === "success" ? "fa-check-circle" : "fa-exclamation-triangle"} text-xl`} />
          <span className="font-medium">{notification.message}</span>
          <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
            <i className="fa-solid fa-times" />
          </button>
        </div>
      </div>
  );
});
Notification.displayName = "Notification";

// ─── Filter Sidebar ──────────────────────────────────────────────────────────

const FilterSidebar = memo(({
                              sortBy,
                              sortDirection,
                              onSortChange,
                              shops,
                              totalElements,
                              lastSearchTerm,
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
            <i className="fa-solid fa-filter mr-2 text-emerald-600" />
            Filters
          </h3>

          <div className="space-y-6">
            {/* Sort */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <i className="fa-solid fa-sort mr-2 text-emerald-600" />
                Sort By
              </label>
              <select
                  value={`${sortBy},${sortDirection}`}
                  onChange={handleSortChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 text-sm font-medium bg-gray-50 hover:bg-white transition-all"
              >
                <option value="createdAt,desc">🆕 Newest First</option>
                <option value="createdAt,asc">⏰ Oldest First</option>
                <option value="shopName,asc">🔤 Name A-Z</option>
                <option value="shopName,desc">🔤 Name Z-A</option>
              </select>
            </div>

            {/* Count */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-gray-600 text-sm font-medium">
                <i className="fa-solid fa-store mr-2 text-emerald-600" />
                Showing {shops.length} of {totalElements} shops
                {lastSearchTerm && (
                    <div className="mt-2 text-emerald-600 truncate">
                      for &quot;{lastSearchTerm}&quot;
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
});
FilterSidebar.displayName = "FilterSidebar";

// ─── Pagination ──────────────────────────────────────────────────────────────

const PaginationControls = memo(({
                                   currentPage,
                                   totalPages,
                                   totalElements,
                                   shops,
                                   onPageChange,
                                 }) => {
  const pageNumbers = useMemo(() => {
    const max = 5;
    let start = Math.max(0, currentPage - Math.floor(max / 2));
    let end = Math.min(totalPages - 1, start + max - 1);
    if (end - start + 1 < max) start = Math.max(0, end - max + 1);
    const arr = [];
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  }, [currentPage, totalPages]);

  return (
      <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
          <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="w-full sm:w-auto px-4 lg:px-6 py-2.5 lg:py-3 border-2 border-gray-200 rounded-lg lg:rounded-xl hover:border-emerald-500 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
          >
            <i className="fa-solid fa-chevron-left mr-1" />
            Previous
          </button>

          <div className="flex gap-1 lg:gap-2 overflow-x-auto pb-2 sm:pb-0">
            {pageNumbers.map((n) => (
                <button
                    key={n}
                    onClick={() => onPageChange(n)}
                    className={`w-10 lg:w-12 h-10 lg:h-12 rounded-lg lg:rounded-xl font-bold transition-all flex-shrink-0 ${
                        currentPage === n
                            ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg"
                            : "border-2 border-gray-200 hover:border-emerald-500 hover:bg-emerald-50"
                    }`}
                >
                  {n + 1}
                </button>
            ))}
          </div>

          <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className="w-full sm:w-auto px-4 lg:px-6 py-2.5 lg:py-3 border-2 border-gray-200 rounded-lg lg:rounded-xl hover:border-emerald-500 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
          >
            Next
            <i className="fa-solid fa-chevron-right ml-1" />
          </button>
        </div>

        <div className="text-center mt-4 lg:mt-6 text-gray-600 text-xs lg:text-sm">
          Page {currentPage + 1} of {totalPages} • Showing {shops.length} of {totalElements} shops
        </div>
      </div>
  );
});
PaginationControls.displayName = "PaginationControls";

// ─── Main Component ──────────────────────────────────────────────────────────

const Shops = memo(() => {
  const [shopsData, setShopsData] = useState({
    shops: [],
    totalElements: 0,
    totalPages: 1,
    currentPage: 0,
  });
  const [loadingStates, setLoadingStates] = useState({
    loading: true,
    searchLoading: false,
  });
  const [searchState, setSearchState] = useState({
    searchTerm: "",
    lastSearchTerm: "",
    sortBy: "createdAt",
    sortDirection: "desc",
  });
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState("");

  const pageSize = 12;
  const navigate = useNavigate();
  const searchTimeoutRef = useRef(null);
  const apiCache = useRef(new Map());

  const { shops, totalElements, totalPages, currentPage } = shopsData;
  const { loading, searchLoading } = loadingStates;
  const { searchTerm, lastSearchTerm, sortBy, sortDirection } = searchState;

  // ── Fetch shops ──────────────────────────────────────────────────────────
  const fetchShops = useCallback(
      async (searchQuery = "", showLoader = true) => {
        try {
          setLoadingStates((prev) => ({ ...prev, loading: showLoader, searchLoading: !showLoader }));
          const params = {
            page: currentPage,
            size: pageSize,
            sort: `${sortBy},${sortDirection}`,
          };
          if (searchQuery.trim()) params.shopName = searchQuery.trim();

          const response = await axios.get(`${apiURL}/shops`, { params });

          const pageData = response.data?.data ?? response.data;

          if (pageData && pageData.content) {
            setShopsData({
              shops: pageData.content,
              totalPages: pageData.totalPages || 1,
              totalElements: pageData.totalElements || 0,
              currentPage: pageData.number || 0,
            });
            setSearchState((prev) => ({ ...prev, lastSearchTerm: searchQuery }));
          }
        } catch (err) {
          setError("Failed to load shops.");
        } finally {
          setLoadingStates({ loading: false, searchLoading: false });
        }
      },
      [currentPage, sortBy, sortDirection]
  );

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSortChange = useCallback((field, direction) => {
    setSearchState((prev) => ({ ...prev, sortBy: field, sortDirection: direction }));
    setShopsData((prev) => ({ ...prev, currentPage: 0 }));
    apiCache.current.clear();
  }, []);

  const handlePageChange = useCallback(
      (newPage) => {
        if (newPage >= 0 && newPage < totalPages)
          setShopsData((prev) => ({ ...prev, currentPage: newPage }));
      },
      [totalPages],
  );

  const handleSearchChange = useCallback(
      (e) => setSearchState((prev) => ({ ...prev, searchTerm: e.target.value })),
      [],
  );

  const handleManualSearch = useCallback(
      (e) => {
        e.preventDefault();
        clearTimeout(searchTimeoutRef.current);
        setShopsData((prev) => ({ ...prev, currentPage: 0 }));
        fetchShops(searchTerm, false);
      },
      [searchTerm, fetchShops],
  );

  const handleClearSearch = useCallback(() => {
    setSearchState((prev) => ({ ...prev, searchTerm: "", lastSearchTerm: "" }));
    setShopsData((prev) => ({ ...prev, currentPage: 0 }));
    fetchShops("", false);
  }, [fetchShops]);

  const handleShopVisit = useCallback(
      (shopId) => navigate(`/shop/${shopId}`),
      [navigate],
  );

  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchShops(lastSearchTerm, true);
  }, [fetchShops]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    clearTimeout(searchTimeoutRef.current);
    if (searchTerm === "") {
      setShopsData((prev) => ({ ...prev, currentPage: 0 }));
      fetchShops("", false);
      return;
    }
    searchTimeoutRef.current = setTimeout(() => {
      setShopsData((prev) => ({ ...prev, currentPage: 0 }));
      fetchShops(searchTerm, false);
    }, 800);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchTerm, fetchShops]);

  useEffect(() => {
    if (notification) {
      const t = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(t);
    }
  }, [notification]);

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
        <Suspense fallback={<LoadingSpinner />}>
          <Header />
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
            <div className="text-center">
              <LoadingSpinner />
              <p className="mt-6 text-gray-600 font-medium">Discovering amazing shops...</p>
            </div>
          </div>
          <Footer />
        </Suspense>
    );
  }

  return (
      <Suspense fallback={<LoadingSpinner />}>
        <Header />
        <Notification notification={notification} onClose={() => setNotification(null)} />

        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
          {/* Hero */}
          <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-20" />
            <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Discover Amazing Shops
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">
                Explore a curated collection of unique stores offering quality products and exceptional service
              </p>
            </div>
          </div>

          <div className="relative -mt-8 z-10">
            <div className="max-w-7xl mx-auto px-4">
              {/* Search Bar */}
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
                <form onSubmit={handleManualSearch} className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1">
                    <div className="relative group">
                      <input
                          type="text"
                          placeholder="Search for shops by name..."
                          value={searchTerm}
                          onChange={handleSearchChange}
                          className="w-full px-6 py-4 pl-14 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all bg-gray-50 focus:bg-white"
                      />
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                        {searchLoading ? <SearchLoadingSpinner /> : <i className="fa-solid fa-search text-xl" />}
                      </div>
                      {searchTerm && (
                          <button
                              type="button"
                              onClick={handleClearSearch}
                              className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <i className="fa-solid fa-times" />
                          </button>
                      )}
                    </div>
                  </div>
                  <button
                      type="submit"
                      disabled={searchLoading}
                      className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-12 py-4 rounded-xl font-semibold text-lg hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {searchLoading ? (
                        <><SearchLoadingSpinner /><span className="ml-2">Searching...</span></>
                    ) : (
                        <><i className="fa-solid fa-search mr-2" />Search</>
                    )}
                  </button>
                </form>
              </div>

              {/* Content */}
              <div className="flex flex-col lg:flex-row gap-8">
                <FilterSidebar
                    sortBy={sortBy}
                    sortDirection={sortDirection}
                    onSortChange={handleSortChange}
                    shops={shops}
                    totalElements={totalElements}
                    lastSearchTerm={lastSearchTerm}
                />

                <div className="flex-1 min-w-0">
                  {error ? (
                      <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-red-100">
                        <div className="text-red-500 mb-6">
                          <i className="fa-solid fa-exclamation-triangle text-6xl" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">Oops! Something went wrong</h3>
                        <p className="text-gray-600 mb-8">{error}</p>
                        <button
                            onClick={() => fetchShops(lastSearchTerm, false)}
                            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all"
                        >
                          <i className="fa-solid fa-refresh mr-2" />
                          Try Again
                        </button>
                      </div>
                  ) : searchLoading && shops.length === 0 ? (
                      <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
                        <i className="fa-solid fa-search text-8xl text-emerald-500 animate-pulse mb-8 block" />
                        <h3 className="text-3xl font-bold text-gray-800 mb-6">Searching for shops...</h3>
                        <p className="text-gray-600">Please wait while we find shops matching &quot;{searchTerm}&quot;</p>
                      </div>
                  ) : shops.length === 0 ? (
                      <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
                        <i className="fa-solid fa-store text-8xl text-gray-300 mb-8 block" />
                        <h3 className="text-3xl font-bold text-gray-800 mb-6">
                          {lastSearchTerm ? "No shops found" : "No shops available"}
                        </h3>
                        <p className="text-gray-600 mb-10 max-w-lg mx-auto leading-relaxed">
                          {lastSearchTerm
                              ? `We couldn't find any shops matching "${lastSearchTerm}". Try a different search term.`
                              : "No shops are available yet. Check back soon!"}
                        </p>
                        {lastSearchTerm && (
                            <button
                                onClick={handleClearSearch}
                                className="inline-flex items-center bg-gray-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-700 transition-all"
                            >
                              <i className="fa-solid fa-times mr-2" />
                              Clear Search
                            </button>
                        )}
                      </div>
                  ) : (
                      <>
                        <div className="grid gap-4 sm:gap-6 lg:gap-8 mb-8 lg:mb-12 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                          {shops.map((shop, index) => (
                              <ShopCard
                                  key={shop.id || index}
                                  shop={shop}
                                  index={index}
                                  onVisit={handleShopVisit}
                              />
                          ))}
                        </div>

                        <PaginationControls
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalElements={totalElements}
                            shops={shops}
                            onPageChange={handlePageChange}
                        />
                      </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </Suspense>
  );
});

Shops.displayName = "Shops";
export default Shops;