import React, { memo, useCallback, useEffect, useState } from "react";
import Header from "./Header";
import Hero from "./Pages/Hero";
import Categories from "./Pages/Categories";
import Footer from "./Footer";
import "../CSS/Home.css";
import { motion } from "framer-motion";

import { useProducts } from "../hooks/useProducts";
import { useCart } from "../hooks/useCart";

const ProductShowCase = memo(() => {
  const {
    featuredProducts,
    featuredLoading,
    featuredError,
    shouldShowNotFound,
    loadFeaturedProducts,
  } = useProducts();
  const { addToCart, isItemInCart, getItemQuantity } = useCart();

  console.log("🏠 ProductShowCase render:", {
    featuredProducts: featuredProducts?.length,
    featuredLoading,
    featuredError,
    shouldShowNotFound,
  });

  useEffect(() => {
    if (featuredProducts.length === 0 && !featuredLoading) {
      loadFeaturedProducts();
    }
  }, [featuredProducts, featuredLoading, loadFeaturedProducts]);

  const handleAddToCart = useCallback(
    (product, quantity = 1) => {
      console.log("adding to cart from showcase: ", product.productName);

      addToCart(product.id, quantity, product);
    },
    [addToCart]
  );

  if (featuredLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Featured Products
            </h2>
            <div className="w-24 h-1 bg-emerald-600 mx-auto rounded-full"></div>
          </div>

          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-emerald-600"></div>
            <span className="ml-3 text-gray-600 text-lg">
              Loading featured products...
            </span>
          </div>
        </div>
      </section>
    );
  }

  if (featuredError) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Featured Products
            </h2>
            <div className="w-24 h-1 bg-emerald-600 mx-auto rounded-full"></div>
          </div>

          <div className="text-center py-20">
            <i className="fa-solid fa-exclamation-triangle text-5xl text-red-400 mb-4"></i>
            <p className="text-gray-600 text-lg mb-4">
              Failed to load featured products
            </p>
            <button
              onClick={loadFeaturedProducts}
              className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (
    shouldShowNotFound ||
    !featuredProducts ||
    featuredProducts.length === 0
  ) {
    console.log("📭 Showing not found state");
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Featured Products
            </h2>
            <div className="w-24 h-1 bg-emerald-600 mx-auto rounded-full"></div>
          </div>
          <div className="text-center py-20">
            <i className="fa-solid fa-box text-5xl text-gray-300 mb-4"></i>
            <p className="text-gray-600 text-lg mb-4">
              No featured products available at the moment
            </p>
            <button
              onClick={() => (window.location.href = "/products")}
              className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition"
            >
              Browse All Products
            </button>
          </div>
        </div>
      </section>
    );
  }

  console.log("✅ Showing featured products:", featuredProducts?.length);

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
            Featured Products
          </h2>
          <p className="text-gray-600 text-lg mb-6">
            Discover our top discounted products with amazing deals
          </p>
          <div className="w-24 h-1 bg-emerald-600 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 cursor-pointer">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              isInCart={isItemInCart(product.id)}
              cartQuantity={getItemQuantity(product.id)}
            />
          ))}
        </div>

        {featuredProducts.length > 0 && (
          <div className="text-center mt-12">
            <button
              onClick={() => (window.location.href = "/products")}
              className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              View All Products
              <i className="fa-solid fa-arrow-right ml-2"></i>
            </button>
          </div>
        )}
      </div>
    </section>
  );
});
ProductShowCase.displayName = "ProductShowCase";

const ProductCard = memo(({ product, onAddToCart, isInCart, cartQuantity }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const handleAddClick = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (product.stockQuantity !== undefined && product.stockQuantity <= 0) {
        return;
      }

      onAddToCart(product);
    },
    [onAddToCart, product]
  );

  const discountPercentage =
    product.originalPrice && product.currentPrice
      ? Math.round(
          ((product.originalPrice - product.currentPrice) /
            product.originalPrice) *
            100
        )
      : 0;

  const isOutOfStock =
    product.stockQuantity !== undefined && product.stockQuantity <= 0;

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

        {discountPercentage > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            -{discountPercentage}%
          </div>
        )}

        {product.condition && (
          <div className="absolute top-3 right-3 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold uppercase">
            {product.condition}
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-sm">
              OUT OF STOCK
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
          {product.productName}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-emerald-600">
              ${product.currentPrice?.toFixed(2)}
            </span>
            {product.originalPrice &&
              product.originalPrice > product.currentPrice && (
                <span className="text-lg text-gray-400 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
          </div>

          {product.category && (
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
              {product.category}
            </span>
          )}
        </div>

        {product.stockQuantity !== undefined && (
          <div className="text-xs mb-3">
            {product.stockQuantity > 0 ? (
              <span className="text-green-600 font-medium">
                <i className="fa-solid fa-check-circle mr-1"></i>
                {product.stockQuantity} in stock
              </span>
            ) : (
              <span className="text-red-600 font-medium">
                <i className="fa-solid fa-times-circle mr-1"></i>
                Out of stock
              </span>
            )}
          </div>
        )}

        <button
          onClick={handleAddClick}
          disabled={isOutOfStock}
          className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
            isOutOfStock
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : isInCart
              ? "bg-emerald-600 text-white hover:bg-emerald-700 transform hover:scale-105 shadow-lg"
              : "bg-emerald-600 text-white hover:bg-emerald-700 transform hover:scale-105 shadow-lg"
          }`}
        >
          {isOutOfStock ? (
            <>
              <i className="fa-solid fa-times-circle"></i>
              Out of Stock
            </>
          ) : isInCart ? (
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

const Home = () => {
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollBtn(true);
      } else {
        setShowScrollBtn(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 50,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const blogPosts = [
    {
      id: 1,
      title: "5 Ways to Keep Your Dog Healthy",
      description: "Expert tips for a happy, healthy dog.",
      image:
        "https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&h=300&fit=crop",
      author: {
        name: "Dr. Smith",
        avatar:
          "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=50&h=50&fit=crop&crop=face",
      },
      date: "March 15, 2024",
    },
    {
      id: 2,
      title: "5 Ways to Keep Your Dog Healthy",
      description: "Essential advice from veterinarians.",
      image:
        "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500&h=300&fit=crop",
      author: {
        name: "Dr. Smith",
        avatar:
          "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=50&h=50&fit=crop&crop=face",
      },
      date: "March 12, 2024",
    },
    {
      id: 3,
      title: "5 Ways to Keep Your Dog Healthy",
      description: "Practical suggestions for dog care.",
      image:
        "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500&h=300&fit=crop",
      author: {
        name: "Dr. Smith",
        avatar:
          "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=50&h=50&fit=crop&crop=face",
      },
      date: "March 10, 2024",
    },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <Header />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Hero />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Categories />
      </motion.div>

      <motion.div variants={itemVariants}>
        <ProductShowCase />
      </motion.div>

      <motion.section className="our-blog py-16" variants={itemVariants}>
        <div className="blog-wrapper bg-300 min-h-[70vh] py-16">
          <motion.div
            className="title flex justify-center items-center mb-12"
            variants={itemVariants}
          >
            <h3 className="font-bold text-3xl md:text-4xl text-gray-800 text-center">
              Visit Our Blog
            </h3>
          </motion.div>

          <motion.div
            className="blogs grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[90%] lg:max-w-[85%] m-auto px-4"
            variants={containerVariants}
          >
            {blogPosts.map((post, index) => (
              <motion.div
                key={post.id}
                className="blog-card bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer transform hover:scale-105"
                variants={{
                  hidden: { opacity: 0, y: 50 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.6,
                      delay: index * 0.2,
                      ease: "easeOut",
                    },
                  },
                }}
              >
                <div className="blog-img h-48 md:h-52 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>

                <div className="blog-content p-6">
                  <h4 className="font-bold text-lg md:text-xl text-gray-800 mb-3 line-clamp-2">
                    {post.title}
                  </h4>
                  <p className="text-gray-600 text-sm md:text-base mb-4 line-clamp-2">
                    {post.description}
                  </p>

                  <div className="blog-author flex items-center gap-3">
                    <div className="author-img w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden">
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="author-info">
                      <p className="font-medium text-gray-800 text-sm md:text-base">
                        {post.author.name}
                      </p>
                      <p className="text-xs md:text-sm text-gray-500">
                        {post.date}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div className="text-center mt-12" variants={itemVariants}>
            <button
              onClick={() => (window.location.href = "/blogs")}
              className="bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-300"
            >
              View All Posts
            </button>
          </motion.div>

        </div>
      </motion.section>

      <motion.div variants={itemVariants}>
        <Footer />
      </motion.div>
      {showScrollBtn && (
        <button
          onClick={scrollToTop}
          className="scroll-to-top-btn"
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            width: '50px',
            height: '50px',
            backgroundColor: '#ffcccb', 
            color: '#444',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease'
          }}
        >
          ↑
        </button>
      )}
    </motion.div>
  );
};

export default Home;
