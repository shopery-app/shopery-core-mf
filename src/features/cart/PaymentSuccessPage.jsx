import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import PageShell from "../../components/layout/PageShell";
import Button from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Feedback";
import { CheckCircleIcon } from "../../components/ui/icons";
import { fetchCart } from "../../store/slices/cartSlice";
import { fetchMyOrders, selectOrders } from "../../store/slices/ordersSlice";
import { formatCurrency } from "../../utils/format";

const MAX_POLLS = 6;

const PaymentSuccessPage = () => {
  const dispatch = useDispatch();
  const orders = useSelector(selectOrders);
  const [polling, setPolling] = useState(true);
  const pollCount = useRef(0);

  useEffect(() => {
    dispatch(fetchCart());
    dispatch(fetchMyOrders());
  }, [dispatch]);

  useEffect(() => {
    if (!polling) return;
    if (orders.length > 0 || pollCount.current >= MAX_POLLS) {
      setPolling(false);
      return;
    }
    const t = setTimeout(() => {
      pollCount.current += 1;
      dispatch(fetchMyOrders());
    }, 3000);
    return () => clearTimeout(t);
  }, [dispatch, orders.length, polling]);

  const latestOrder = orders[0];

  return (
    <PageShell>
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-success-subtle text-success">
          <CheckCircleIcon size={28} />
        </div>
        <h1 className="text-2xl font-semibold text-ink">Payment successful</h1>
        <p className="mt-2 text-[14px] text-ink-secondary">Thanks for your order — a confirmation email is on its way.</p>

        {polling && !latestOrder && (
          <div className="mt-8 flex flex-col items-center gap-2 text-[13px] text-ink-muted">
            <Spinner size={20} />
            Finalizing your order…
          </div>
        )}

        {latestOrder && (
          <div className="mt-8 rounded-lg border border-border bg-surface p-5 text-left">
            <div className="flex items-center justify-between">
              <p className="text-[13.5px] font-semibold text-ink">Order from {latestOrder.shopName}</p>
              <span className="text-[13.5px] font-semibold text-ink">{formatCurrency(latestOrder.totalPrice)}</span>
            </div>
            <p className="mt-1 text-[12.5px] text-ink-muted">{latestOrder.items?.length || 0} item(s)</p>
          </div>
        )}

        <div className="mt-8 flex justify-center gap-3">
          <Link to="/orders">
            <Button variant="outline">View orders</Button>
          </Link>
          <Link to="/products">
            <Button>Continue shopping</Button>
          </Link>
        </div>
      </div>
    </PageShell>
  );
};

export default PaymentSuccessPage;
