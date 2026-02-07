import React, {
  useState,
  useEffect,
  useCallback,
  memo,
  lazy,
  Suspense,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { apiURL } from "../../Backend/Api/api";
import useCart from "../../hooks/useCart";
import useProducts from "../../hooks/useProducts";

const Header = lazy(() => import("../Header"));
const Footer = lazy(() => import("../Footer"));

const LoadingSpinner = memo(() => (
  <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-emerald-500 mx-auto"></div>
));
LoadingSpinner.displayName = "LoadingSpinner";

const ProductCard = memo(({ product, onAddToCart, isInCart, cartQuantity }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const handleAddClick = useCallback(
    (e) => {
      e.preventDefault();
      onAddToCart(product);
    },
    [onAddToCart, product],
  );
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
      <div className="flex items-center justify-center bg-gray-200 w-full aspect-[4/3] rounded-lg overflow-hidden">
        {!imageError && product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.productName}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <i className="fa-solid fa-image text-4xl text-gray-300"></i>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-800 mb-2 truncate">
          {product.productName}
        </h3>
        <p className="text-gray-600 text-sm mb-3 h-12 overflow-hidden">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-emerald-600">
            ${product.currentPrice}
          </div>
          <button
            onClick={handleAddClick}
            disabled={isInCart}
            className={`py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              isInCart
                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                : "bg-emerald-600 text-white hover:bg-emerald-700 transform hover:scale-105 shadow-lg"
            }`}
          >
            {isInCart ? (
              <>
                <i className="fa-solid fa-check"></i>
                In Cart ({cartQuantity})
              </>
            ) : (
              <>
                <i className="fa-solid fa-cart-plus"></i>
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});
ProductCard.displayName = "ProductCard";

const ShopActions = memo(({ onAction }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
      <i className="fa-solid fa-shopping-bag mr-2 text-emerald-600"></i>
      Shop Actions
    </h3>
    <div className="grid grid-cols-2 gap-3">
      <button
        onClick={() => onAction("contact-shop")}
        className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center group"
      >
        <i className="fa-solid fa-envelope text-2xl text-gray-600 group-hover:text-blue-600 mb-2 block"></i>
        <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
          Contact Shop
        </span>
      </button>
      <button
        onClick={() => onAction("view-reviews")}
        className="p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-center group"
      >
        <i className="fa-solid fa-star text-2xl text-gray-600 group-hover:text-purple-600 mb-2 block"></i>
        <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">
          Reviews
        </span>
      </button>
    </div>
  </div>
));
ShopActions.displayName = "ShopActions";

const FeaturedProducts = memo(({ products }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-bold text-gray-800 flex items-center">
        <i className="fa-solid fa-star mr-2 text-emerald-600"></i>
        Featured Products
      </h3>
      <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
        View All
      </button>
    </div>
    {products && products.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {products.slice(0, 2).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    ) : (
      <div className="text-center py-8">
        <i className="fa-solid fa-box text-4xl text-gray-300 mb-3"></i>
        <p className="text-gray-600">No products available yet</p>
        <p className="text-gray-500 text-sm mt-1">
          Check back later for amazing products!
        </p>
      </div>
    )}
  </div>
));
FeaturedProducts.displayName = "FeaturedProducts";

const ShopDetail = memo(() => {
  const { shopId } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [shopData, setShopData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);

  const { addToCart, isItemInCart, getItemQuantity } = useCart();

  const fetchShopData = useCallback(async () => {
    if (!shopId) {
      navigate("/shops");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`${apiURL}/shops/id/${shopId}`, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.data.status === "OK" && response.data.data) {
        setShopData(response.data.data);
      } else {
        setError("Shop not found.");
      }
    } catch (error) {
      console.error("Error fetching shop data:", error);
      if (error.response?.status === 404) {
        setError("Shop not found.");
      } else {
        setError("Failed to load shop data. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [shopId, navigate]);

  const handleAddToCart = useCallback(
    (product, quantity = 1) => {
      addToCart(product.id, quantity, {
        id: product.id,
        productName: product.productName,
        description: product.description,
        currentPrice: product.currentPrice,
        originalPrice: product.originalPrice,
        imageUrl: product.imageUrl,
        condition: product.condition,
        category: product.category,
      });
    },
    [addToCart],
  );

  const handleShopAction = useCallback((action) => {}, []);

  const handleBackToShops = useCallback(() => {
    navigate("/shops");
  }, [navigate]);

  const handleContactShop = useCallback(() => {}, []);

  const handleShareShop = useCallback(() => {
    if (navigator.share && shopData) {
      navigator
        .share({
          title: shopData.shopName,
          text: shopData.description,
          url: window.location.href,
        })
        .catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  }, [shopData]);

  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    const token = localStorage.getItem("merchantAccessToken");
    try {
      const response = await axios.get(`${apiURL}/products`, {
        params: {
          pageable: JSON.stringify({
            page: 0,
            size: 12,
            sort: "createdAt,desc",
          }),
        },

        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.status === "OK" && response.data.data) {
        setProducts(response.data.data.content);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShopData();
    fetchProducts();
  }, [fetchShopData, fetchProducts]);

  useEffect(() => {
    if (search.trim() === "") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(
        products.filter(
          (p) =>
            p.productName.toLowerCase().includes(search.toLowerCase()) ||
            p.description.toLowerCase().includes(search.toLowerCase()),
        ),
      );
    }
  }, [search, products]);

  if (loading) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-6 text-gray-600 font-medium">
              Loading shop details...
            </p>
          </div>
        </div>
        <Footer />
      </Suspense>
    );
  }

  if (error || !shopData) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-red-500 mb-6">
              <i className="fa-solid fa-store-slash text-6xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Shop Not Found
            </h3>
            <p className="text-gray-600 mb-6">
              {error ||
                "The shop you're looking for doesn't exist or has been removed."}
            </p>
            <button
              onClick={handleBackToShops}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300"
            >
              <i className="fa-solid fa-arrow-left mr-2"></i>
              Back to Shops
            </button>
          </div>
        </div>
        <Footer />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Header />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {/* Shop Banner */}
        <div className="relative bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-14 shadow-lg">
          <div className="absolute inset-0 opacity-10 bg-[url('/shop-bg.svg')] bg-cover bg-center pointer-events-none"></div>
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="bg-white rounded-full p-2 shadow-lg">
                <i className="fa-solid fa-store text-4xl text-emerald-600"></i>
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold drop-shadow-lg">
                  {shopData.shopName}
                </h1>
                <p className="text-emerald-100 mt-2 text-lg font-medium">
                  Welcome to our shop
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6 md:mt-0">
              <button
                onClick={handleContactShop}
                className="bg-white text-emerald-600 px-6 py-3 rounded-xl font-semibold hover:bg-emerald-50 transition-all duration-300 flex items-center gap-2 shadow"
              >
                <i className="fa-solid fa-envelope"></i>
                Contact Shop
              </button>
              <button
                onClick={handleShareShop}
                className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-400 transition-all duration-300 flex items-center gap-2 shadow"
              >
                <i className="fa-solid fa-share"></i>
                Share
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="mb-10">
            <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col md:flex-row items-center gap-4">
              <div className="flex-1 w-full">
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search for products by name or description..."
                    className="w-full py-4 pl-12 pr-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg transition"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                    <i className="fa-solid fa-magnifying-glass"></i>
                  </span>
                </div>
              </div>
              <button
                className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow hover:bg-emerald-700 transition flex items-center gap-2"
                onClick={() => setSearch(search)}
              >
                <i className="fa-solid fa-search"></i> Search
              </button>
            </div>
          </div>

          <div className="mt-12 mb-10">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <i className="fa-solid fa-box text-emerald-600"></i>
                  Browse Products
                </h3>
                <div className="flex gap-2">
                  <button className="px-4 py-2 border border-gray-200 rounded-lg hover:border-emerald-500 text-sm font-medium bg-gray-50 hover:bg-emerald-50 transition flex items-center gap-2">
                    <i className="fa-solid fa-filter"></i>
                    Filter
                  </button>
                  <button className="px-4 py-2 border border-gray-200 rounded-lg hover:border-emerald-500 text-sm font-medium bg-gray-50 hover:bg-emerald-50 transition flex items-center gap-2">
                    <i className="fa-solid fa-sort"></i>
                    Sort
                  </button>
                </div>
              </div>

              {productsLoading ? (
                <LoadingSpinner />
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fa-solid fa-box text-5xl text-gray-300 mb-4"></i>
                  <p className="text-gray-600 text-lg font-medium">
                    No products found
                  </p>
                  <p className="text-gray-500 text-base mt-2">
                    Try searching with a different keyword!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      isInCart={isItemInCart(product.id)}
                      cartQuantity={getItemQuantity(product.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            <div className="lg:col-span-1">
              <ShopActions onAction={handleShopAction} />
            </div>
            <div className="lg:col-span-2">
              <FeaturedProducts products={products} />
            </div>
          </div>

          <div className="mt-8">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <i className="fa-solid fa-info-circle text-emerald-600"></i>
                About This Shop
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Shop Name</p>
                  <p className="text-gray-800 font-semibold text-lg">
                    {shopData.shopName}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-medium">Rating</p>
                  <div className="flex items-center gap-2">
                    <div className="flex text-yellow-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <i
                          key={star}
                          className="fa-solid fa-star text-base"
                        ></i>
                      ))}
                    </div>
                    <span className="text-gray-800 font-semibold">
                      {shopData.rating || "4.8"}
                    </span>
                    <span className="text-gray-500 text-sm">(127 reviews)</span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Member Since
                  </p>
                  <p className="text-gray-800 font-semibold">
                    {shopData.createdAt
                      ? new Date(shopData.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Total Products
                  </p>
                  <p className="text-gray-800 font-semibold">
                    {products.length} products
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-gray-600 text-sm font-medium">
                    Description
                  </p>
                  <p className="text-gray-800 leading-relaxed mt-1 text-base">
                    {shopData.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </Suspense>
  );
});

ShopDetail.displayName = "ShopDetail";
export default ShopDetail;
