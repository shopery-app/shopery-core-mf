import { useSelector, useDispatch } from "react-redux";
import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    addProductToCart,
    removeProductFromCartAPI,
    updateCartQuantityAPI,
    clearCartAPI,
    fetchCart,
    cacheProductDetails,
    clearError,
    checkoutAPI,
    fetchMyOrders,
    selectCartItems,
    selectCartTotal,
    selectCartItemCount,
    selectCartLoading,
    selectCartError,
    selectIsLocalCart,
    showCartSuccess,
    hideCartSuccess,
    selectShowSuccessMessage,
    selectLastAddedItem,
    selectOrders,
    selectOrdersLoading,
    selectCheckoutLoading,
    selectCheckoutError,
    selectStripeSession,
} from "../store/reducers/cartReducer";

export const useCart = ({ autoFetch = true } = {}) => {
    const dispatch = useDispatch();

    const cartItems = useSelector(selectCartItems);
    const cartTotal = useSelector(selectCartTotal);
    const itemCount = useSelector(selectCartItemCount);
    const loading = useSelector(selectCartLoading);
    const error = useSelector(selectCartError);
    const isLocal = useSelector(selectIsLocalCart);
    const showSuccessMessage = useSelector(selectShowSuccessMessage);
    const lastAddedItem = useSelector(selectLastAddedItem);
    const orders = useSelector(selectOrders);
    const ordersLoading = useSelector(selectOrdersLoading);
    const checkoutLoading = useSelector(selectCheckoutLoading);
    const checkoutError = useSelector(selectCheckoutError);
    const stripeSession = useSelector(selectStripeSession);
    const navigate = useNavigate();

    useEffect(() => {
        if (autoFetch) {
            const token = localStorage.getItem("accessToken");
            if (token) {
                dispatch(fetchCart());
            }
        }
    }, [dispatch, autoFetch]);

    const addToCart = useCallback(
        async (productId, quantity = 1, productData = null) => {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                navigate("/signin"); return null;
            }
            const existingItem = cartItems.find((i) => String(i.productId) === String(productId));
            const currentQty = existingItem?.quantity || 0;
            const stock = Number(
                existingItem?.product?.stockQuantity ??
                existingItem?.productData?.stockQuantity ??
                productData?.stockQuantity ??
                0
            );

            const safeQuantity =
                stock > 0 ? Math.min(quantity, Math.max(stock - currentQty, 0)) : quantity;

            if (stock > 0 && safeQuantity <= 0) {
                return null;
            }

            const action = await dispatch(
                addProductToCart({ productId, quantity: safeQuantity, productData })
            );

            if (productData) {
                dispatch(cacheProductDetails({ productId, productData }));
                dispatch(showCartSuccess(productData));
            }

            return action;
        },
        [dispatch, cartItems, navigate]
    );

    const removeFromCart = useCallback(
        (productId) => dispatch(removeProductFromCartAPI(productId)),
        [dispatch]
    );

    const updateQuantity = useCallback(
        (productId, quantity) => {
            if (quantity <= 0) { dispatch(removeProductFromCartAPI(productId)); return; }
            dispatch(updateCartQuantityAPI({ productId, quantity }));
        },
        [dispatch]
    );

    const increaseProductQuantity = useCallback(
        (productId) => {
            const item = cartItems.find((i) => String(i.productId) === String(productId));
            if (!item) return;

            const stock = Number(item.product?.stockQuantity ?? item.productData?.stockQuantity ?? 0);

            if (stock > 0 && item.quantity >= stock) {
                return;
            }

            updateQuantity(productId, item.quantity + 1);
        },
        [cartItems, updateQuantity]
    );

    const decreaseProductQuantity = useCallback(
        (productId) => {
            const item = cartItems.find((i) => String(i.productId) === String(productId));
            if (!item) return;
            if (item.quantity > 1) updateQuantity(productId, item.quantity - 1);
            else removeFromCart(productId);
        },
        [cartItems, updateQuantity, removeFromCart]
    );

    const clearCart = useCallback(() => dispatch(clearCartAPI()), [dispatch]);

    const refreshCart = useCallback(() => dispatch(fetchCart()), [dispatch]);

    const clearCartError = useCallback(() => dispatch(clearError()), [dispatch]);

    const hideSuccessMessage = useCallback(() => dispatch(hideCartSuccess()), [dispatch]);

    // FIX: checkout now just initiates the Stripe session and redirects.
    // It does NOT populate orders (that happens via webhook + fetchMyOrders after return).
    const checkout = useCallback(async () => {
        const action = await dispatch(checkoutAPI());

        if (checkoutAPI.fulfilled.match(action)) {
            const checkoutUrl = action.payload?.checkoutUrl;
            if (checkoutUrl) {
                // Redirect to Stripe hosted checkout
                window.location.href = checkoutUrl;
            }
        }

        return action;
    }, [dispatch]);

    const loadMyOrders = useCallback(() => dispatch(fetchMyOrders()), [dispatch]);

    const getItemQuantity = useCallback(
        (productId) => cartItems.find((i) => String(i.productId) === String(productId))?.quantity || 0,
        [cartItems]
    );

    const isItemInCart = useCallback(
        (productId) => cartItems.some((i) => String(i.productId) === String(productId)),
        [cartItems]
    );

    return {
        cartItems,
        cartTotal,
        itemCount,
        loading,
        error,
        isLocal,
        showSuccessMessage,
        lastAddedItem,
        orders,
        ordersLoading,
        checkoutLoading,
        checkoutError,
        stripeSession,

        addToCart,
        removeFromCart,
        updateQuantity,
        increaseProductQuantity,
        decreaseProductQuantity,
        clearCart,
        refreshCart,
        clearCartError,
        hideSuccessMessage,
        checkout,
        loadMyOrders,
        getItemQuantity,
        isItemInCart,

        removeProductFromCart: removeFromCart,
    };
};

export default useCart;