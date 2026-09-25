import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageShell from "../../components/layout/PageShell";
import Button from "../../components/ui/Button";
import StarRating from "../../components/ui/StarRating";
import { PageSpinner, ErrorState, EmptyState } from "../../components/ui/Feedback";
import { Input } from "../../components/ui/FormField";
import { ArrowLeftIcon, SearchIcon, StoreIcon } from "../../components/ui/icons";
import ProductCard from "../products/ProductCard";
import BuyerChat from "../chat/BuyerChat";
import useProfile from "../../hooks/useProfile";
import * as shopsApi from "../../api/shops";
import { formatDate } from "../../utils/format";

const ShopDetailPage = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const { profile } = useProfile();

  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    shopsApi
      .getShopById(shopId)
      .then((data) => active && setShop(data))
      .catch((err) => active && setError(err?.response?.status === 404 ? "This shop could not be found." : "Failed to load this shop."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [shopId]);

  const filteredProducts = useMemo(() => {
    const products = shop?.products || [];
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter((p) => p.productName?.toLowerCase().includes(term) || p.description?.toLowerCase().includes(term));
  }, [shop, search]);

  if (loading) return <PageShell><PageSpinner /></PageShell>;

  if (error || !shop) {
    return (
      <PageShell>
        <div className="mx-auto max-w-xl px-4 py-16">
          <ErrorState title="Shop not found" description={error} action={<Button onClick={() => navigate("/shops")}>Back to shops</Button>} />
        </div>
      </PageShell>
    );
  }

  const isOwnShop = profile?.id && shop.sellerId && profile.id === shop.sellerId;

  return (
    <PageShell>
      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <button onClick={() => navigate("/shops")} className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-secondary hover:text-ink">
            <ArrowLeftIcon size={14} /> Back to shops
          </button>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-surface-sunken text-ink-secondary">
                <StoreIcon size={24} />
              </span>
              <div>
                <h1 className="text-2xl font-semibold text-ink">{shop.shopName}</h1>
                <div className="mt-1 flex items-center gap-2">
                  <StarRating value={shop.rating || 0} size={13} />
                  <span className="text-[13px] text-ink-muted">
                    {(shop.rating || 0).toFixed(1)} · Since {formatDate(shop.createdAt, { month: "short", year: "numeric" })}
                  </span>
                </div>
              </div>
            </div>
            <p className="max-w-md text-[13.5px] text-ink-secondary">{shop.description}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-ink">Products ({shop.products?.length || 0})</h2>
          <div className="relative w-full max-w-xs">
            <SearchIcon size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search this shop…" className="h-10 pl-9" />
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <EmptyState title="No products found" description={search ? "Try a different search term." : "This shop hasn't listed any products yet."} />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {!isOwnShop && <BuyerChat sellerId={shop.sellerId} shopName={shop.shopName} currentUser={profile} />}
    </PageShell>
  );
};

export default ShopDetailPage;
