import React, { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import useCart from "../../hooks/useCart";

const PaymentSuccessPage = () => {
    const [params] = useSearchParams();
    const sessionId = params.get("session_id");

    const { refreshCart, loadMyOrders } = useCart();

    useEffect(() => {
        if (sessionId) {
            refreshCart();
            loadMyOrders();
        }
    }, [sessionId, refreshCart, loadMyOrders]);

    return (
        <div style={{ padding: "140px 32px", textAlign: "center" }}>
            <h1>Payment successful</h1>
            <p>Your order is being processed.</p>

            <Link to="/cart">View Orders</Link>
        </div>
    );
};

export default PaymentSuccessPage;