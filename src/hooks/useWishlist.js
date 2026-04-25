import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    fetchWishlist,
    addToWishlistAPI,
    removeFromWishlistAPI,
    clearWishlistAPI,
    selectWishlistItems,
    selectWishlistLoading,
    selectWishlistError,
} from "../store/reducers/wishlistReducer";

export const useWishlist = ({ autoFetch = true } = {}) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const token = localStorage.getItem("accessToken");

    const items = useSelector(selectWishlistItems);
    const loading = useSelector(selectWishlistLoading);
    const error = useSelector(selectWishlistError);

    const isInWishlist = useCallback(
        (productId) => items.some((p) => String(p.id) === String(productId)),
        [items]
    );

    const loadWishlist = useCallback(() => {
        if (token) dispatch(fetchWishlist());
    }, [dispatch, token]);

    useEffect(() => {
        if (autoFetch && token) {
            dispatch(fetchWishlist());
        }
    }, [dispatch, token, autoFetch]);

    const toggleWishlist = useCallback(
        async (productId) => {
            if (!token) { navigate("/signin"); return; }
            const inList = items.some((p) => String(p.id) === String(productId));
            if (inList) {
                dispatch(removeFromWishlistAPI(productId));
            } else {
                dispatch(addToWishlistAPI(productId));
            }
        },
        [dispatch, items, token, navigate]
    );

    const removeFromWishlist = useCallback(
        (productId) => {
            if (!token) return;
            dispatch(removeFromWishlistAPI(productId));
        },
        [dispatch, token]
    );

    const clearWishlist = useCallback(() => {
        if (!token) return;
        dispatch(clearWishlistAPI());
    }, [dispatch, token]);

    return {
        items,
        loading,
        error,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
        loadWishlist,
        itemCount: items.length,
    };
};

export default useWishlist;