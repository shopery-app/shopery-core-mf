import React, { Suspense, lazy, memo, useState, useCallback, useEffect } from "react";
import { useProducts } from "../../hooks/useProducts";
import { useCart } from "../../hooks/useCart";
import axios from "axios";
import { apiURL } from "../../Backend/Api/api";

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
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100 transform hover:-translate-y-1">
      <div className="relative overflow-hidden bg-gray-100 h-64">
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

        <div className="absolute top-3 right-3 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold uppercase">
          {product.condition}
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">{product.productName}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-emerald-600">${product.currentPrice?.toFixed(0)}</span>
            {product.originalPrice &&
              product.originalPrice > product.currentPrice && (
                <span className="text-lg text-gray-400 line-through">${product.originalPrice.toFixed(0)}</span>
              )}
          </div>
        </div>

        <button
          onClick={handleAddClick}
          disabled={isInCart}
          className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
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
  );
});
ProductCard.displayName = "ProductCard";

const FilterSidebar = memo(({ filters, onFilterChange, onClearFilters, categories, conditions }) => {
  const priceRanges = [
    { label: "Under $25", value: [0, 25] },
    { label: "$25 - $50", value: [25, 50] },
    { label: "$50 - $100", value: [50, 100] },
    { label: "$100 - $200", value: [100, 200] },
    { label: "Over $200", value: [200, 9999] },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 h-fit sticky top-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">Filters</h3>
        <button onClick={onClearFilters} className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">Clear All</button>
      </div>

      <div className="mb-6">
        <h4 className="font-semibold text-gray-800 mb-3">Category</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
          {categories.length > 0 ? (
            categories.map((category) => (
              <label key={category} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
                <input
                  type="radio"
                  name="category"
                  value={category}
                  checked={filters.category === category}
                  onChange={(e) => onFilterChange({ category: e.target.value })}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                />
                <span className="ml-3 text-gray-700 capitalize">{category.replace(/_/g, ' ').toLowerCase()}</span>
              </label>
            ))
          ) : (
            <p className="text-xs text-gray-400">Loading categories...</p>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-semibold text-gray-800 mb-3">Price Range</h4>
        <div className="space-y-2">
          {priceRanges.map((range) => (
            <label key={range.label} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
              <input
                type="radio"
                name="priceRange"
                value={range.label}
                checked={JSON.stringify(filters.priceRange) === JSON.stringify(range.value)}
                onChange={() => onFilterChange({ priceRange: range.value })}
                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
              />
              <span className="ml-3 text-gray-700">{range.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-semibold text-gray-800 mb-3">Condition</h4>
        <div className="space-y-2">
          {conditions.length > 0 ? (
            conditions.map((condition) => (
              <label key={condition} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
                <input
                  type="radio"
                  name="condition"
                  value={condition}
                  checked={filters.condition === condition}
                  onChange={(e) => onFilterChange({ condition: e.target.value })}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                />
                <span className="ml-3 text-gray-700 capitalize">{condition.toLowerCase()}</span>
              </label>
            ))
          ) : (
            <p className="text-xs text-gray-400">Loading conditions...</p>
          )}
        </div>
      </div>
    </div>
  );
});
FilterSidebar.displayName = "FilterSidebar";

const Products = memo(() => {
  const {
    products,
    filteredProducts,
    loading,
    error,
    filters,
    pagination,
    hasMoreProducts,
    loadProducts,
    loadMoreProducts,
    filterProducts,
    resetFilters,
    refreshProducts,
  } = useProducts();

  const { addToCart, isItemInCart, getItemQuantity } = useCart();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdAt,desc");
  const [categories, setCategories] = useState([]);
  const [conditions, setConditions] = useState([]);

  const fetchDropdowns = useCallback(async () => {
    try {
      const [catRes, condRes] = await Promise.all([
        axios.get(`${apiURL}/dropdowns/product-categories`),
        axios.get(`${apiURL}/dropdowns/product-conditions`)
      ]);

      if (catRes.data.status) setCategories(catRes.data.data);
      if (condRes.data.status) setConditions(condRes.data.data);
    } catch (error) {
      console.error("Error fetching filter options: ", error);
    }
  }, []);

  useEffect(() => {
    fetchDropdowns();
  }, [fetchDropdowns]);

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

  const handleFilterChange = useCallback(
    (newFilters) => {
      filterProducts(newFilters);
    },
    [filterProducts],
  );

  const handleClearFilters = useCallback(() => {
    resetFilters();
    setSearchTerm("");
  }, [resetFilters]);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    filterProducts({ keyword: searchTerm });
  }, [filterProducts, searchTerm]);

  const handleSortChange = useCallback(
    (newSort) => {
      setSortBy(newSort);
      loadProducts({ page: 0, sort: newSort });
    },
    [loadProducts],
  );

  const handleLoadMore = useCallback(() => {
    loadMoreProducts();
  }, [loadMoreProducts]);

  const displayProducts = products;

  if (error) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <i className="fa-solid fa-exclamation-triangle text-5xl text-red-400 mb-4"></i>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button onClick={refreshProducts} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition">Try Again</button>
          </div>
        </div>
        <Footer />
      </Suspense>
    );
  }
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Header />

      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">All Products</h1>
              <p className="text-emerald-100 text-lg mb-8">Discover amazing products with great deals</p>

              <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                <div className="flex bg-white rounded-2xl overflow-hidden shadow-lg">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for products..."
                    className="flex-1 px-6 py-4 text-gray-800 text-lg focus:outline-none"
                  />
                  <button type="submit" className="bg-emerald-600 text-white px-8 py-4 font-semibold hover:bg-emerald-700 transition flex items-center gap-2"><i className="fa-solid fa-search"></i>Search</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/4">
              <FilterSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
                categories={categories}
                conditions={conditions}
              />
            </div>

            <div className="lg:w-3/4">
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-700 font-medium">{displayProducts.length} products found</span>
                    {(filters.category ||
                      filters.condition ||
                      filters.priceRange ||
                      searchTerm) && (
                      <button onClick={handleClearFilters}className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1"><i className="fa-solid fa-times"></i>Clear Filters</button>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <select
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="createdAt,desc">Newest First</option>
                      <option value="createdAt,asc">Oldest First</option>
                      <option value="currentPrice,asc">
                        Price: Low to High
                      </option>
                      <option value="currentPrice,desc">
                        Price: High to Low
                      </option>
                      <option value="productName,asc">Name: A to Z</option>
                      <option value="productName,desc">Name: Z to A</option>
                    </select>
                  </div>
                </div>
              </div>

              {loading && products.length === 0 && (
                <div className="text-center py-20">
                  <LoadingSpinner />
                  <p className="mt-4 text-gray-600">Loading products...</p>
                </div>
              )}

              {!loading && displayProducts.length === 0 && (
                <div className="text-center py-20">
                  <i className="fa-solid fa-box-open text-5xl text-gray-300 mb-4"></i>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm ||
                    filters.category ||
                    filters.condition ||
                    filters.priceRange
                      ? "Try adjusting your search or filters"
                      : "No products are available at the moment"}
                  </p>
                  {(searchTerm ||
                    filters.category ||
                    filters.condition ||
                    filters.priceRange) && (
                    <button
                      onClick={handleClearFilters}
                      className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              )}

              {displayProducts.length > 0 && (
                <>
                  <div className="cursor-pointer grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
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

                  {hasMoreProducts && (
                    <div className="text-center mt-12">
                      <button
                        onClick={handleLoadMore}
                        disabled={loading}
                        className={`px-8 py-4 rounded-xl font-semibold text-lg transition ${
                          loading
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : "bg-emerald-600 text-white hover:bg-emerald-700 transform hover:scale-105 shadow-lg"
                        }`}
                      >
                        {loading ? (
                          <>
                            <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                            Loading...
                          </>
                        ) : (
                          <>
                            Load More Products
                            <i className="fa-solid fa-arrow-down ml-2"></i>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  <div className="text-center mt-8 text-gray-600">
                    Showing {displayProducts.length} of products
                    {hasMoreProducts && (
                      <span className="ml-2 text-emerald-600 font-medium">
                        • {pagination.totalElements - displayProducts.length}{" "}
                        more available
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </Suspense>
  );
});
Products.displayName = "Products";

export default Products;
