import { Link } from "react-router-dom";
import PageShell from "../../components/layout/PageShell";
import Button from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/Feedback";
import { HeartIcon, TrashIcon, ImageIcon, CartIcon } from "../../components/ui/icons";
import useWishlist from "../../hooks/useWishlist";
import useCart from "../../hooks/useCart";
import { toImageSrc } from "../../utils/image";
import { formatCurrency } from "../../utils/format";

const WishlistPage = () => {
  const { items, loading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart({ autoFetch: false });

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="mb-8 text-2xl font-semibold text-ink">Your wishlist</h1>

        {!loading && items.length === 0 ? (
          <EmptyState
            icon={HeartIcon}
            title="Your wishlist is empty"
            description="Save products you like to find them here later."
            action={
              <Link to="/products">
                <Button>Browse products</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((product) => {
              const imageUrl = toImageSrc(product.image);
              return (
                <div key={product.id} className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface">
                  <Link to={`/products/${product.id}`} className="aspect-[4/3] bg-surface-sunken">
                    {imageUrl ? (
                      <img src={imageUrl} alt={product.productName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-ink-muted">
                        <ImageIcon size={28} />
                      </div>
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col gap-2 p-3.5">
                    <Link to={`/products/${product.id}`} className="line-clamp-2 text-[13px] font-medium text-ink hover:underline">
                      {product.productName}
                    </Link>
                    <p className="text-[15px] font-semibold text-ink">{formatCurrency(product.currentPrice)}</p>
                    <div className="mt-auto flex gap-2">
                      <button
                        onClick={() => addToCart(product.id, 1, { id: product.id, productName: product.productName, imageUrl, currentPrice: product.currentPrice, stockQuantity: product.stockQuantity })}
                        className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md bg-ink text-[11.5px] font-semibold text-ink-inverse hover:bg-ink/90"
                      >
                        <CartIcon size={12} /> Add
                      </button>
                      <button onClick={() => removeFromWishlist(product.id)} className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-ink-muted hover:text-danger" aria-label="Remove">
                        <TrashIcon size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default WishlistPage;
