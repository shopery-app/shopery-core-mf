import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  addProductToCart,
  removeProductFromCartAPI,
  updateCartQuantityAPI,
  clearCartAPI,
  fetchCart,
  checkoutAPI,
  clearCheckoutError,
  hideCartSuccess,
  clearCartError,
  clearStripeSession,
  selectCartItems,
  selectCartTotal,
  selectCartItemCount,
  selectCartLoading,
  selectCartError,
  selectIsLocalCart,
  selectShowCartSuccess,
  selectLastAddedItem,
  selectCheckoutLoading,
  selectCheckoutError,
  selectStripeSession,
} from "../store/slices/cartSlice";
import { isAuthenticated } from "../utils/auth";

export const useCart = ({ autoFetch = true } = {}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);
  const itemCount = useSelector(selectCartItemCount);
  const loading = useSelector(selectCartLoading);
  const error = useSelector(selectCartError);
  const isLocal = useSelector(selectIsLocalCart);
  const showSuccessMessage = useSelector(selectShowCartSuccess);
  const lastAddedItem = useSelector(selectLastAddedItem);
  const checkoutLoading = useSelector(selectCheckoutLoading);
  const checkoutError = useSelector(selectCheckoutError);
  const stripeSession = useSelector(selectStripeSession);

  useEffect(() => {
    if (autoFetch && isAuthenticated()) dispatch(fetchCart());
  }, [dispatch, autoFetch]);

  const addToCart = useCallback(
    async (productId, quantity = 1, productData = null) => {
      const existing = cartItems.find((i) => String(i.productId) === String(productId));
      const currentQty = existing?.quantity || 0;
      const stock = Number(existing?.stockQuantity ?? productData?.stockQuantity ?? 0);
      const safeQuantity = stock > 0 ? Math.min(quantity, Math.max(stock - currentQty, 0)) : quantity;
      if (stock > 0 && safeQuantity <= 0) return null;
      return dispatch(addProductToCart({ productId, quantity: safeQuantity, productData }));
    },
    [dispatch, cartItems],
  );

  const removeFromCart = useCallback((productId) => dispatch(removeProductFromCartAPI(productId)), [dispatch]);

  const updateQuantity = useCallback(
    (productId, quantity) => {
      if (quantity <= 0) return dispatch(removeProductFromCartAPI(productId));
      dispatch(updateCartQuantityAPI({ productId, quantity }));
    },
    [dispatch],
  );

  const increaseQuantity = useCallback(
    (productId) => {
      const item = cartItems.find((i) => String(i.productId) === String(productId));
      if (!item) return;
      const stock = Number(item.stockQuantity || 0);
      if (stock > 0 && item.quantity >= stock) return;
      updateQuantity(productId, item.quantity + 1);
    },
    [cartItems, updateQuantity],
  );

  const decreaseQuantity = useCallback(
    (productId) => {
      const item = cartItems.find((i) => String(i.productId) === String(productId));
      if (!item) return;
      if (item.quantity > 1) updateQuantity(productId, item.quantity - 1);
      else removeFromCart(productId);
    },
    [cartItems, updateQuantity, removeFromCart],
  );

  const checkout = useCallback(async () => {
    if (!isAuthenticated()) {
      navigate("/signin");
      return null;
    }
    const action = await dispatch(checkoutAPI());
    if (checkoutAPI.fulfilled.match(action) && action.payload?.checkoutUrl) {
      window.location.href = action.payload.checkoutUrl;
    }
    return action;
  }, [dispatch, navigate]);

  return {
    cartItems,
    cartTotal,
    itemCount,
    loading,
    error,
    isLocal,
    showSuccessMessage,
    lastAddedItem,
    checkoutLoading,
    checkoutError,
    stripeSession,

    addToCart,
    removeFromCart,
    updateQuantity,
    increaseQuantity,
    decreaseQuantity,
    clearCart: () => dispatch(clearCartAPI()),
    refreshCart: () => dispatch(fetchCart()),
    clearCartError: () => dispatch(clearCartError()),
    clearCheckoutError: () => dispatch(clearCheckoutError()),
    hideSuccessMessage: () => dispatch(hideCartSuccess()),
    clearStripeSession: () => dispatch(clearStripeSession()),
    checkout,
    getItemQuantity: (productId) => cartItems.find((i) => String(i.productId) === String(productId))?.quantity || 0,
    isItemInCart: (productId) => cartItems.some((i) => String(i.productId) === String(productId)),
  };
};

export default useCart;
