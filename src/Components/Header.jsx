import React, { useState, useCallback, memo, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";
import useCart from "../hooks/useCart";
import useUserShop from "../hooks/useUserShop";
import CreateShopModal from "./Modals/CreateShopModal";

const LEAGUE_URL = "https://shopery-league.vercel.app/";

const NotificationBanner = memo(({ type, message, onClose }) => (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
        <div
            className={`${
                type === "success" ? "bg-green-500" : "bg-red-500"
            } text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3`}
        >
            <i
                className={`fa-solid ${
                    type === "success" ? "fa-check-circle" : "fa-exclamation-circle"
                } text-xl`}
            />
            <p className="font-medium">{message}</p>
            <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
                <i className="fa-solid fa-times" />
            </button>
        </div>
    </div>
));

const ShopStatusButton = memo(({ shopStatus, onCreateClick, navigate }) => {
    if (shopStatus === "NONE" || shopStatus === "CLOSED") {
        return (
            <button
                onClick={onCreateClick}
                className="relative bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full font-bold text-sm hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 animate-pulse"
            >
                <i className="fa-solid fa-store mr-2" /> Start Making Money
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-red-600 text-xs px-1.5 py-0.5 rounded-full font-bold">
          NEW
        </span>
            </button>
        );
    }

    if (shopStatus === "PENDING") {
        return (
            <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-2 rounded-full text-sm font-semibold">
                <i className="fa-solid fa-clock animate-pulse" /> Shop Pending Approval
            </div>
        );
    }

    if (shopStatus === "ACTIVE") {
        return (
            <button
                onClick={() => navigate(`/shop/dashboard`)}
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 py-2 rounded-full font-bold text-sm hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
            >
                <i className="fa-solid fa-tachometer-alt" /> My Shop Dashboard
            </button>
        );
    }

    return null;
});

const LeagueButton = memo(({ authenticated, navigate }) => {
    const handleLeagueClick = () => {
        if (authenticated) {
            window.open(LEAGUE_URL, "_blank", "noopener, noreferrer");
            return;
        }
        navigate("/signin");
    };

    return (
        <button
            onClick={handleLeagueClick}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-2 rounded-full font-bold text-sm hover:from-violet-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
        >
            <i className="fa-solid fa-trophy" /> Go to League
        </button>
    );
});

const Header = memo(() => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [notification, setNotification] = useState(null);
    const { itemCount } = useCart();
    const { shop, shopStatus, refetch } = useUserShop();
    const navigate = useNavigate();
    const authenticated = useMemo(() => isAuthenticated(), []);

    const handleShopCreated = useCallback(() => {
        setShowCreateModal(false);
        refetch();
        setNotification({
            type: "success",
            message: "Shop submitted! You'll be notified once it's approved.",
        });
        setTimeout(() => setNotification(null), 5000);
    }, [refetch]);

    const NavLinks = (
        <>
            <Link className="font-bold text-sm xl:text-base hover:text-gray-600" to="/">
                HOME
            </Link>
            <Link className="font-bold text-sm xl:text-base hover:text-gray-600" to="/products">
                PRODUCTS
            </Link>
            <Link className="font-bold text-sm xl:text-base hover:text-gray-600" to="/shops">
                SHOPS
            </Link>
            <Link className="font-bold text-sm xl:text-base hover:text-gray-600" to="/blogs">
                BLOGS
            </Link>
        </>
    );

    return (
        <>
            {notification && (
                <NotificationBanner
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification(null)}
                />
            )}

            {showCreateModal && (
                <CreateShopModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={handleShopCreated}
                />
            )}

            <header className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-md shadow-lg z-40 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 lg:px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center space-x-3 group">
                            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                                <i className="fa-solid fa-leaf text-white text-xl" />
                            </div>
                            <span className="text-2xl font-bold text-gray-800">Shopery</span>
                        </Link>

                        <nav className="hidden lg:flex gap-8 items-center">{NavLinks}</nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden lg:block">
                            <LeagueButton authenticated={authenticated} navigate={navigate} />
                        </div>

                        {authenticated && (
                            <div className="hidden lg:block">
                                <ShopStatusButton
                                    shopStatus={shopStatus}
                                    shop={shop}
                                    onCreateClick={() => setShowCreateModal(true)}
                                    navigate={navigate}
                                />
                            </div>
                        )}

                        <Link to="/cart" className="relative p-3 text-gray-600 hover:text-emerald-600">
                            <i className="fa-solid fa-shopping-cart text-xl" />
                            {itemCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">{itemCount}</span>
                            )}
                        </Link>

                        {authenticated ? (
                            <div className="flex items-center gap-3">
                                <Link to="/profile" className="p-2 text-gray-600 hover:text-emerald-600">
                                    <i className="fa-solid fa-user-circle text-xl" />
                                </Link>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link to="/signin" className="hidden sm:block bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium">
                                    Sign In
                                </Link>
                                <Link to="/register" className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium shadow-md">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>
        </>
    );
});

export default Header;