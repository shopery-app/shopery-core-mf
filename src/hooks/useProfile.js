import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile, selectProfile, selectProfileStatus, selectShop, selectShopStatus } from "../store/slices/authSlice";
import { isAuthenticated } from "../utils/auth";

export const useProfile = () => {
  const dispatch = useDispatch();
  const profile = useSelector(selectProfile);
  const status = useSelector(selectProfileStatus);
  const shop = useSelector(selectShop);
  const shopStatus = useSelector(selectShopStatus);
  const pollRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated() && status === "idle") dispatch(fetchProfile());
  }, [dispatch, status]);

  // While a shop request is pending, poll so approval reflects without a reload.
  useEffect(() => {
    clearInterval(pollRef.current);
    if (shopStatus === "PENDING") {
      pollRef.current = setInterval(() => dispatch(fetchProfile()), 30000);
    }
    return () => clearInterval(pollRef.current);
  }, [dispatch, shopStatus]);

  const refetch = useCallback(() => dispatch(fetchProfile()), [dispatch]);

  return { profile, shop, shopStatus, loading: status === "loading" || status === "idle", refetch };
};

export default useProfile;
