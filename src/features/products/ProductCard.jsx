import { memo, useCallback, useState } from "react";
import { Link } from "react-router-dom";
import useCart from "../../hooks/useCart";
import useWishlist from "../../hooks/useWishlist";
import { toImageSrc } from "../../utils/image";
import { formatCurrency } from "../../utils/format";
import { HeartIcon, ImageIcon, CheckIcon, CartIcon, PlusIcon, MinusIcon } from "../../components/ui/icons";
import { SpinnerIcon } from "../../components/ui/icons";

const ProductCard = memo(({ product }) => {
  const { addToCart, isItemInCart } = useCart({ autoFetch: false });
  const { isInWishlist, toggleWishlist } = useWishlist({ autoFetch: false });
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [imgError, setImgError] = useState(false);

  const id = product?.id;
  const name = product?.productName || "Product";
  const imageUrl = toImageSrc(product?.image);
  const price = Number(product?.currentPrice || 0);
  const originalPrice = Number(product?.discountDto?.originalPrice || 0);
  const discountPct = product?.discountDto?.percentage || 0;
  const stock = product?.stockQuantity;
  const inStock = stock === undefined || stock === null ? true : stock > 0;
  const maxQty = stock > 0 ? stock : 99;
  const inCart = isItemInCart(id);
  const inWish = isInWishlist(id);

  const handleWishlist = useCallback(
    (e) => {
      e.preventDefault();
      toggleWishlist(id);
    },
    [toggleWishlist, id],
  );

  const handleAdd = useCallback(
    async (e) => {
      e.preventDefault();
      if (!inStock) return;
      setAdding(true);
      await addToCart(id, qty, { id, productName: name, imageUrl, currentPrice: price, discountDto: product?.discountDto, stockQuantity: stock });
      setAdding(false);
    },
    [addToCart, id, qty, name, imageUrl, price, product?.discountDto, stock, inStock],
  );

  return (
    <Link to={`/products/${id}`} className="group flex flex-col overflow-hidden rounded-lg border border-border bg-surface transition-shadow hover:shadow-card">
      <div className="relative aspect-[4/3] w-full bg-surface-sunken">
        {!imgError && imageUrl ? (
          <img src={imageUrl} alt={name} className="h-full w-full object-cover" onError={() => setImgError(true)} loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-muted">
            <ImageIcon size={30} />
          </div>
        )}

        {discountPct > 0 && (
          <span className="absolute left-2.5 top-2.5 rounded-md bg-danger px-2 py-0.5 text-[11px] font-bold text-white">-{discountPct}%</span>
        )}

        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface/80 text-[12px] font-semibold uppercase tracking-wide text-ink-muted">
            Out of stock
          </div>
        )}

        <button
          onClick={handleWishlist}
          className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-surface/90 text-ink shadow-card"
          title={inWish ? "Remove from wishlist" : "Add to wishlist"}
        >
          <HeartIcon size={15} filled={inWish} className={inWish ? "fill-current text-danger" : ""} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <h3 className="line-clamp-2 text-[13.5px] font-medium text-ink">{name}</h3>

        <div className="mt-auto flex items-center gap-2">
          <span className="text-[16px] font-semibold text-ink">{formatCurrency(price)}</span>
          {originalPrice > price && <span className="text-[12px] text-ink-muted line-through">{formatCurrency(originalPrice)}</span>}
        </div>

        {inStock && (
          <div className="mt-1 flex items-center gap-2" onClick={(e) => e.preventDefault()}>
            <div className="flex items-center rounded-md border border-border">
              <button onClick={(e) => { e.preventDefault(); setQty((q) => Math.max(1, q - 1)); }} className="flex h-7 w-7 items-center justify-center text-ink-secondary hover:bg-surface-sunken" disabled={qty <= 1}>
                <MinusIcon size={12} />
              </button>
              <span className="w-6 text-center text-[12px] font-medium text-ink">{qty}</span>
              <button onClick={(e) => { e.preventDefault(); setQty((q) => Math.min(maxQty, q + 1)); }} className="flex h-7 w-7 items-center justify-center text-ink-secondary hover:bg-surface-sunken" disabled={qty >= maxQty}>
                <PlusIcon size={12} />
              </button>
            </div>
            <button
              onClick={handleAdd}
              disabled={adding}
              className="flex h-7 flex-1 items-center justify-center gap-1.5 rounded-md bg-ink text-[11.5px] font-semibold text-ink-inverse hover:bg-ink/90 disabled:opacity-60"
            >
              {adding ? <SpinnerIcon size={12} /> : inCart ? <><CheckIcon size={12} /> In cart</> : <><CartIcon size={12} /> Add</>}
            </button>
          </div>
        )}
      </div>
    </Link>
  );
});

ProductCard.displayName = "ProductCard";
export default ProductCard;
