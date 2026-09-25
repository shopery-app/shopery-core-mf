import { useEffect } from "react";
import { Link } from "react-router-dom";
import PageShell from "../../components/layout/PageShell";
import Button from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/Feedback";
import { CartIcon, MinusIcon, PlusIcon, TrashIcon, ImageIcon, ArrowRightIcon } from "../../components/ui/icons";
import useCart from "../../hooks/useCart";
import { toImageSrc } from "../../utils/image";
import { formatCurrency } from "../../utils/format";
import { isAuthenticated } from "../../utils/auth";

const CartItemRow = ({ item, onIncrease, onDecrease, onRemove }) => (
  <div className="flex items-center gap-4 border-b border-border py-5 last:border-b-0">
    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-surface-sunken">
      {item.imageUrl ? (
        <img src={toImageSrc(item.imageUrl)} alt={item.name} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center text-ink-muted">
          <ImageIcon size={22} />
        </div>
      )}
    </div>
    <div className="min-w-0 flex-1">
      <Link to={`/products/${item.productId}`} className="line-clamp-1 text-[14px] font-medium text-ink hover:underline">
        {item.name}
      </Link>
      <p className="mt-1 text-[13.5px] font-semibold text-ink">{formatCurrency(item.price)}</p>
    </div>
    <div className="flex items-center rounded-md border border-border">
      <button onClick={() => onDecrease(item.productId)} className="flex h-8 w-8 items-center justify-center text-ink-secondary hover:bg-surface-sunken">
        <MinusIcon size={12} />
      </button>
      <span className="w-8 text-center text-[13px] font-medium text-ink">{item.quantity}</span>
      <button onClick={() => onIncrease(item.productId)} className="flex h-8 w-8 items-center justify-center text-ink-secondary hover:bg-surface-sunken">
        <PlusIcon size={12} />
      </button>
    </div>
    <p className="w-20 shrink-0 text-right text-[14px] font-semibold text-ink">{formatCurrency(item.price * item.quantity)}</p>
    <button onClick={() => onRemove(item.productId)} className="shrink-0 text-ink-muted hover:text-danger" aria-label="Remove item">
      <TrashIcon size={16} />
    </button>
  </div>
);

const CartPage = () => {
  const {
    cartItems,
    cartTotal,
    itemCount,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    checkout,
    checkoutLoading,
    checkoutError,
    clearCheckoutError,
  } = useCart();

  useEffect(() => clearCheckoutError, [clearCheckoutError]);

  return (
    <PageShell>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <h1 className="mb-8 text-2xl font-semibold text-ink">Your cart</h1>

        {cartItems.length === 0 ? (
          <EmptyState
            icon={CartIcon}
            title="Your cart is empty"
            description="Browse products and add something you like."
            action={
              <Link to="/products">
                <Button>Browse products</Button>
              </Link>
            }
          />
        ) : (
          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="flex-1 rounded-lg border border-border bg-surface px-5">
              {cartItems.map((item) => (
                <CartItemRow key={item.productId} item={item} onIncrease={increaseQuantity} onDecrease={decreaseQuantity} onRemove={removeFromCart} />
              ))}
            </div>

            <div className="w-full shrink-0 lg:w-80">
              <div className="sticky top-20 rounded-lg border border-border bg-surface p-5">
                <h2 className="text-[14px] font-semibold text-ink">Order summary</h2>
                <div className="mt-4 space-y-2 text-[13.5px]">
                  <div className="flex justify-between text-ink-secondary">
                    <span>Items ({itemCount})</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-3 text-[15px] font-semibold text-ink">
                    <span>Total</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                </div>

                {checkoutError && <p className="mt-3 rounded-md border border-danger/20 bg-danger-subtle px-3 py-2 text-[12.5px] text-danger">{checkoutError}</p>}

                {isAuthenticated() ? (
                  <Button fullWidth className="mt-5" loading={checkoutLoading} onClick={checkout}>
                    Checkout <ArrowRightIcon size={14} />
                  </Button>
                ) : (
                  <Link to="/signin" state={{ from: { pathname: "/cart" } }}>
                    <Button fullWidth className="mt-5">
                      Sign in to checkout
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default CartPage;
