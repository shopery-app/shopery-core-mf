import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageShell from "../../components/layout/PageShell";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { PageSpinner, ErrorState } from "../../components/ui/Feedback";
import { ArrowLeftIcon, HeartIcon, ImageIcon, MinusIcon, PlusIcon, StoreIcon } from "../../components/ui/icons";
import useCart from "../../hooks/useCart";
import useWishlist from "../../hooks/useWishlist";
import * as productsApi from "../../api/products";
import { toImageSrc } from "../../utils/image";
import { formatCurrency, formatDate, formatEnumLabel } from "../../utils/format";

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  const { addToCart, isItemInCart } = useCart({ autoFetch: false });
  const { isInWishlist, toggleWishlist } = useWishlist({ autoFetch: false });

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    productsApi
      .getProductById(productId)
      .then((data) => active && setProduct(data))
      .catch(() => active && setError("This product could not be found."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [productId]);

  if (loading) return <PageShell><PageSpinner /></PageShell>;

  if (error || !product) {
    return (
      <PageShell>
        <div className="mx-auto max-w-xl px-4 py-16">
          <ErrorState title="Product not found" description={error} action={<Button onClick={() => navigate("/products")}>Back to products</Button>} />
        </div>
      </PageShell>
    );
  }

  const imageUrl = toImageSrc(product.image);
  const price = Number(product.currentPrice || 0);
  const originalPrice = Number(product.discountDto?.originalPrice || 0);
  const discountPct = product.discountDto?.percentage || 0;
  const inStock = product.stockQuantity > 0;
  const maxQty = product.stockQuantity > 0 ? product.stockQuantity : 99;
  const inCart = isItemInCart(product.id);
  const inWish = isInWishlist(product.id);

  const handleAdd = async () => {
    setAdding(true);
    await addToCart(product.id, qty, {
      id: product.id,
      productName: product.productName,
      imageUrl,
      currentPrice: price,
      discountDto: product.discountDto,
      stockQuantity: product.stockQuantity,
    });
    setAdding(false);
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Link to="/products" className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-secondary hover:text-ink">
          <ArrowLeftIcon size={14} /> Back to products
        </Link>

        <div className="grid gap-10 md:grid-cols-2">
          <div className="aspect-square w-full overflow-hidden rounded-lg border border-border bg-surface-sunken">
            {imageUrl ? (
              <img src={imageUrl} alt={product.productName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-ink-muted">
                <ImageIcon size={48} />
              </div>
            )}
          </div>

          <div>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {product.category && <Badge tone="neutral">{formatEnumLabel(product.category)}</Badge>}
              {product.condition && <Badge tone="accent">{formatEnumLabel(product.condition)}</Badge>}
            </div>

            <h1 className="text-2xl font-semibold text-ink">{product.productName}</h1>

            {product.shopName && (
              <Link to={`/shop/${product.shopId}`} className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-secondary hover:text-ink">
                <StoreIcon size={14} /> {product.shopName}
              </Link>
            )}

            <div className="mt-5 flex items-baseline gap-3">
              <span className="text-3xl font-semibold text-ink">{formatCurrency(price)}</span>
              {originalPrice > price && <span className="text-[15px] text-ink-muted line-through">{formatCurrency(originalPrice)}</span>}
              {discountPct > 0 && <Badge tone="danger">-{discountPct}%</Badge>}
            </div>

            <p className="mt-2 text-[13px] font-medium text-ink-secondary">
              {inStock ? `${product.stockQuantity} in stock` : "Out of stock"}
            </p>

            {product.description && <p className="mt-5 text-[14px] leading-relaxed text-ink-secondary">{product.description}</p>}

            {inStock && (
              <div className="mt-7 flex items-center gap-3">
                <div className="flex items-center rounded-md border border-border">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} className="flex h-11 w-11 items-center justify-center text-ink-secondary hover:bg-surface-sunken">
                    <MinusIcon size={14} />
                  </button>
                  <span className="w-10 text-center text-[14px] font-medium text-ink">{qty}</span>
                  <button onClick={() => setQty((q) => Math.min(maxQty, q + 1))} disabled={qty >= maxQty} className="flex h-11 w-11 items-center justify-center text-ink-secondary hover:bg-surface-sunken">
                    <PlusIcon size={14} />
                  </button>
                </div>
                <Button size="lg" className="flex-1" loading={adding} onClick={handleAdd}>
                  {inCart ? "Add more to cart" : "Add to cart"}
                </Button>
                <Button size="lg" variant="outline" onClick={() => toggleWishlist(product.id)} aria-label="Toggle wishlist">
                  <HeartIcon size={16} filled={inWish} className={inWish ? "text-danger" : ""} />
                </Button>
              </div>
            )}

            {product.createdAt && <p className="mt-6 text-xs text-ink-muted">Listed {formatDate(product.createdAt)}</p>}

            {product.priceHistory?.length > 1 && (
              <div className="mt-8 border-t border-border pt-5">
                <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-ink-muted">Price history</h3>
                <ul className="space-y-1 text-[13px] text-ink-secondary">
                  {product.priceHistory
                    .slice()
                    .reverse()
                    .slice(0, 5)
                    .map((entry, i) => (
                      <li key={i} className="flex justify-between">
                        <span>{formatDate(entry.setAt)}</span>
                        <span className="font-medium text-ink">{formatCurrency(entry.price)}</span>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default ProductDetailPage;
