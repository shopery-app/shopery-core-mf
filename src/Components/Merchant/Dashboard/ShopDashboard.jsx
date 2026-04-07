// ShopDashboard.jsx — only the changed parts shown as full file
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
import { isJwtExpired } from "../../../utils/jwt";
import useUserShop from "../../../hooks/useUserShop";
import Chat from "../../Advisory/Chat";
import SellerInbox from "../SellerInbox.jsx";

const Header = lazy(() => import("../../Header"));
const Footer = lazy(() => import("../../Footer"));

const productDetailsCache = new Map();

const LoadingSpinner = memo(() => (
    <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-emerald-500 mx-auto" />
));
LoadingSpinner.displayName = "LoadingSpinner";

const SuccessToast = memo(({ message, onClose }) => (
    <div className="fixed top-6 right-6 z-[9999]">
      <div className="bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
        <i className="fa-solid fa-circle-check text-2xl" />
        <span className="font-semibold">{message}</span>
        <button onClick={onClose} className="ml-4 text-white hover:text-emerald-200">
          <i className="fa-solid fa-xmark" />
        </button>
      </div>
    </div>
));
SuccessToast.displayName = "SuccessToast";

const QuickActions = memo(({ onAction }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
        <i className="fa-solid fa-bolt mr-2 text-emerald-600" />Quick Actions
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {[
          { key: "add-product", icon: "fa-plus", label: "Add Product", color: "emerald" },
          { key: "view-orders", icon: "fa-shopping-cart", label: "View Orders", color: "blue" },
          { key: "shop-settings", icon: "fa-cog", label: "Settings", color: "purple" },
          { key: "analytics", icon: "fa-chart-line", label: "Analytics", color: "orange" },
        ].map(({ key, icon, label, color }) => (
            <button
                key={key}
                onClick={() => onAction(key)}
                className={`p-4 border border-gray-200 rounded-lg hover:border-${color}-500 hover:bg-${color}-50 transition-all text-center group`}
            >
              <i className={`fa-solid ${icon} text-2xl text-gray-600 group-hover:text-${color}-600 mb-2 block`} />
              <span className={`text-sm font-medium text-gray-700 group-hover:text-${color}-700`}>{label}</span>
            </button>
        ))}
      </div>
    </div>
));
QuickActions.displayName = "QuickActions";

const RecentOrders = memo(() => (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
        <i className="fa-solid fa-receipt mr-2 text-emerald-600" />Recent Orders
      </h3>
      <div className="text-center py-8">
        <i className="fa-solid fa-shopping-cart text-4xl text-gray-300 mb-3 block" />
        <p className="text-gray-600">No orders yet</p>
        <p className="text-gray-500 text-sm mt-1">Orders will appear here when customers make purchases</p>
      </div>
    </div>
));
RecentOrders.displayName = "RecentOrders";

const fetchProductDetails = async (productId) => {
  if (productDetailsCache.has(productId)) return productDetailsCache.get(productId);
  try {
    const res = await axios.get(`${apiURL}/products/${productId}`);
    const data = res.data?.data ?? res.data;
    if (data && data.id) { productDetailsCache.set(productId, data); return data; }
    return null;
  } catch { return null; }
};

const ProductCard = memo(({ product, showEditModal, onDelete }) => {
  const [detail, setDetail] = useState(product);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const needsDetails = !product.category || product.stockQuantity === undefined || product.condition === undefined;
    if (!needsDetails) return;
    if (productDetailsCache.has(product.id)) {
      setDetail((p) => ({ ...p, ...productDetailsCache.get(product.id) }));
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    fetchProductDetails(product.id).then((d) => {
      if (!cancelled && d) setDetail((p) => ({ ...p, ...d }));
    }).finally(() => { if (!cancelled) setDetailLoading(false); });
    return () => { cancelled = true; };
  }, [product.id]);

  const price = detail.discountDto?.currentPrice ?? detail.currentPrice ?? detail.price ?? "0.00";

  return (
      <div className="border border-gray-200 rounded-lg p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-center bg-gray-200 w-full aspect-[4/3] rounded-lg overflow-hidden">
          {detail.imageUrl ? (
              <img src={detail.imageUrl} alt={detail.productName} className="w-full h-full object-cover" loading="lazy" />
          ) : (
              <i className="fa-solid fa-image text-3xl text-gray-400" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-cube text-emerald-500" />
          <span className="font-semibold text-gray-800 truncate">{detail.productName}</span>
        </div>
        <p className="text-gray-600 text-sm line-clamp-2">{detail.description}</p>
        <div className="flex justify-between items-center mt-2">
          <span className="text-emerald-700 font-bold text-lg">${price}</span>
          <span className="text-xs bg-gray-100 rounded-full px-2 py-1 font-medium">
                    {detailLoading ? <i className="fa-solid fa-spinner fa-spin text-gray-400" /> : (detail.category || "N/A")}
                </span>
        </div>
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Stock: {detailLoading ? <i className="fa-solid fa-spinner fa-spin" /> : (detail.stockQuantity ?? "N/A")}</span>
          <span className={`px-2 py-1 rounded-full ${
              detail.condition === "NEW" ? "bg-green-100 text-green-800"
                  : detail.condition === "USED" ? "bg-yellow-100 text-yellow-800"
                      : detail.condition === "REFURBISHED" ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
          }`}>
                    {detailLoading ? <i className="fa-solid fa-spinner fa-spin" /> : (detail.condition || "N/A")}
                </span>
        </div>
        <div className="flex gap-2 mt-3">
          <button
              onClick={() => showEditModal(detail)}
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-pen-to-square" /> Edit
          </button>
          <button
              onClick={() => onDelete(detail)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium flex items-center justify-center"
              title="Delete Product"
          >
            <i className="fa-solid fa-trash" />
          </button>
        </div>
      </div>
  );
});
ProductCard.displayName = "ProductCard";

const ProductsSection = memo(({ products, showEditModal, isLoading, onDelete }) => {
  const inner = isLoading ? (
      <div className="flex justify-center py-8"><LoadingSpinner /></div>
  ) : !products?.length ? (
      <div className="text-center py-8">
        <i className="fa-solid fa-box-open text-4xl text-gray-300 mb-3 block" />
        <p className="text-gray-600">No products yet</p>
        <p className="text-gray-500 text-sm mt-1">Products you add will appear here.</p>
      </div>
  ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => (
            <ProductCard key={p.id} product={p} showEditModal={showEditModal} onDelete={onDelete} />
        ))}
      </div>
  );

  return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mt-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <i className="fa-solid fa-box mr-2 text-emerald-600" />
          Your Products {products?.length > 0 && `(${products.length})`}
        </h3>
        {inner}
      </div>
  );
});
ProductsSection.displayName = "ProductsSection";

const AddProductModal = memo(({ open, onClose, formState, handleInputChange, handleAddSubmit }) => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) { setImageFile(null); setImagePreview(null); setError(""); }
  }, [open]);

  useEffect(() => () => { if (imagePreview) URL.revokeObjectURL(imagePreview); }, [imagePreview]);

  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Please upload a valid image file."); return; }
    if (file.size > 5 * 1024 * 1024) { alert("File size must be less than 5MB."); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }, []);

  const uploadImage = async (productId, file) => {
    const token = localStorage.getItem("accessToken");
    const fd = new FormData();
    fd.append("image", file);
    await axios.post(`${apiURL}/users/me/products/${productId}/image`, fd, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
    });
    productDetailsCache.delete(productId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsUploading(true);
    try {
      const result = await handleAddSubmit();
      if (result?.productId && imageFile) await uploadImage(result.productId, imageFile);
      setImageFile(null);
      setImagePreview(null);
      onClose();
    } catch {
      setError("Failed to add product. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!open) return null;

  return (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative border border-gray-100">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <i className="fa-solid fa-xmark text-xl" />
          </button>
          <h2 className="text-2xl font-bold mb-6 text-emerald-700 text-center">Add New Product</h2>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input name="productName" value={formState.productName} onChange={(e) => handleInputChange("productName", e.target.value)} placeholder="Product Name" className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" value={formState.description} onChange={(e) => handleInputChange("description", e.target.value)} placeholder="Description" className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" required rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                <select name="condition" value={formState.condition} onChange={(e) => handleInputChange("condition", e.target.value)} className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="NEW">NEW</option>
                  <option value="USED">USED</option>
                  <option value="REFURBISHED">REFURBISHED</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select name="category" value={formState.category} onChange={(e) => handleInputChange("category", e.target.value)} className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <input name="price" type="number" value={formState.price} onChange={(e) => handleInputChange("price", e.target.value)} placeholder="Price" className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" required min="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                <input name="stockQuantity" type="number" value={formState.stockQuantity} onChange={(e) => handleInputChange("stockQuantity", e.target.value)} placeholder="Stock Quantity" className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" required min="0" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition">
                  <i className="fa-solid fa-upload text-emerald-600" />
                  <span className="text-emerald-700 font-medium text-sm">Choose Image</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={isUploading} />
                </label>
                {imagePreview && <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />}
              </div>
            </div>
            <button type="submit" disabled={isUploading} className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 py-2 rounded-lg font-semibold hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50">
              {isUploading ? <><i className="fa-solid fa-spinner fa-spin mr-2" />Saving...</> : "Add Product"}
            </button>
          </form>
        </div>
      </div>
  );
});
AddProductModal.displayName = "AddProductModal";

const EditProductModal = memo(({ open, product, onClose, formState, handleInputChange, handleEditSubmit }) => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { if (!open) { setImageFile(null); setImagePreview(null); } }, [open]);

  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }, []);

  const onSubmit = async (e) => {
    setIsSaving(true);
    try { await handleEditSubmit(e, imageFile); }
    catch { /* error shown in parent */ }
    finally { setIsSaving(false); }
  };

  if (!open || !product) return null;

  return (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative border border-gray-100">
          <button onClick={onClose} disabled={isSaving} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <i className="fa-solid fa-xmark text-xl" />
          </button>
          <h2 className="text-2xl font-bold mb-6 text-emerald-700 text-center">Edit Product</h2>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input type="text" value={formState.productName} onChange={(e) => handleInputChange("productName", e.target.value)} className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={formState.description} onChange={(e) => handleInputChange("description", e.target.value)} className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" required rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                <select value={formState.condition} onChange={(e) => handleInputChange("condition", e.target.value)} className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="NEW">NEW</option>
                  <option value="USED">USED</option>
                  <option value="REFURBISHED">REFURBISHED</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={formState.category} onChange={(e) => handleInputChange("category", e.target.value)} className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <input type="number" value={formState.price} onChange={(e) => handleInputChange("price", e.target.value)} className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" required min="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                <input type="number" value={formState.stockQuantity} onChange={(e) => handleInputChange("stockQuantity", e.target.value)} className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" required min="0" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Update Image</label>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition">
                  <i className="fa-solid fa-camera text-emerald-600" />
                  <span className="text-emerald-700 text-sm font-medium">Change Photo</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
                {imagePreview && <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />}
              </div>
            </div>
            <button type="submit" disabled={isSaving} className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 py-2 rounded-lg font-semibold hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50">
              {isSaving ? <><i className="fa-solid fa-spinner fa-spin mr-2" />Updating...</> : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
  );
});
EditProductModal.displayName = "EditProductModal";

const DeleteConfirmModal = memo(({ open, productName, onConfirm, onCancel, isDeleting }) => {
  if (!open) return null;
  return (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-100">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <i className="fa-solid fa-exclamation-triangle text-red-600 text-xl" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Product</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete &quot;{productName}&quot;? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={onCancel} disabled={isDeleting} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                Cancel
              </button>
              <button onClick={onConfirm} disabled={isDeleting} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2">
                {isDeleting ? <><i className="fa-solid fa-spinner fa-spin" />Deleting...</> : <><i className="fa-solid fa-trash" />Delete</>}
              </button>
            </div>
          </div>
        </div>
      </div>
  );
});
DeleteConfirmModal.displayName = "DeleteConfirmModal";

const initialFormState = {
  productName: "", description: "", condition: "NEW",
  category: "ELECTRONICS", price: "", stockQuantity: "",
};

const formReducer = (state, action) => {
  switch (action.type) {
    case "SET_INITIAL_DATA":
      return {
        productName: action.payload.productName || "",
        description: action.payload.description || "",
        condition: action.payload.condition || "NEW",
        category: action.payload.category || "ELECTRONICS",
        price: action.payload.price ?? action.payload.currentPrice ?? "",
        stockQuantity: action.payload.stockQuantity ?? "",
      };
    case "UPDATE_FIELD":
      return { ...state, [action.field]: action.value };
    case "RESET_FORM":
      return initialFormState;
    default:
      return state;
  }
};

const ShopDashboard = memo(() => {
  const navigate = useNavigate();
  const { profile, shopStatus, loading: shopLoading } = useUserShop();

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
  const [formState, dispatch] = useReducer(formReducer, initialFormState);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token || isJwtExpired(token)) { localStorage.removeItem("accessToken"); navigate("/signin"); }
  }, [navigate]);

  useEffect(() => {
    if (shopLoading) return;
    if (shopStatus !== "ACTIVE") navigate("/profile");
  }, [shopLoading, shopStatus, navigate]);

  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    try {
      const res = await axios.get(`${apiURL}/users/me/products`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: 0, size: 50, sort: "createdAt,desc" },
      });
      const content = res.data?.data?.content ?? [];
      productDetailsCache.clear();
      setProducts(content);
    } catch (err) {
      if (err.response?.status === 401) { localStorage.removeItem("accessToken"); navigate("/signin"); }
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchDashboardData = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) { navigate("/signin"); return; }
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${apiURL}/users/me/shops/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dashData = res.data?.data ?? res.data;
      if (dashData) setShopData(dashData);
      else setError("No shop data found");
    } catch (err) {
      if (err.response?.status === 401) navigate("/signin");
      else setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchDashboardData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { fetchProducts(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (showSuccess) { const t = setTimeout(() => setShowSuccess(false), 5000); return () => clearTimeout(t); }
  }, [showSuccess]);

  useEffect(() => {
    if (error) { const t = setTimeout(() => setError(""), 8000); return () => clearTimeout(t); }
  }, [error]);

  const handleQuickAction = useCallback((action) => {
    switch (action) {
      case "add-product": setShowAddProduct(true); break;
      case "view-orders": navigate("/merchant/orders"); break;
      case "shop-settings": navigate("/merchant/shop-settings"); break;
      case "analytics": navigate("/merchant/analytics"); break;
    }
  }, [navigate]);

  const handleDeleteProduct = useCallback(async (productId) => {
    const token = localStorage.getItem("accessToken");
    if (!token) { navigate("/signin"); return; }
    try {
      setIsDeleting(true);
      await axios.delete(`${apiURL}/users/me/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowSuccess(true);
      setSuccessMessage("Product deleted successfully");
      productDetailsCache.delete(productId);
      setShowDeleteModal(false);
      setDeleteProduct(null);
      await fetchProducts();
    } catch (err) {
      if (err.response?.status === 401) { localStorage.removeItem("accessToken"); navigate("/signin"); }
      else setError("Error deleting product. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }, [navigate, fetchProducts]);

  const handleConfirmDelete = useCallback(async () => {
    if (deleteProduct?.id) await handleDeleteProduct(deleteProduct.id);
  }, [deleteProduct, handleDeleteProduct]);

  const handleEditProduct = useCallback(async (product) => {
    let full = product;
    if (!product.category || product.stockQuantity === undefined) {
      const cached = productDetailsCache.get(product.id);
      if (cached) { full = { ...product, ...cached }; }
      else { const details = await fetchProductDetails(product.id); if (details) full = { ...product, ...details }; }
    }
    setEditProduct(full);
    dispatch({ type: "SET_INITIAL_DATA", payload: full });
    setShowEditModal(true);
  }, []);

  const handleInputChange = useCallback((field, value) => {
    dispatch({ type: "UPDATE_FIELD", field, value });
  }, []);

  const addProduct = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token || isJwtExpired(token)) { navigate("/signin"); return; }
    if (!shopData) { setError("Shop data not loaded yet."); return; }
    try {
      const res = await axios.post(
          `${apiURL}/users/me/products`,
          {
            productName: formState.productName,
            description: formState.description,
            condition: formState.condition,
            category: formState.category,
            price: Number(formState.price),
            stockQuantity: Number(formState.stockQuantity),
          },
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      const productId = res.data?.data?.id;
      if (productId) { dispatch({ type: "RESET_FORM" }); return { productId }; }
      else throw new Error("No product ID returned");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add product.");
      throw err;
    }
  }, [navigate, shopData, formState]);

  const handleAddSubmit = useCallback(async () => {
    setError("");
    return await addProduct();
  }, [addProduct]);

  const updateProduct = useCallback(async (productId, updateData, imageFile) => {
    const token = localStorage.getItem("accessToken");
    if (!token || isJwtExpired(token)) { navigate("/signin"); return; }
    try {
      await axios.put(
          `${apiURL}/users/me/products/${productId}`,
          updateData,
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      if (imageFile) {
        const fd = new FormData();
        fd.append("image", imageFile);
        await axios.post(`${apiURL}/users/me/products/${productId}/image`, fd, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
      }
      setShowSuccess(true);
      setSuccessMessage("Product updated successfully!");
      productDetailsCache.delete(productId);
      await fetchProducts();
      setShowEditModal(false);
      setEditProduct(null);
      dispatch({ type: "RESET_FORM" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update product.");
    }
  }, [navigate, fetchProducts]);

  const handleEditSubmit = useCallback(async (e, imageFile) => {
    e.preventDefault();
    setError("");
    await updateProduct(editProduct.id, {
      productName: formState.productName,
      description: formState.description,
      condition: formState.condition,
      category: formState.category,
      price: Number(formState.price),
      stockQuantity: Number(formState.stockQuantity),
    }, imageFile);
  }, [formState, editProduct, updateProduct]);

  if (shopLoading || loading) {
    return (
        <Suspense fallback={<LoadingSpinner />}>
          <Header />
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
            <div className="text-center"><LoadingSpinner /><p className="mt-6 text-gray-600 font-medium">Loading your shop dashboard...</p></div>
          </div>
          <Footer />
        </Suspense>
    );
  }

  if (!shopData) {
    return (
        <Suspense fallback={<LoadingSpinner />}>
          <Header />
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
            <div className="text-center max-w-md mx-auto p-6">
              <div className="text-red-500 mb-6"><i className="fa-solid fa-exclamation-triangle text-6xl" /></div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Shop Not Found</h3>
              <p className="text-gray-600 mb-6">{error || "Could not load your shop data."}</p>
              <button onClick={() => navigate("/profile")} className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all">
                <i className="fa-solid fa-arrow-left mr-2" />Back to Profile
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
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg flex justify-between items-center">
                <span className="text-sm">{error}</span>
                <button onClick={() => setError("")} className="ml-2 text-red-700 hover:text-red-900">
                  <i className="fa-solid fa-xmark" />
                </button>
              </div>
            </div>
        )}

        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-12">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center mt-8">
                <button onClick={() => navigate("/profile")} className="mr-4 p-2 hover:bg-emerald-500 rounded-lg transition-colors">
                  <i className="fa-solid fa-arrow-left text-xl" />
                </button>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold">{shopData?.shopName || "Shop Dashboard"}</h1>
                  <p className="text-emerald-100 mt-2">Manage your shop</p>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-1"><QuickActions onAction={handleQuickAction} /></div>
              <div className="lg:col-span-2"><RecentOrders /></div>
            </div>

            <div className="mb-12">
              <Chat
                  isLocked={shopData?.subscriptionTier !== "PREMIUM"}
                  onUpgrade={() => navigate("/pricing")}
                  userImage={profile?.profilePhotoUrl}
                  userName={profile?.firstName || "Merchant"}
              />
            </div>

            <ProductsSection
                products={products}
                showEditModal={handleEditProduct}
                isLoading={productsLoading}
                onDelete={(p) => { setDeleteProduct(p); setShowDeleteModal(true); }}
            />

            <div className="mt-8">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <i className="fa-solid fa-info-circle mr-2 text-emerald-600" />Shop Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Shop Name</p>
                    <p className="text-gray-800 font-semibold">{shopData.shopName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Rating</p>
                    <p className="text-gray-800 font-semibold">{shopData.rating ? `${shopData.rating}/5` : "No rating yet"}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Income</p>
                    <p className="text-gray-800 font-semibold">${shopData.totalIncome || "0.00"}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Created</p>
                    <p className="text-gray-800 font-semibold">{shopData.createdAt ? new Date(shopData.createdAt).toLocaleDateString() : "N/A"}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-gray-600 text-sm font-medium">Description</p>
                    <p className="text-gray-800">{shopData.description || "No description provided"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <AddProductModal
            open={showAddProduct}
            onClose={() => { setShowAddProduct(false); dispatch({ type: "RESET_FORM" }); fetchProducts(); }}
            handleAddSubmit={handleAddSubmit}
            handleInputChange={handleInputChange}
            formState={formState}
        />
        <EditProductModal
            open={showEditModal}
            product={editProduct}
            onClose={() => { setShowEditModal(false); setEditProduct(null); dispatch({ type: "RESET_FORM" }); }}
            handleEditSubmit={handleEditSubmit}
            handleInputChange={handleInputChange}
            formState={formState}
        />
        <DeleteConfirmModal
            open={showDeleteModal}
            productName={deleteProduct?.productName}
            onConfirm={handleConfirmDelete}
            onCancel={() => { setShowDeleteModal(false); setDeleteProduct(null); }}
            isDeleting={isDeleting}
        />

        {profile?.id && <SellerInbox currentUser={profile} />}

        {showSuccess && <SuccessToast message={successMessage} onClose={() => setShowSuccess(false)} />}
        <Footer />
      </Suspense>
  );
});

ShopDashboard.displayName = "ShopDashboard";
export default ShopDashboard;