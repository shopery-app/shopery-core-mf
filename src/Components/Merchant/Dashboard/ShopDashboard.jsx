import React, {
  useState,
  useEffect,
  useCallback,
  memo,
  lazy,
  Suspense,
  useReducer,
} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { apiURL } from "../../../Backend/Api/api";
import { hasMerchantAccount } from "../../../utils/roleMode";
import { isJwtExpired } from "../../../utils/jwt";
import Chat from "../../Advisory/Chat";

const Header = lazy(() => import("../../Header"));
const Footer = lazy(() => import("../../Footer"));

// Performance optimizasiyası üçün product details cache
const productDetailsCache = new Map();

const LoadingSpinner = memo(() => (
  <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-emerald-500 mx-auto"></div>
));
LoadingSpinner.displayName = "LoadingSpinner";

const QuickActions = memo(({ onAction }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
      <i className="fa-solid fa-bolt mr-2 text-emerald-600"></i>
      Quick Actions
    </h3>
    <div className="grid grid-cols-2 gap-3">
      <button
        onClick={() => onAction("add-product")}
        className="p-4 border border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all text-center group"
      >
        <i className="fa-solid fa-plus text-2xl text-gray-600 group-hover:text-emerald-600 mb-2 block"></i>
        <span className="text-sm font-medium text-gray-700 group-hover:text-emerald-700">
          Add Product
        </span>
      </button>
      <button
        onClick={() => onAction("view-orders")}
        className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center group"
      >
        <i className="fa-solid fa-shopping-cart text-2xl text-gray-600 group-hover:text-blue-600 mb-2 block"></i>
        <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
          View Orders
        </span>
      </button>
      <button
        onClick={() => onAction("shop-settings")}
        className="p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-center group"
      >
        <i className="fa-solid fa-cog text-2xl text-gray-600 group-hover:text-purple-600 mb-2 block"></i>
        <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">
          Settings
        </span>
      </button>
      <button
        onClick={() => onAction("analytics")}
        className="p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all text-center group"
      >
        <i className="fa-solid fa-chart-line text-2xl text-gray-600 group-hover:text-orange-600 mb-2 block"></i>
        <span className="text-sm font-medium text-gray-700 group-hover:text-orange-700">
          Analytics
        </span>
      </button>
    </div>
  </div>
));
QuickActions.displayName = "QuickActions";

const RecentOrders = memo(() => (
  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-bold text-gray-800 flex items-center">
        <i className="fa-solid fa-receipt mr-2 text-emerald-600"></i>
        Recent Orders
      </h3>
    </div>
    <div className="text-center py-8">
      <i className="fa-solid fa-shopping-cart text-4xl text-gray-300 mb-3"></i>
      <p className="text-gray-600">No orders yet</p>
      <p className="text-gray-500 text-sm mt-1">
        Orders will appear here when customers make purchases
      </p>
    </div>
  </div>
));
RecentOrders.displayName = "RecentOrders";

// Individual product details fetch from public endpoint
const fetchProductDetails = async (productId) => {
  // Cache-də yoxla
  if (productDetailsCache.has(productId)) {
    return productDetailsCache.get(productId);
  }

  try {
    // Public endpoint istifadə edirik - token lazım deyil
    const response = await axios.get(`${apiURL}/products/${productId}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.data.status === "OK" && response.data.data) {
      const productData = response.data.data;
      // Cache-ə əlavə et
      productDetailsCache.set(productId, productData);
      return productData;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching product ${productId} details:`, error);
    return null;
  }
};

// Enhanced ProductCard with lazy loading details
const ProductCard = memo(({ product, showEditModal, onDelete }) => {
  const [detailedProduct, setDetailedProduct] = useState(product);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsLoaded, setDetailsLoaded] = useState(false);

  // Lazy load details when component mounts
  const loadProductDetails = useCallback(async () => {
    if (detailsLoaded || loadingDetails) return;

    setLoadingDetails(true);
    try {
      const details = await fetchProductDetails(product.id);
      if (details) {
        setDetailedProduct({ ...product, ...details });
        setDetailsLoaded(true);
      }
    } catch (error) {
      console.error("Error loading product details:", error);
    } finally {
      setLoadingDetails(false);
    }
  }, [product, detailsLoaded, loadingDetails]);

  // Load details on mount
  useEffect(() => {
    loadProductDetails();
  }, [loadProductDetails]);

  return (
    <div className="border border-gray-200 rounded-lg p-4 flex flex-col gap-3 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-center bg-gray-200 w-full aspect-[4/3] rounded-lg overflow-hidden">
        {detailedProduct.imageUrl ? (
          <img
            src={detailedProduct.imageUrl}
            alt={detailedProduct.productName}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <i className="fa-solid fa-image text-3xl text-gray-400"></i>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <i className="fa-solid fa-cube text-emerald-500"></i>
        <span className="font-semibold text-gray-800 truncate">
          {detailedProduct.productName}
        </span>
      </div>

      <p className="text-gray-600 text-sm line-clamp-2">
        {detailedProduct.description}
      </p>

      <div className="flex justify-between items-center mt-2">
        <span className="text-emerald-700 font-bold text-lg">
          $
          {detailedProduct.discountDto?.currentPrice ||
            detailedProduct.currentPrice ||
            detailedProduct.price ||
            "0.00"}
        </span>
        <span className="text-xs bg-gray-100 rounded-full px-2 py-1 font-medium">
          {loadingDetails ? (
            <i className="fa-solid fa-spinner fa-spin text-gray-400"></i>
          ) : (
            detailedProduct.category || "N/A"
          )}
        </span>
      </div>

      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>
          Stock:{" "}
          {loadingDetails ? (
            <i className="fa-solid fa-spinner fa-spin"></i>
          ) : detailedProduct.stockQuantity !== undefined ? (
            detailedProduct.stockQuantity
          ) : (
            "N/A"
          )}
        </span>
        <span
          className={`px-2 py-1 rounded-full ${
            detailedProduct.condition === "NEW"
              ? "bg-green-100 text-green-800"
              : detailedProduct.condition === "USED"
                ? "bg-yellow-100 text-yellow-800"
                : detailedProduct.condition === "REFURBISHED"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-800"
          }`}
        >
          {loadingDetails ? (
            <i className="fa-solid fa-spinner fa-spin"></i>
          ) : (
            detailedProduct.condition || "N/A"
          )}
        </span>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium transition-colors duration-300 flex items-center justify-center gap-2"
          onClick={() => showEditModal(detailedProduct)}
        >
          <i className="fa-solid fa-pen-to-square"></i>
          Edit
        </button>
        <button
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors duration-300 flex items-center justify-center"
          onClick={() => onDelete(detailedProduct)}
          title="Delete Product"
        >
          <i className="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>
  );
});

ProductCard.displayName = "ProductCard";

const AddProductModal = memo(
  ({ onClose, formState, handleInputChange, handleAddSubmit, open }) => {
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(false);

    const handleImageChange = useCallback((e) => {
      const file = e.target.files[0];
      if (file) {
        if (!file.type.startsWith("image/")) {
          alert("Please upload a valid image file.");
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          alert("file size must be less than 5mb.");
          return;
        }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
      } else {
        setImageFile(null);
        setImagePreview(null);
      }
    }, []);

    const uploadProductImage = async (productId, file) => {
      try {
        setIsUploading(true);
        const token = localStorage.getItem("accessToken");
        const formData = new FormData();
        formData.append("image", file);

        const response = await axios.post(
          `${apiURL}/merchant/products/${productId}/image`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          },
        );

        // Cache-i təmizlə ki, yeni şəkil göstərilsin
        productDetailsCache.delete(productId);

        return response.data;
      } catch (error) {
        console.error("Error uploading image:", error);
        setError("Failed to upload image. Please try again.");
        throw error;
      } finally {
        setIsUploading(false);
      }
    };

    const handleSubmitWithImage = async (e) => {
      e.preventDefault();

      try {
        const productResponse = await handleAddSubmit(e, true);

        if (productResponse?.productId && imageFile) {
          await uploadProductImage(productResponse.productId, imageFile);
        }

        setImageFile(null);
        setImagePreview(null);
        onClose();
      } catch (error) {
        console.error("Error submitting form with image:", error);
        setError("Failed to add product. Please try again.");
      }
    };

    useEffect(() => {
      if (!open) {
        setImageFile(null);
        setImagePreview(null);
      }
    }, [open]);

    useEffect(() => {
      return () => {
        if (imagePreview) {
          URL.revokeObjectURL(imagePreview);
        }
      };
    }, [imagePreview]);

    if (!open) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative border border-gray-100">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
          <h2 className="text-2xl font-bold mb-6 text-emerald-700 text-center">
            Add New Product
          </h2>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-exclamation-triangle"></i>
                <span>{error}</span>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmitWithImage} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name
              </label>
              <input
                name="productName"
                value={formState.productName}
                onChange={(e) => {
                  handleInputChange("productName", e.target.value);
                }}
                placeholder="Product Name"
                className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formState.description}
                onChange={(e) => {
                  handleInputChange("description", e.target.value);
                }}
                placeholder="Description"
                className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition resize-none"
                required
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condition
                </label>
                <select
                  name="condition"
                  value={formState.condition}
                  onChange={(e) => {
                    handleInputChange("condition", e.target.value);
                  }}
                  className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                >
                  <option value="NEW">NEW</option>
                  <option value="USED">USED</option>
                  <option value="REFURBISHED">REFURBISHED</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formState.category}
                  onChange={(e) => {
                    handleInputChange("category", e.target.value);
                  }}
                  className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                >
                  <option value="ELECTRONICS">ELECTRONICS</option>
                  <option value="FASHION">FASHION</option>
                  <option value="HOME">HOME</option>
                  <option value="BEAUTY">BEAUTY</option>
                  <option value="SPORTS">SPORTS</option>
                  <option value="TOYS">TOYS</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <input
                  name="price"
                  type="number"
                  value={formState.price}
                  onChange={(e) => {
                    handleInputChange("price", e.target.value);
                  }}
                  placeholder="Price"
                  className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity
                </label>
                <input
                  name="stockQuantity"
                  type="number"
                  value={formState.stockQuantity}
                  onChange={(e) => {
                    handleInputChange("stockQuantity", e.target.value);
                  }}
                  placeholder="Stock Quantity"
                  className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  required
                  min="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Image
              </label>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition">
                  <i className="fa-solid fa-upload text-emerald-600"></i>
                  <span className="text-emerald-700 font-medium">
                    Choose Image
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                      disabled={isUploading}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
              {imageFile && (
                <p className="text-sm text-gray-600 mt-1">
                  Selected: {imageFile.name}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={isUploading}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 py-2 rounded-lg w-full font-semibold shadow hover:from-emerald-700 hover:to-emerald-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                  Uploading...
                </>
              ) : (
                "Add Product"
              )}
            </button>
          </form>
        </div>
      </div>
    );
  },
);
AddProductModal.displayName = "AddProductModal";

const SuccessToast = memo(({ message, onClose }) => (
  <div className="fixed top-6 right-6 z-[9999]">
    <div className="bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-slide-in">
      <i className="fa-solid fa-circle-check text-2xl"></i>
      <span className="font-semibold">{message}</span>
      <button
        onClick={onClose}
        className="ml-4 text-white hover:text-emerald-200"
      >
        <i className="fa-solid fa-xmark"></i>
      </button>
    </div>
    <style>
      {`
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(-20px);}
          to { opacity: 1; transform: translateY(0);}
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease;
        }
      `}
    </style>
  </div>
));
SuccessToast.displayName = "SuccessToast";

const EditProductModal = memo(
  ({
    open,
    product,
    onClose,
    handleEditSubmit,
    handleInputChange,
    formState,
  }) => {
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
      if (open && product?.imageUrl) {
        setImagePreview(product.imageUrl);
      }
      if (!open) {
        setImageFile(null);
        setImagePreview(null);
        setIsSaving(false);
      }
    }, [open, product]);

    const handleImageChange = useCallback((e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 5*1024*1024) {
          alert("File size must be less than 5MB!");
          return;
        }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
      }
    }, []);

    const onSubmit = async (e) => {
      e.preventDefault();
      setIsSaving(true);
      try {
        await handleEditSubmit(e, imageFile);
        onClose();
      } catch (error) {
        console.error(error);
      } finally {
        setIsSaving(false);
      }
    }

    if (!open || !product) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative border border-gray-100">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" disabled={isSaving}><i className="fa-solid fa-xmark text-xl"></i></button>
          <h2 className="text-2xl font-bold mb-6 text-emerald-700 text-center">Edit Product</h2>
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name
              </label>
              <input
                type="text"
                name="productName"
                value={formState.productName}
                onChange={(e) => {
                  handleInputChange("productName", e.target.value);
                }}
                className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formState.description}
                onChange={(e) => {
                  handleInputChange("description", e.target.value);
                }}
                className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition resize-none"
                required
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condition
                </label>
                <select
                  name="condition"
                  value={formState.condition}
                  onChange={(e) => {
                    handleInputChange("condition", e.target.value);
                  }}
                  className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                >
                  {/* TODO We can fetch dropdowns instead of hardcoding!*/}
                  <option value="NEW">NEW</option>
                  <option value="USED">USED</option>
                  <option value="REFURBISHED">REFURBISHED</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formState.category}
                  onChange={(e) => {
                    handleInputChange("category", e.target.value);
                  }}
                  className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                >
                  {/* TODO We can fetch dropdowns instead of hardcoding!*/}
                  <option value="ELECTRONICS">ELECTRONICS</option>
                  <option value="FASHION">FASHION</option>
                  <option value="HOME">HOME</option>
                  <option value="BEAUTY">BEAUTY</option>
                  <option value="SPORTS">SPORTS</option>
                  <option value="TOYS">TOYS</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <input
                  name="price"
                  type="number"
                  value={formState.price}
                  onChange={(e) => {
                    handleInputChange("price", e.target.value);
                  }}
                  className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity
                </label>
                <input
                  name="stockQuantity"
                  type="number"
                  value={formState.stockQuantity}
                  onChange={(e) => {
                    handleInputChange("stockQuantity", e.target.value);
                  }}
                  className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  required
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Update Image</label>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition">
                  <i className="fa-solid fa-camera text-emerald-600"></i>
                  <span className="text-emerald-700 text-sm font-medium">Change Photo</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
                {imagePreview && (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                  </div>
                )}
              </div>
            </div>

            <button type="submit" disabled={isSaving} className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 py-2 rounded-lg w-full font-semibold shadow hover:from-emerald-700 hover:to-emerald-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {isSaving ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                  Updating...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </form>
        </div>
      </div>
    );
  },
);
EditProductModal.displayName = "EditProductModal";

const DeleteConfirmModal = memo(
  ({ open, productName, onConfirm, onCancel, isDeleting }) => {
    if (!open) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative border border-gray-100">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <i className="fa-solid fa-exclamation-triangle text-red-600 text-xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Delete Product
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete "{productName}"? This action
              cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={onCancel}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    Deleting...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-trash"></i>
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  },
);
DeleteConfirmModal.displayName = "DeleteConfirmModal";

// Updated ProductsSection to use ProductCard
const ProductsSection = memo(
  ({ products, showEditModal, isLoading, onDelete }) => {
    if (isLoading) {
      return (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mt-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <i className="fa-solid fa-box mr-2 text-emerald-600"></i>
            Your Products
          </h3>
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        </div>
      );
    }

    if (!products || products.length === 0) {
      return (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mt-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <i className="fa-solid fa-box mr-2 text-emerald-600"></i>
            Your Products
          </h3>
          <div className="text-center py-8">
            <i className="fa-solid fa-box-open text-4xl text-gray-300 mb-3"></i>
            <p className="text-gray-600">No products yet</p>
            <p className="text-gray-500 text-sm mt-1">
              Products you add will appear here.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mt-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <i className="fa-solid fa-box mr-2 text-emerald-600"></i>
          Your Products ({products.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              showEditModal={showEditModal}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>
    );
  },
);
ProductsSection.displayName = "ProductsSection";

const ShopDashboard = memo(() => {
  const initialState = {
    productName: "",
    description: "",
    condition: "NEW",
    category: "ELECTRONICS",
    price: "",
    stockQuantity: "",
  };

  const formReducer = (state, action) => {
    switch (action.type) {
      case "SET_INITIAL_DATA":
        return {
          ...state,
          productName: action.payload.productName || "",
          description: action.payload.description || "",
          condition: action.payload.condition || "NEW",
          category: action.payload.category || "ELECTRONICS",
          price: action.payload.price || action.payload.currentPrice || "",
          stockQuantity: action.payload.stockQuantity || "",
        };
      case "UPDATE_FIELD":
        return {
          ...state,
          [action.field]: action.value,
        };
      case "RESET_FORM":
        return initialState;
      default:
        return state;
    }
  };

  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [shopData, setShopData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editProduct, setEditProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formState, dispatch] = useReducer(formReducer, initialState);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  const hasMerchantAccess = hasMerchantAccount();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token || isJwtExpired(token)) {
      localStorage.removeItem("accessToken");
      navigate("/signin");
      return;
    }
  }, [navigate]);

  const handleQuickAction = useCallback(
    (action) => {
      switch (action) {
        case "add-product":
          setShowAddProduct(true);
          break;
        case "view-orders":
          navigate("/merchant/orders");
          break;
        case "shop-settings":
          navigate("/merchant/shop-settings");
          break;
        case "analytics":
          navigate("/merchant/analytics");
          break;
        default:
      }
    },
    [navigate],
  );

  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    const token = localStorage.getItem("accessToken");
    try {
      const response = await axios.get(`${apiURL}/merchant/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        params: {
          page: 0,
          size: 12,
          sort: "createdAt,desc",
        },
      });

      if (response.data.status === "OK" && response.data.data) {
        const productsData = response.data.data.content || [];

        productDetailsCache.clear();

        setProducts(productsData);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("acessToken");
        navigate("/signin");
      }
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }, [navigate]);

  const handleDeleteProduct = useCallback(
    async (productId) => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/signin");
        return;
      }

      try {
        setIsDeleting(true);

        const response = await axios.delete(
          `${apiURL}/merchant/products/${productId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (response.data.status === "OK") {
          setShowSuccess(true);
          setSuccessMessage("Product deleted successfully");

          productDetailsCache.delete(productId);

          await fetchProducts();

          setShowDeleteModal(false);
          setDeleteProduct(null);
        }
      } catch (err) {
        console.error("Error deleting product:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("accessToken");
          navigate("/signin");
        } else if (err.response?.status === 404) {
          setError("Product not found");
        } else if (err.response?.status === 403) {
          setError("You don't have permission to delete this product");
        } else {
          setError("Error deleting product. Please try again.");
        }
      } finally {
        setIsDeleting(false);
      }
    },
    [navigate, fetchProducts],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (deleteProduct?.id) {
      await handleDeleteProduct(deleteProduct.id);
    }
  }, [deleteProduct, handleDeleteProduct]);

  const handleDeleteClick = useCallback((prod) => {
    setDeleteProduct(prod);
    setShowDeleteModal(true);
  }, []);

  const handleCancelDelete = useCallback(() => {
    setShowDeleteModal(false);
    setDeleteProduct(null);
  }, []);

  const fetchDashboardData = useCallback(async () => {
    if (!hasMerchantAccess) {
      navigate("/shops");
      return;
    }

    const token = localStorage.getItem("accessToken");

    if (!token) {
      navigate("/signin");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const shopResponse = await axios.get(
        `${apiURL}/merchant/shops/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (shopResponse.data.status === "OK" && shopResponse.data.data) {
        setShopData(shopResponse.data.data);
      } else {
        setError("No shop data found");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("accessToken");
        navigate("/signin");
      } else if (error.response?.status === 403) {
        setError(
          "Access denied. You don't have permission to access this shop.",
        );
      } else {
        setError("Failed to load dashboard data. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [hasMerchantAccess, navigate]);

  const handleCloseAddProduct = useCallback(() => {
    setShowAddProduct(false);
    dispatch({ type: "RESET_FORM" });
  }, []);

  const handleCloseEditProduct = useCallback(() => {
    setShowEditModal(false);
    setEditProduct(null);
    dispatch({ type: "RESET_FORM" });
  }, []);

  const handleBackToShops = useCallback(() => {
    navigate("/shops");
  }, [navigate]);

  // Enhanced handleEditProduct to load full details if needed
  const handleEditProduct = useCallback(async (product) => {
    let fullProductData = product;

    // Əgər tam məlumatlar yoxdursa, public endpoint-dən fetch et
    if (!product.category || product.stockQuantity === undefined) {
      try {
        const details = await fetchProductDetails(product.id);
        if (details) {
          fullProductData = { ...product, ...details };
        }
      } catch (error) {
        console.error("Error loading product details for edit:", error);
      }
    }

    setEditProduct(fullProductData);
    dispatch({
      type: "SET_INITIAL_DATA",
      payload: fullProductData,
    });
    setShowEditModal(true);
  }, []);

  const handleInputChange = useCallback((field, value) => {
    dispatch({ type: "UPDATE_FIELD", field, value });
  }, []);

  const addProduct = useCallback(
    async (returnProductId = false) => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/signin");
        return;
      }

      if (!formState.productName.trim()) {
        setError("Product name is required");
        return;
      }
      if (!formState.description.trim()) {
        setError("Description is required");
        return;
      }
      if (!formState.price || Number(formState.price) <= 0) {
        setError("Valid price is required");
        return;
      }
      if (!formState.stockQuantity || Number(formState.stockQuantity) < 0) {
        setError("Valid stock quantity is required");
        return;
      }

      if (!shopData?.shopName) {
        setError("Shop information not found.");
        return;
      }

      setIsAddingProduct(true);
      setError("");

      try {
        const shopResponse = await axios.get(
          `${apiURL}/shops/name/${encodeURIComponent(shopData.shopName)}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (
          !(shopResponse.data.status === "OK" && shopResponse.data.data?.id)
        ) {
          setError("Failed to retrieve shop information.");
          return;
        }

        const realShopId = shopResponse.data.data.id;

        const productData = {
          productName: formState.productName.trim(),
          description: formState.description.trim(),
          condition: formState.condition,
          category: formState.category,
          price: Number(formState.price),
          stockQuantity: Number(formState.stockQuantity),
          shopId: realShopId,
        };

        const response = await axios.post(
          `${apiURL}/merchant/products`,
          productData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (response.data.status === "OK" && response.data.data) {
          const createdProduct = response.data.data;
          if (returnProductId) {
            return { productId: response.data.data.id };
          } else {
            setShowSuccess(true);
            setSuccessMessage(
              `Product "${createdProduct.productName}" added successfully!`,
            );
            await fetchProducts();
            setShowAddProduct(false);
            dispatch({ type: "RESET_FORM" });

            setTimeout(() => {
              setShowSuccess(false);
              setSuccessMessage("");
            }, 3000);
          }
        }
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("accessToken");
          navigate("/signin");
        } else if (err.response?.status === 400) {
          setError(err.response.data.message || "Invalid product data");
        } else {
          setError("Error adding product. Please try again.");
        }
        throw err;
      } finally {
        setIsAddingProduct(false);
      }
    },
    [formState, navigate, fetchProducts, shopData, dispatch],
  );

  const updateProduct = useCallback(
    async (productId, productData, imageFile) => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          navigate("/signin");
          return;
        }

        if (!productData.productName.trim()) {
          setError("Product name is required");
          return;
        }
        if (!productData.description.trim()) {
          setError("Description is required");
          return;
        }
        if (!productData.price || Number(productData.price) <= 0) {
          setError("Valid price is required");
          return;
        }
        if (Number(productData.stockQuantity) < 0) {
          setError("Stock quantity cannot be negative");
          return;
        }

        let realShopId = null;

        if (shopData?.shopName) {
          try {
            const shopResponse = await axios.get(
              `${apiURL}/shops/name/${encodeURIComponent(shopData.shopName)}`,
              {
                headers: { "Content-Type": "application/json" },
              },
            );
            if (
              shopResponse.data.status === "OK" &&
              shopResponse.data.data?.id
            ) {
              realShopId = shopResponse.data.data.id;
            }
          } catch (err) {
            console.warn("could not find shop id", err);
          }
        }

        const cleanProductData = {
          productName: productData.productName.trim(),
          description: productData.description.trim(),
          condition: productData.condition,
          category: productData.category,
          price: Number(productData.price),
          stockQuantity: Number(productData.stockQuantity),
        };

        if (realShopId) {
          cleanProductData.shopId = realShopId;
        }

        const response = await axios.put(
          `${apiURL}/merchant/products/${productId}`,
          cleanProductData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (response.data.status === "OK" && response.data.data) {
          if (imageFile) {
            const formData = new FormData();
            formData.append("image", imageFile);
            await axios.post(`${apiURL}/merchant/products/${productId}/image`, formData, {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            });
          }
          setShowSuccess(true);
          setSuccessMessage("Product updated successfully!");

          productDetailsCache.delete(productId);

          await fetchProducts();
          setShowEditModal(false);
          setEditProduct(null);
          dispatch({ type: "RESET_FORM" });
        }
      } catch (err) {
        console.error("Error updating product:", err);
        setError(err.response?.data?.message || "Failed to update product"); 
      }
    }, [navigate, fetchProducts, shopData],
  );

  const handleAddSubmit = useCallback(
    async (e, returnProductId = false) => {
      e.preventDefault();
      setError("");
      return await addProduct(returnProductId);
    },
    [addProduct],
  );

  const handleEditSubmit = useCallback(
    async (e, imageFile) => {
      e.preventDefault();
      setError("");

      const productData = {
        productName: formState.productName,
        description: formState.description,
        condition: formState.condition,
        category: formState.category,
        price: Number(formState.price),
        stockQuantity: Number(formState.stockQuantity),
      };

      await updateProduct(editProduct.id, productData, imageFile);
    },
    [formState, editProduct, updateProduct],
  );

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (loading) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-6 text-gray-600 font-medium">
              Loading your shop dashboard...
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
              <i className="fa-solid fa-exclamation-triangle text-6xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Access Denied
            </h3>
            <p className="text-gray-600 mb-6">
              {error || "You do not have access to this shop dashboard."}
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

      {error && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm">{error}</span>
              <button
                onClick={() => setError("")}
                className="text-red-700 hover:text-red-900 ml-2"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center mb-4">
                  <button
                    onClick={handleBackToShops}
                    className="mr-4 p-2 hover:bg-emerald-500 rounded-lg transition-colors"
                    title="Back to shops"
                  >
                    <i className="fa-solid fa-arrow-left text-xl"></i>
                  </button>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold">
                      {shopData?.shopName || "Shop Dashboard"}
                    </h1>
                    <p className="text-emerald-100 mt-2">Manage your shop</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-1">
              <QuickActions onAction={handleQuickAction} />
            </div>
            <div className="lg:col-span-2">
              <RecentOrders />
            </div>
          </div>

          <ProductsSection
            products={products}
            showEditModal={handleEditProduct}
            isLoading={productsLoading}
            onDelete={handleDeleteClick}
          />

          {shopData && (
            <div className="mt-8">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <i className="fa-solid fa-info-circle mr-2 text-emerald-600"></i>
                  Shop Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">
                      Shop Name
                    </p>
                    <p className="text-gray-800 font-semibold">
                      {shopData.shopName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Rating</p>
                    <p className="text-gray-800 font-semibold">
                      {shopData.rating
                        ? `${shopData.rating}/5`
                        : "No rating yet"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-medium">
                      Total Income
                    </p>
                    <p className="text-gray-800 font-semibold">
                      ${shopData.totalIncome || "0.00"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Created</p>
                    <p className="text-gray-800 font-semibold">
                      {shopData.createdAt
                        ? new Date(shopData.createdAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-gray-600 text-sm font-medium">
                      Description
                    </p>
                    <p className="text-gray-800">
                      {shopData.description || "No description provided"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="col-span-1 h-[600px]">
          <Chat />
        </div>
      </div>

      <AddProductModal
        open={showAddProduct}
        onClose={handleCloseAddProduct}
        handleAddSubmit={handleAddSubmit}
        handleInputChange={handleInputChange}
        formState={formState}
      />

      <EditProductModal
        open={showEditModal}
        product={editProduct}
        onClose={handleCloseEditProduct}
        handleEditSubmit={handleEditSubmit}
        handleInputChange={handleInputChange}
        formState={formState}
      />

      <DeleteConfirmModal
        open={showDeleteModal}
        productName={deleteProduct?.productName}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDeleting={isDeleting}
      />

      {showSuccess && (
        <SuccessToast
          message={successMessage}
          onClose={() => setShowSuccess(false)}
        />
      )}

      <Footer />
    </Suspense>
  );
});

ShopDashboard.displayName = "ShopDashboard";
export default ShopDashboard;
