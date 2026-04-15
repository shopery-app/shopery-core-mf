import React, { Suspense, lazy, memo, useState, useCallback, useEffect } from "react";
import { useProducts } from "../../hooks/useProducts";
import useCart from "../../hooks/useCart";
import useWishlist from "../../hooks/useWishlist";
import axios from "axios";
import { apiURL } from "../../Backend/Api/api";

const fmt = (n) => Number(n || 0).toFixed(2);

const Header = lazy(() => import("../Header"));
const Footer = lazy(() => import("../Footer"));

const LoadingSpinner = memo(() => (
  <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-emerald-500 mx-auto"></div>
));
LoadingSpinner.displayName = "LoadingSpinner";

const ProductCard = memo(({ product }) => {
  const { addToCart, isItemInCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [imgError, setImgError] = useState(false);

  const id = product?.id;
  const name = product?.productName || "Product";
  const description = product?.description || "";
  const imageUrl = product?.imageUrl || "";
  const currentPrice = Number(product?.currentPrice || product?.price || 0);
  const originalPrice = Number(product?.discountDto?.originalPrice || product?.originalPrice || 0);
  const discountPct = product?.discountDto?.percentage ||
      (originalPrice > currentPrice
          ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
          : 0);
  const stock = product?.stockQuantity;
  const inStock = stock === undefined || stock === null ? true : stock > 0;
  const maxQty = stock > 0 ? stock : 99;
  const inCart = isItemInCart(id);
  const inWish = isInWishlist(id);

  const handleWishlist = useCallback(
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(id);
      },
      [toggleWishlist, id]
  );

  const handleAddToCart = useCallback(
      async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!inStock) return;
        setAdding(true);
        await addToCart(id, qty, {
          id,
          productName: name,
          imageUrl,
          currentPrice,
          originalPrice,
          discountPct,
          stockQuantity: stock,
          category: product?.category,
        });
        setAdding(false);
      },
      [addToCart, id, qty, name, imageUrl, currentPrice, inStock, stock]
  );

  const incQty = (e) => { e.stopPropagation(); setQty((q) => Math.min(q + 1, maxQty)); };
  const decQty = (e) => { e.stopPropagation(); setQty((q) => Math.max(q - 1, 1)); };

  return (
      <div style={styles.card}>
        {/* Image */}
        <div style={styles.imageWrap}>
          {!imgError && imageUrl ? (
              <img
                  src={imageUrl}
                  alt={name}
                  style={styles.image}
                  onError={() => setImgError(true)}
                  loading="lazy"
              />
          ) : (
              <div style={styles.imagePlaceholder}>
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <rect x="4" y="6" width="28" height="24" rx="3" stroke="#C4BFB4" strokeWidth="1.5"/>
                  <circle cx="13" cy="15" r="3" stroke="#C4BFB4" strokeWidth="1.5"/>
                  <path d="M4 26l8-7 6 6 5-4 9 6" stroke="#C4BFB4" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
              </div>
          )}

          {/* Discount badge */}
          {discountPct > 0 && (
              <div style={styles.discountBadge}>
                <span style={styles.discountText}>−{discountPct}%</span>
              </div>
          )}

          {/* Out of stock overlay */}
          {!inStock && (
              <div style={styles.outOfStockOverlay}>
                <span style={styles.outOfStockText}>Out of Stock</span>
              </div>
          )}

          {/* Wishlist button */}
          <button
              onClick={handleWishlist}
              style={{
                ...styles.wishBtn,
                background: inWish ? "#1A1A18" : "rgba(255,255,255,0.92)",
                color: inWish ? "#FAFAF8" : "#1A1A18",
              }}
              title={inWish ? "Remove from wishlist" : "Add to wishlist"}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill={inWish ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={styles.body}>
          {product?.category && (
              <span style={styles.categoryChip}>
            {typeof product.category === "object" ? product.category.name : product.category}
          </span>
          )}

          <h3 style={styles.name} title={name}>{name}</h3>

          {description && (
              <p style={styles.description}>{description}</p>
          )}

          {/* Price row */}
          <div style={styles.priceRow}>
            <span style={styles.price}>${fmt(currentPrice)}</span>
            {originalPrice > currentPrice && (
                <span style={styles.originalPrice}>${fmt(originalPrice)}</span>
            )}
            {discountPct > 0 && (
                <span style={styles.saveBadge}>Save ${fmt(originalPrice - currentPrice)}</span>
            )}
          </div>

          {/* Stock indicator */}
          {stock !== undefined && stock !== null && (
              <div style={styles.stockRow}>
                {inStock ? (
                    <>
                      <span style={styles.stockDot(true)} />
                      <span style={styles.stockText(true)}>
                  {stock <= 5 ? `Only ${stock} left` : `${stock} in stock`}
                </span>
                    </>
                ) : (
                    <>
                      <span style={styles.stockDot(false)} />
                      <span style={styles.stockText(false)}>Out of stock</span>
                    </>
                )}
              </div>
          )}

          {/* Quantity selector + Add to cart */}
          {inStock && (
              <div style={styles.actions}>
                <div style={styles.qtyControl}>
                  <button onClick={decQty} disabled={qty <= 1} style={styles.qtyBtn(qty <= 1)}>−</button>
                  <span style={styles.qtyVal}>{qty}</span>
                  <button onClick={incQty} disabled={qty >= maxQty} style={styles.qtyBtn(qty >= maxQty)}>+</button>
                </div>

                <button
                    onClick={handleAddToCart}
                    disabled={adding || !inStock}
                    style={{
                      ...styles.addBtn,
                      background: inCart ? "#2C6E49" : "#1A1A18",
                      opacity: adding ? 0.7 : 1,
                      cursor: adding ? "not-allowed" : "pointer",
                    }}
                >
                  {adding ? (
                      <span style={styles.spinner} />
                  ) : inCart ? (
                      <>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                        In Cart
                      </>
                  ) : (
                      <>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                        Add to Cart
                      </>
                  )}
                </button>
              </div>
          )}

          {!inStock && (
              <div style={styles.outOfStockBtn}>Unavailable</div>
          )}
        </div>
      </div>
  );
});

ProductCard.displayName = "ProductCard";
export { ProductCard };

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

  const displayProducts = filteredProducts?.length ? filteredProducts : products;

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

const styles = {
  card: {
    background: "#FFFFFF",
    border: "1px solid #ECEAE4",
    borderRadius: "16px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    transition: "box-shadow 0.2s, transform 0.2s",
    cursor: "default",
    fontFamily: "'Instrument Sans', sans-serif",
    position: "relative",
  },
  imageWrap: {
    position: "relative",
    width: "100%",
    paddingBottom: "68%",
    background: "#F7F6F3",
    overflow: "hidden",
  },
  image: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.35s",
  },
  imagePlaceholder: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  discountBadge: {
    position: "absolute",
    top: "12px",
    left: "12px",
    background: "#E8321C",
    borderRadius: "8px",
    padding: "4px 10px",
    display: "flex",
    alignItems: "center",
    gap: "2px",
    boxShadow: "0 2px 8px rgba(232,50,28,0.35)",
  },
  discountText: {
    color: "#FFFFFF",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.03em",
  },
  outOfStockOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(250,250,248,0.75)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(2px)",
  },
  outOfStockText: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#6B6B65",
    letterSpacing: "0.06em",
  },
  wishBtn: {
    position: "absolute",
    top: "12px",
    right: "12px",
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.18s",
    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
  },
  body: {
    padding: "16px 18px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    flex: 1,
  },
  categoryChip: {
    display: "inline-block",
    fontSize: "10px",
    fontWeight: 600,
    letterSpacing: "0.06em",
    color: "#6B6B65",
    background: "#F0EDE8",
    borderRadius: "6px",
    padding: "3px 9px",
    alignSelf: "flex-start",
    textTransform: "uppercase",
  },
  name: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: "16px",
    fontWeight: 400,
    color: "#1A1A18",
    margin: 0,
    lineHeight: 1.3,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  description: {
    fontSize: "12px",
    color: "#9B9B94",
    margin: 0,
    lineHeight: 1.5,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  priceRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
    marginTop: "4px",
  },
  price: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#1A1A18",
    fontFamily: "'DM Serif Display', serif",
  },
  originalPrice: {
    fontSize: "13px",
    color: "#B0ADA5",
    textDecoration: "line-through",
  },
  saveBadge: {
    fontSize: "10px",
    fontWeight: 600,
    color: "#2C6E49",
    background: "#E8F5EE",
    borderRadius: "6px",
    padding: "2px 7px",
    letterSpacing: "0.03em",
  },
  stockRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  stockDot: (ok) => ({
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: ok ? "#2C6E49" : "#C4BFB4",
    flexShrink: 0,
  }),
  stockText: (ok) => ({
    fontSize: "11px",
    fontWeight: 500,
    color: ok ? "#2C6E49" : "#9B9B94",
  }),
  actions: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "6px",
  },
  qtyControl: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #ECEAE4",
    borderRadius: "10px",
    overflow: "hidden",
  },
  qtyBtn: (disabled) => ({
    width: "32px",
    height: "32px",
    border: "none",
    background: disabled ? "#F7F6F3" : "#FFFFFF",
    color: disabled ? "#C4BFB4" : "#1A1A18",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "16px",
    fontWeight: 400,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.12s",
  }),
  qtyVal: {
    minWidth: "28px",
    textAlign: "center",
    fontSize: "13px",
    fontWeight: 600,
    color: "#1A1A18",
    borderLeft: "1px solid #ECEAE4",
    borderRight: "1px solid #ECEAE4",
    lineHeight: "32px",
  },
  addBtn: {
    flex: 1,
    height: "32px",
    border: "none",
    borderRadius: "10px",
    color: "#FAFAF8",
    fontSize: "12px",
    fontWeight: 600,
    letterSpacing: "0.03em",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    transition: "background 0.15s, transform 0.1s",
    fontFamily: "'Instrument Sans', sans-serif",
  },
  outOfStockBtn: {
    marginTop: "6px",
    height: "34px",
    background: "#F0EDE8",
    borderRadius: "10px",
    color: "#9B9B94",
    fontSize: "12px",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    letterSpacing: "0.04em",
  },
  spinner: {
    width: "12px",
    height: "12px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#FFFFFF",
    borderRadius: "50%",
    animation: "spin 0.6s linear infinite",
    display: "inline-block",
  },
};
