import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import AccountLayout from "../../components/layout/AccountLayout";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { EmptyState, PageSpinner } from "../../components/ui/Feedback";
import { PackageIcon } from "../../components/ui/icons";
import { fetchMyOrders, selectOrders, selectOrdersLoading } from "../../store/slices/ordersSlice";
import { formatCurrency, formatDate, formatEnumLabel } from "../../utils/format";

const STATUS_TONE = {
  PENDING: "neutral",
  PLACED: "info",
  SHIPPED: "accent",
  DELIVERED: "success",
  CANCELLED: "danger",
};

const OrdersPage = () => {
  const dispatch = useDispatch();
  const orders = useSelector(selectOrders);
  const loading = useSelector(selectOrdersLoading);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  return (
    <AccountLayout title="Orders" description="Track and review your past purchases.">
      {loading && orders.length === 0 ? (
        <PageSpinner />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={PackageIcon}
          title="No orders yet"
          description="Orders you place will show up here."
          action={
            <Link to="/products">
              <Button>Browse products</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-lg border border-border bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
                <div>
                  <p className="text-[14px] font-semibold text-ink">{order.shopName}</p>
                  <p className="mt-0.5 text-[12.5px] text-ink-muted">Placed {formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={STATUS_TONE[order.status] || "neutral"}>{formatEnumLabel(order.status)}</Badge>
                  <span className="text-[15px] font-semibold text-ink">{formatCurrency(order.totalPrice)}</span>
                </div>
              </div>

              <div className="divide-y divide-border">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-3 text-[13px]">
                    <div>
                      <p className="font-medium text-ink">{item.productName}</p>
                      <p className="text-ink-muted">
                        {item.quantity} × {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                    <p className="font-medium text-ink">{formatCurrency(item.subtotal)}</p>
                  </div>
                ))}
              </div>

              {order.addressLine1 && (
                <p className="mt-3 border-t border-border pt-3 text-[12.5px] text-ink-muted">
                  Shipped to {order.addressLine1}
                  {order.addressLine2 ? `, ${order.addressLine2}` : ""}, {order.city}, {order.country} {order.postalCode}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </AccountLayout>
  );
};

export default OrdersPage;
