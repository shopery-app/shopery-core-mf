import { useCallback, useEffect, useState } from "react";
import PageShell from "../../components/layout/PageShell";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { EmptyState, ErrorState, PageSpinner, Skeleton } from "../../components/ui/Feedback";
import { PlusIcon, EditIcon, TrashIcon, ImageIcon, StarIcon } from "../../components/ui/icons";
import ProductFormModal from "./ProductFormModal";
import SellerInbox from "./SellerInbox";
import AdvisoryChat from "../chat/AdvisoryChat";
import useProfile from "../../hooks/useProfile";
import * as shopsApi from "../../api/shops";
import * as productsApi from "../../api/products";
import { toImageSrc } from "../../utils/image";
import { formatCurrency, formatDate } from "../../utils/format";
import { useToast } from "../../components/ui/Toast";

const ShopDashboardPage = () => {
  const { profile } = useProfile();
  const { showToast } = useToast();

  const [shop, setShop] = useState(null);
  const [shopLoading, setShopLoading] = useState(true);
  const [shopError, setShopError] = useState("");

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const [modalState, setModalState] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadShop = useCallback(() => {
    setShopLoading(true);
    shopsApi
      .getMyShopDashboard()
      .then(setShop)
      .catch(() => setShopError("Failed to load your shop."))
      .finally(() => setShopLoading(false));
  }, []);

  const loadProducts = useCallback(() => {
    setProductsLoading(true);
    productsApi
      .getMyProducts({ page: 0, size: 50, sort: "createdAt,desc" })
      .then((data) => setProducts(data?.content || []))
      .catch(() => showToast("Failed to load your products.", "error"))
      .finally(() => setProductsLoading(false));
  }, [showToast]);

  useEffect(() => {
    loadShop();
    loadProducts();
  }, [loadShop, loadProducts]);

  const openEdit = async (product) => {
    try {
      const detail = await productsApi.getProductById(product.id);
      setModalState({ mode: "edit", data: detail });
    } catch {
      showToast("Could not load product details.", "error");
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await productsApi.deleteProduct(deleteTarget.id);
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
      showToast("Product removed.", "success");
    } finally {
      setDeleting(false);
    }
  };

  if (shopError) {
    return (
      <PageShell>
        <div className="mx-auto max-w-lg px-4 py-16">
          <ErrorState title="No active shop" description={shopError} />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {shopLoading ? (
          <PageSpinner />
        ) : (
          <>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-ink">{shop?.shopName}</h1>
                <p className="mt-1 text-[13.5px] text-ink-secondary">Since {formatDate(shop?.createdAt)}</p>
              </div>
              <Badge tone="accent">{shop?.subscriptionTier}</Badge>
            </div>

            <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Card padding="sm">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Total income</p>
                <p className="mt-1.5 text-lg font-semibold text-ink">{formatCurrency(shop?.totalIncome)}</p>
              </Card>
              <Card padding="sm">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Rating</p>
                <p className="mt-1.5 flex items-center gap-1 text-lg font-semibold text-ink">
                  <StarIcon size={15} className="text-warning" /> {(shop?.rating || 0).toFixed(1)}
                </p>
              </Card>
              <Card padding="sm">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Products</p>
                <p className="mt-1.5 text-lg font-semibold text-ink">{products.length}</p>
              </Card>
              <Card padding="sm">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Plan</p>
                <p className="mt-1.5 text-lg font-semibold text-ink">{shop?.subscriptionTier}</p>
              </Card>
            </div>

            <div className="mb-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-ink">Products</h2>
                <Button size="sm" onClick={() => setModalState({ mode: "add" })}>
                  <PlusIcon size={14} /> Add product
                </Button>
              </div>

              {modalState && (
                <ProductFormModal
                  initialData={modalState.mode === "edit" ? modalState.data : null}
                  onClose={() => setModalState(null)}
                  onSaved={() => {
                    setModalState(null);
                    loadProducts();
                  }}
                />
              )}
              <ConfirmDialog
                open={!!deleteTarget}
                title="Delete product"
                description="This product will be permanently removed from your shop."
                confirmLabel="Delete"
                destructive
                loading={deleting}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
              />

              {productsLoading ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-52 w-full rounded-lg" />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <EmptyState title="No products yet" description="Add your first product to start selling." action={<Button size="sm" onClick={() => setModalState({ mode: "add" })}>Add product</Button>} />
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {products.map((product) => {
                    const imageUrl = toImageSrc(product.image);
                    return (
                      <div key={product.id} className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface">
                        <div className="aspect-[4/3] bg-surface-sunken">
                          {imageUrl ? (
                            <img src={imageUrl} alt={product.productName} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-ink-muted">
                              <ImageIcon size={24} />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col gap-1.5 p-3.5">
                          <p className="line-clamp-1 text-[13px] font-medium text-ink">{product.productName}</p>
                          <p className="text-[14px] font-semibold text-ink">{formatCurrency(product.currentPrice)}</p>
                          <p className="text-[11.5px] text-ink-muted">{product.stockQuantity} in stock</p>
                          <div className="mt-auto flex gap-2 pt-2">
                            <button onClick={() => openEdit(product)} className="flex flex-1 items-center justify-center gap-1 rounded-md border border-border py-1.5 text-[11.5px] font-medium text-ink-secondary hover:bg-surface-sunken">
                              <EditIcon size={11} /> Edit
                            </button>
                            <button onClick={() => setDeleteTarget(product)} className="flex items-center justify-center rounded-md border border-border px-2.5 py-1.5 text-danger hover:bg-danger-subtle">
                              <TrashIcon size={11} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <SellerInbox currentUser={profile} />
              <AdvisoryChat isLocked={shop?.subscriptionTier !== "PREMIUM"} userName={`${profile?.firstName || ""} ${profile?.lastName || ""}`} userImage={profile?.profilePhoto} onUpgrade={() => showToast("Contact support to upgrade your plan.", "info")} />
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
};

export default ShopDashboardPage;
