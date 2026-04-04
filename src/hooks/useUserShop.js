import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { apiURL } from "../Backend/Api/api";

// No module-level cache — it caused stale shop status to persist across
// shop creation and admin approval without a page reload.

const listeners = new Set();
let sharedProfile = null;
let inflight = null;

const notifyListeners = () => listeners.forEach((fn) => fn(sharedProfile));

const doFetch = () => {
    if (inflight) return inflight;

    const token = localStorage.getItem("accessToken");
    if (!token) return Promise.resolve(null);

    inflight = axios
        .get(`${apiURL}/users/me/profile`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
            const data = res.data?.data ?? res.data;
            if (data && typeof data === "object" && data.email) {
                sharedProfile = data;
                notifyListeners();
                return data;
            }
            return null;
        })
        .catch(() => null)
        .finally(() => {
            inflight = null;
        });

    return inflight;
};

export const invalidateUserProfile = () => {
    sharedProfile = null;
    inflight = null;
    notifyListeners();
};

const useUserShop = () => {
    const [profile, setProfile] = useState(sharedProfile);
    const [loading, setLoading] = useState(true);
    const mounted = useRef(true);
    const pollRef = useRef(null);

    const update = useCallback((p) => {
        if (mounted.current) setProfile(p);
    }, []);

    useEffect(() => {
        mounted.current = true;
        listeners.add(update);
        return () => {
            mounted.current = false;
            listeners.delete(update);
            clearInterval(pollRef.current);
        };
    }, [update]);

    // Initial fetch
    useEffect(() => {
        setLoading(true);
        doFetch().finally(() => {
            if (mounted.current) setLoading(false);
        });
    }, []);

    // Poll every 30s when shop is PENDING so approval is reflected without page reload
    useEffect(() => {
        clearInterval(pollRef.current);

        const shopStatus = profile?.shop?.status ?? "NONE";
        if (shopStatus === "PENDING") {
            pollRef.current = setInterval(() => {
                doFetch();
            }, 30000);
        }

        return () => clearInterval(pollRef.current);
    }, [profile?.shop?.status]);

    const refetch = useCallback(() => {
        // Bust the shared state so the next doFetch actually hits the network
        sharedProfile = null;
        inflight = null;
        setLoading(true);
        doFetch().finally(() => {
            if (mounted.current) setLoading(false);
        });
    }, []);

    const shop = profile?.shop ?? null;
    // Derive status defensively — null shop means NONE
    const shopStatus = shop?.status ?? "NONE";

    return { profile, shop, shopStatus, loading, refetch };
};

export default useUserShop;