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
} from "../store/slices/wishlistSlice";
import { isAuthenticated } from "../utils/auth";

export const useWishlist = ({ autoFetch = true } = {}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const items = useSelector(selectWishlistItems);
  const loading = useSelector(selectWishlistLoading);
  const error = useSelector(selectWishlistError);

  useEffect(() => {
    if (autoFetch && isAuthenticated()) dispatch(fetchWishlist());
  }, [dispatch, autoFetch]);

  const isInWishlist = useCallback((productId) => items.some((p) => String(p.id) === String(productId)), [items]);

  const toggleWishlist = useCallback(
    (productId) => {
      if (!isAuthenticated()) {
        navigate("/signin");
        return;
      }
      if (isInWishlist(productId)) dispatch(removeFromWishlistAPI(productId));
      else dispatch(addToWishlistAPI(productId));
    },
    [dispatch, isInWishlist, navigate],
  );

  return {
    items,
    loading,
    error,
    isInWishlist,
    toggleWishlist,
    removeFromWishlist: (productId) => dispatch(removeFromWishlistAPI(productId)),
    clearWishlist: () => dispatch(clearWishlistAPI()),
    loadWishlist: () => dispatch(fetchWishlist()),
    itemCount: items.length,
  };
};

export default useWishlist;
