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

const ShopCard = memo(
  ({ shop, index, onVisit, currentUserShop = false, products }) => {
    return (
      <div
        className={`bg-white rounded-xl lg:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group border transform hover:-translate-y-2 cursor-pointer ${
          currentUserShop
            ? "border-emerald-500 ring-2 ring-emerald-200"
            : "border-gray-100"
        }`}
      >
        {currentUserShop && (
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 py-2 text-sm font-semibold flex items-center justify-center">
            <i className="fa-solid fa-crown mr-2"></i>
            Your Shop
          </div>
        )}

        <div className="p-4 lg:p-6">
          <h3 className="font-bold text-lg lg:text-xl text-gray-800 mb-2 lg:mb-3 truncate group-hover:text-emerald-600 transition-colors">
            {shop.shopName || `Shop ${index + 1}`}
          </h3>
          <div className="text-gray-600 text-sm mb-4 h-12 lg:h-16 overflow-hidden">
            <p className="leading-relaxed line-clamp-2 lg:line-clamp-3">
              {shop.description ||
                "Discover amazing products and exceptional service at this wonderful shop"}
            </p>
          </div>

          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <div className="flex items-center">
              <div className="flex text-yellow-400 text-base lg:text-lg">
                {[1, 2, 3, 4, 5].map((star) => (
                  <i key={star} className="fa-solid fa-star"></i>
                ))}
              </div>
              <span className="text-gray-700 text-sm ml-2 font-semibold">
                {shop.rating || "4.8"}
              </span>
            </div>
            <div className="text-right">
              <div className="text-gray-500 text-xs">Products</div>
              <div className="text-gray-800 font-bold">
                {products.length || "0"}
                {currentUserShop && (
                  <span className="text-xs text-emerald-600 block">
                    (Your Shop)
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => onVisit(shop.id, false)}
            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-store"></i>
            Visit Shop
          </button>
        </div>
        {currentUserShop && (
          <button
            onClick={() => onVisit(shop.id, true)}
            className="w-full mt-2 bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-tachometer-alt"></i>
            Manage Shop
          </button>
        )}
      </div>
    );
  },
);
ShopCard.displayName = "ShopCard";

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
    shops,
    totalElements,
    lastSearchTerm,
    hasMerchantAccess,
    onCreateShop,
    userOwnedShop,
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
            {hasMerchantAccess && userOwnedShop && (
              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg p-4 border border-emerald-200">
                <div className="flex items-center mb-3">
                  <i className="fa-solid fa-store text-emerald-600 mr-2"></i>
                  <span className="font-semibold text-emerald-800">
                    Your Shop
                  </span>
                </div>
                <p className="text-sm text-emerald-700 mb-4">
                  {userOwnedShop.shopName}
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
                <option value="shopName,asc">🔤 Name A-Z</option>
                <option value="shopName,desc">🔤 Name Z-A</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-4 lg:gap-6">
              <div className="flex-1 lg:flex-none bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-gray-600 text-sm font-medium">
                  <i className="fa-solid fa-store mr-2 text-emerald-600"></i>
                  <span className="hidden sm:inline">Showing </span>
                  {shops.length} of {totalElements} shops
                  {lastSearchTerm && (
                    <div className="mt-2 text-emerald-600 truncate">
                      for &quot;{lastSearchTerm}&quot;
                    </div>
                  )}
                </div>
              </div>

              {hasMerchantAccess && !userOwnedShop && (
                <div className="flex-1 lg:flex-none">
                  <button
                    onClick={onCreateShop}
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-3 rounded-lg font-semibold text-sm hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-plus"></i>
                    <span className="hidden sm:inline">Create Shop</span>
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
  ({ currentPage, totalPages, totalElements, shops, onPageChange }) => {
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
          Page {currentPage + 1} of {totalPages} • Showing {shops.length} of{" "}
          {totalElements} shops
        </div>
      </div>
    );
  },
);
PaginationControls.displayName = "PaginationControls";

const CreateShopModal = memo(
  ({
    isOpen,
    onClose,
    formData,
    formErrors,
    isLoading,
    onSubmit,
    onInputChange,
    subscriptionTiers,
    onTierSelect,
  }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Create New Shop
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
                Shop Name
              </label>
              <input
                type="text"
                name="shopName"
                value={formData.shopName}
                onChange={onInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  formErrors.shopName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter shop name"
              />
              {formErrors.shopName && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.shopName}
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
                placeholder="Describe your shop"
              />
              {formErrors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.description}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Select Subscription Tier
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {subscriptionTiers.map((tier) => (
                  <div
                    key={tier.name}
                    onClick={() => onTierSelect(tier.name)}
                    className={`cursor-pointer border-2 rounded-xl p-4 transition-all duration-200 flex flex-col justify-between hover:shadow-md ${
                      formData.subscriptionTier === tier.name
                        ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100"
                        : "border-gray-100 bg-gray-50 hover:border-emerald-200"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                           formData.subscriptionTier === tier.name ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-600"
                        }`}>
                          {tier.name}
                        </span>
                        <div className="text-emerald-700 font-bold text-sm">
                          ${tier.price}
                        </div>
                      </div>
                      <ul className="mt-2 space-y-1">
                        {tier.features.map((feat, idx) => (
                          <li key={idx} className="text-[11px] text-gray-600 flex items-start gap-1">
                            <i className="fa-solid fa-check text-emerald-500 mt-0.5"></i>
                            {feat}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {formData.subscriptionTier === tier.name && (
                      <div className="mt-2 text-center text-emerald-600">
                        <i className="fa-solid fa-circle-check text-lg"></i>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {formErrors.subscriptionTier && (
                <p className="text-red-500 text-xs mt-2 font-medium">{formErrors.subscriptionTier}</p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? "Creating..." : "Create Shop"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  },
);
CreateShopModal.displayName = "CreateShopModal";

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
    createLoading: false,
  });

  const [searchState, setSearchState] = useState({
    searchTerm: "",
    lastSearchTerm: "",
    sortBy: "createdAt",
    sortDirection: "desc",
  });

  const [subscriptionTiers, setSubscriptionTiers] = useState([]);

  const [modalState, setModalState] = useState({
    showCreateModal: false,
    formData: { 
      shopName: "", 
      description: "",
      subscriptionTier: ""
    },
    formErrors: {},
  });

  const fetchTiers = useCallback(async () => {
    try {
      const token = localStorage.getItem("merchantAccessToken");
      const response = await axios.get(`${apiURL}/dropdowns/subscription-tiers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status === "OK") {
        setSubscriptionTiers(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching tiers:", error);
    }
  }, []);

  const handleTierSelect = useCallback((tierName) => {
    setModalState((prev) => ({
      ...prev,
      formData: { ...prev.formData, subscriptionTier: tierName },
      formErrors: { ...prev.formErrors, subscriptionTier: "" },
    }));
  }, []);

  useEffect(() => {
    fetchTiers();
  }, [fetchTiers]);

  const [userShopData, setUserShopData] = useState({
    userOwnedShop: null,
    loadingUserShop: false,
  });

  const [notification, setNotification] = useState(null);
  const [error, setError] = useState("");

  const [shopProducts, setShopProducts] = useState({});
  const [userProducts, setUserProducts] = useState([]);

  const pageSize = 12;
  const navigate = useNavigate();
  const searchTimeoutRef = useRef(null);
  const apiCache = useRef(new Map());

  const { shops, totalElements, totalPages, currentPage } = shopsData;
  const { loading, searchLoading, createLoading } = loadingStates;
  const { searchTerm, lastSearchTerm, sortBy, sortDirection } = searchState;
  const { showCreateModal, formData, formErrors } = modalState;
  const { userOwnedShop, loadingUserShop } = userShopData;

  const hasMerchantAccess = useMemo(() => hasMerchantAccount(), []);

  const processedShops = useMemo(() => {
    if (!userOwnedShop) return shops;

    return shops.map((shop) => ({
      ...shop,
      isUserShop: shop.id === userOwnedShop.id,
    }));
  }, [shops, userOwnedShop]);

  const fetchUserShop = useCallback(async () => {
    if (!hasMerchantAccess) {
      return;
    }

    try {
      setUserShopData((prev) => ({ ...prev, loadingUserShop: true }));

      const token = localStorage.getItem("merchantAccessToken");

      if (!token) {
        console.error("❌ No merchant token found");
        setUserShopData((prev) => ({ ...prev, userOwnedShop: null }));
        return;
      }

      const dashboardResponse = await axios.get(
        `${apiURL}/merchant/shops/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (
        dashboardResponse.data.status === "OK" &&
        dashboardResponse.data.data?.shopName
      ) {
        const shopName = dashboardResponse.data.data.shopName;

        const shopResponse = await axios.get(
          `${apiURL}/shops/name/${encodeURIComponent(shopName)}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (shopResponse.data.status === "OK" && shopResponse.data.data) {
          const mergedShopData = {
            ...shopResponse.data.data,
            ...dashboardResponse.data.data,
            id: shopResponse.data.data.id,
          };

          setUserShopData((prev) => ({
            ...prev,
            userOwnedShop: mergedShopData,
          }));
        } else {
          setUserShopData((prev) => ({ ...prev, userOwnedShop: null }));
        }
      } else {
        setUserShopData((prev) => ({ ...prev, userOwnedShop: null }));
      }
    } catch (error) {
      if (error.response?.status === 403) {
        console.error("🔒 Access denied - check authentication/authorization");
      } else if (error.response?.status === 401) {
        console.error("🔑 Unauthorized - token may be invalid");
      }

      setUserShopData((prev) => ({ ...prev, userOwnedShop: null }));
    } finally {
      setUserShopData((prev) => ({ ...prev, loadingUserShop: false }));
    }
  }, [hasMerchantAccess]);

  const fetchUserProducts = useCallback(async () => {
    if (!hasMerchantAccess || !userOwnedShop?.id) {
      return;
    }

    const token = localStorage.getItem("merchantAccessToken");

    try {
      const response = await axios.get(`${apiURL}/merchant/products`, {
        params: {
          pageable: JSON.stringify({
            page: 0,
            size: 100,
            sort: "createdAt,desc",
          }),
        },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.status === "OK" && response.data.data) {
        const products = response.data.data.content || [];

        setUserProducts(products);

        setShopProducts((prev) => {
          const newShopProducts = {
            ...prev,
            [userOwnedShop.id]: products,
          };
          return newShopProducts;
        });
      } else {
        setUserProducts([]);
        setShopProducts((prev) => ({
          ...prev,
          [userOwnedShop.id]: [],
        }));
      }
    } catch (err) {
      console.error("Error fetching user products:", err);
      setUserProducts([]);
      if (userOwnedShop?.id) {
        setShopProducts((prev) => ({
          ...prev,
          [userOwnedShop.id]: [],
        }));
      }
    }
  }, [hasMerchantAccess, userOwnedShop]);

  const getShopProducts = useCallback(
    (shopId) => {
      if (shopId === userOwnedShop?.id) {
        const result = shopProducts[shopId] || userProducts;
        return result;
      }

      return [];
    },
    [shopProducts, userProducts, userOwnedShop?.id],
  );

  const fetchShops = useCallback(
    async (searchQuery = "", showLoader = true) => {
      const cacheKey = JSON.stringify({
        searchQuery,
        page: currentPage,
        size: pageSize,
        sort: `${sortBy},${sortDirection}`,
      });

      if (apiCache.current.has(cacheKey)) {
        const cachedData = apiCache.current.get(cacheKey);
        setShopsData(cachedData);
        return;
      }

      try {
        setLoadingStates((prev) => ({
          ...prev,
          loading: showLoader,
          searchLoading: !showLoader,
        }));
        setError("");

        const params = {
          page: currentPage,
          size: pageSize,
          sort: `${sortBy},${sortDirection}`,
        };

        if (searchQuery.trim()) {
          params.shopName = searchQuery.trim();
        }

        const response = await axios.get(`${apiURL}/shops`, {
          params,
          headers: { "Content-Type": "application/json" },
        });

        if (response.data.status === "OK" && response.data.data) {
          const pageData = response.data.data;
          let allShops = pageData.content || [];

          if (searchQuery.trim()) {
            const searchLower = searchQuery.toLowerCase().trim();
            allShops = allShops.filter(
              (shop) =>
                shop.shopName &&
                shop.shopName.toLowerCase().includes(searchLower),
            );
          }

          const newData = {
            shops: allShops,
            totalPages: searchQuery.trim() ? 1 : pageData.totalPages || 1,
            totalElements: searchQuery.trim()
              ? allShops.length
              : pageData.totalElements || 0,
            currentPage: searchQuery.trim()
              ? 0
              : pageData.pageable?.pageNumber || 0,
          };

          setShopsData(newData);
          setSearchState((prev) => ({ ...prev, lastSearchTerm: searchQuery }));

          apiCache.current.set(cacheKey, newData);

          if (apiCache.current.size > 50) {
            const firstKey = apiCache.current.keys().next().value;
            apiCache.current.delete(firstKey);
          }
        }
      } catch (error) {
        console.error("Error fetching shops:", error);
        setError("Failed to load shops. Please try again.");
        setShopsData((prev) => ({ ...prev, shops: [] }));
      } finally {
        setLoadingStates((prev) => ({
          ...prev,
          loading: false,
          searchLoading: false,
        }));
      }
    },
    [currentPage, sortBy, sortDirection],
  );

  const handleSortChange = useCallback((field, direction) => {
    setSearchState((prev) => ({
      ...prev,
      sortBy: field,
      sortDirection: direction,
    }));
    setShopsData((prev) => ({ ...prev, currentPage: 0 }));
    apiCache.current.clear();
  }, []);

  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage >= 0 && newPage < totalPages) {
        setShopsData((prev) => ({ ...prev, currentPage: newPage }));
      }
    },
    [totalPages],
  );

  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchState((prev) => ({ ...prev, searchTerm: value }));
  }, []);

  const handleManualSearch = useCallback(
    (e) => {
      e.preventDefault();
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
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
    (shopId, isUserShop = false) => {
      if (isUserShop) {
        navigate(`/merchant/shops/${shopId}/dashboard`);
      } else {
        navigate(`/shop/${shopId}`);
      }
    },
    [navigate],
  );

  const handleGoToDashboard = useCallback(() => {
    if (userOwnedShop?.id) {
      navigate(`/merchant/shops/${userOwnedShop.id}/dashboard`);
    } else {
      navigate("/merchant/dashboard");
    }
  }, [navigate, userOwnedShop]);

  const handleCreateShop = useCallback(() => {
    setModalState((prev) => ({ ...prev, showCreateModal: true }));
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalState((prev) => ({
      ...prev,
      showCreateModal: false,
      formData: { shopName: "", description: "" },
      formErrors: {},
    }));
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setModalState((prev) => ({
      ...prev,
      formData: { ...prev.formData, [name]: value },
      formErrors: { ...prev.formErrors, [name]: "" },
    }));
  }, []);

  const handleSubmitShop = useCallback(
    async (e) => {
      e.preventDefault();

      const errors = {};
      if (!formData.shopName.trim()) {
        errors.shopName = "Shop name is required";
      }
      if (!formData.description.trim()) {
        errors.description = "Description is required";
      }
      if (!formData.subscriptionTier) {
        errors.subscriptionTier = "Please select a subscription plan!"
      }

      if (Object.keys(errors).length > 0) {
        setModalState((prev) => ({ ...prev, formErrors: errors }));
        return;
      }

      try {
        setLoadingStates((prev) => ({ ...prev, createLoading: true }));

        const response = await axios.post(`${apiURL}/users/me/shop`, formData, {
          headers: { "Content-Type": "application/json" },
        });

        if (response.data.status === "OK") {
          setNotification({
            message: "Shop created successfully!",
            type: "success",
          });
          handleCloseModal();
          fetchShops("", false);
          fetchUserShop();
        }
      } catch (error) {
        console.error("Error creating shop:", error);
        setNotification({
          message: "Failed to create shop. Please try again.",
          type: "error",
        });
      } finally {
        setLoadingStates((prev) => ({ ...prev, createLoading: false }));
      }
    },
    [formData, handleCloseModal, fetchShops, fetchUserShop],
  );

  const hideNotification = useCallback(() => {
    setNotification(null);
  }, []);

  useEffect(() => {
    if (hasMerchantAccess) {
      fetchUserShop();
    }
    fetchShops(lastSearchTerm, true);
  }, [fetchShops, fetchUserShop, lastSearchTerm, hasMerchantAccess]);

  useEffect(() => {
    if (hasMerchantAccess && userOwnedShop?.id) {
      fetchUserProducts();
    }
  }, [hasMerchantAccess, userOwnedShop?.id, fetchUserProducts]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm === "") {
      setShopsData((prev) => ({ ...prev, currentPage: 0 }));
      fetchShops("", false);
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      setShopsData((prev) => ({ ...prev, currentPage: 0 }));
      fetchShops(searchTerm, false);
    }, 800);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, fetchShops]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  if (loading) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-6 text-gray-600 font-medium">
              {loadingUserShop
                ? "Loading your shop data..."
                : "Discovering amazing shops..."}
            </p>
          </div>
        </div>
        <Footer />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Header />

      <Notification notification={notification} onClose={hideNotification} />

      <CreateShopModal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        formData={formData}
        formErrors={formErrors}
        isLoading={createLoading}
        onSubmit={handleSubmitShop}
        onInputChange={handleInputChange}
        subscriptionTiers={subscriptionTiers}
        onTierSelect={handleTierSelect}
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Discover Amazing Shops
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">
              Explore a curated collection of unique stores offering quality
              products and exceptional service
            </p>

            {hasMerchantAccess && userOwnedShop && (
              <div className="mt-8">
                <button
                  onClick={handleGoToDashboard}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <i className="fa-solid fa-tachometer-alt mr-3"></i>
                  Go to Your Shop Dashboard
                </button>
              </div>
            )}
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
                      placeholder="Search for shops by name..."
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

            <div className="flex flex-col lg:flex-row gap-8">
              <FilterSidebar
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSortChange={handleSortChange}
                shops={shops}
                totalElements={totalElements}
                lastSearchTerm={lastSearchTerm}
                hasMerchantAccess={hasMerchantAccess}
                onCreateShop={handleCreateShop}
                userOwnedShop={userOwnedShop}
                onGoToDashboard={handleGoToDashboard}
              />

              <div className="flex-1 min-w-0">
                {error ? (
                  <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12 text-center border border-red-100 transform transition-all duration-300">
                    <div className="text-red-500 mb-6">
                      <i className="fa-solid fa-exclamation-triangle text-4xl lg:text-6xl"></i>
                    </div>
                    <h3 className="text-xl lg:text-2xl font-bold text-gray-800 mb-4">
                      Oops! Something went wrong
                    </h3>
                    <p className="text-gray-600 mb-8 text-base lg:text-lg">
                      {error}
                    </p>
                    <button
                      onClick={() => fetchShops(lastSearchTerm, false)}
                      className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 lg:px-8 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105"
                    >
                      <i className="fa-solid fa-refresh mr-2"></i>
                      Try Again
                    </button>
                  </div>
                ) : searchLoading && shops.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-lg p-12 lg:p-16 text-center transform transition-all duration-300">
                    <div className="text-emerald-500 mb-8">
                      <i className="fa-solid fa-search text-6xl lg:text-8xl animate-pulse"></i>
                    </div>
                    <h3 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-6">
                      Searching for shops...
                    </h3>
                    <p className="text-gray-600 text-base lg:text-lg">
                      Please wait while we find blogs matching {searchTerm}
                    </p>
                  </div>
                ) : shops.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-lg p-12 lg:p-16 text-center transform transition-all duration-300">
                    <div className="text-gray-300 mb-8">
                      <i className="fa-solid fa-store text-6xl lg:text-8xl"></i>
                    </div>
                    <h3 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-6">
                      {lastSearchTerm ? "No shops found" : "No shops available"}
                    </h3>
                    <p className="text-gray-600 mb-10 max-w-lg mx-auto text-base lg:text-lg leading-relaxed">
                      {lastSearchTerm
                        ? `We couldn't find any shops matching "${lastSearchTerm}". Please try a different search term or browse all shops.`
                        : "Be the pioneer! Create the first shop and start your entrepreneurial journey with us."}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      {lastSearchTerm && (
                        <button
                          onClick={handleClearSearch}
                          className="inline-flex items-center bg-gray-600 text-white px-6 lg:px-8 py-3 rounded-xl font-semibold hover:bg-gray-700 transition-all duration-300"
                        >
                          <i className="fa-solid fa-times mr-2"></i>
                          Clear Search
                        </button>
                      )}
                      {hasMerchantAccess && !userOwnedShop && (
                        <button
                          onClick={handleCreateShop}
                          className="inline-flex items-center bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-8 lg:px-10 py-3 lg:py-4 rounded-xl font-semibold text-base lg:text-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <i className="fa-solid fa-plus mr-2 lg:mr-3"></i>
                          Create Your Shop
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4 sm:gap-6 lg:gap-8 mb-8 lg:mb-12 transition-all duration-300 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
                      {processedShops.map((shop, index) => (
                        <ShopCard
                          key={shop.id || index}
                          shop={shop}
                          index={index}
                          onVisit={handleShopVisit}
                          currentUserShop={shop.isUserShop}
                          products={getShopProducts(shop.id)}
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
