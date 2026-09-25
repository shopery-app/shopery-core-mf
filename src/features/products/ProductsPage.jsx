import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PageShell from "../../components/layout/PageShell";
import PageHeader from "../../components/ui/PageHeader";
import { Input, Select } from "../../components/ui/FormField";
import Button from "../../components/ui/Button";
import { EmptyState, ErrorState, Skeleton } from "../../components/ui/Feedback";
import { SearchIcon, FilterIcon } from "../../components/ui/icons";
import ProductCard from "./ProductCard";
import useProducts from "../../hooks/useProducts";
import * as dropdownsApi from "../../api/dropdowns";
import { formatEnumLabel } from "../../utils/format";

const PRICE_RANGES = [
  { label: "Any price", value: "" },
  { label: "Under $25", value: "0,25" },
  { label: "$25 – $50", value: "25,50" },
  { label: "$50 – $100", value: "50,100" },
  { label: "$100 – $200", value: "100,200" },
  { label: "Over $200", value: "200,999999" },
];

const SORT_OPTIONS = [
  { label: "Newest first", value: "createdAt,desc" },
  { label: "Oldest first", value: "createdAt,asc" },
  { label: "Price: low to high", value: "currentPrice,asc" },
  { label: "Price: high to low", value: "currentPrice,desc" },
  { label: "Name: A to Z", value: "productName,asc" },
];

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const { products, loading, error, filters, pagination, hasMoreProducts, loadMoreProducts, filterProducts, resetFilters, refreshProducts } = useProducts();
  const [searchTerm, setSearchTerm] = useState(filters.keyword || "");
  const [categories, setCategories] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dropdownsApi.getDropdown("product-categories").then(setCategories).catch(() => {});
    dropdownsApi.getDropdown("product-conditions").then(setConditions).catch(() => {});
  }, []);

  useEffect(() => {
    const category = searchParams.get("category");
    if (category) filterProducts({ category });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    filterProducts({ keyword: searchTerm });
  };

  const priceValue = filters.priceRange ? filters.priceRange.join(",") : "";

  const activeFilterCount = [filters.category, filters.condition, filters.priceRange, filters.keyword].filter(Boolean).length;

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <PageHeader
          title="All products"
          description="Browse products from every shop on Shopery."
          actions={
            <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setShowFilters((s) => !s)}>
              <FilterIcon size={14} /> Filters
            </Button>
          }
        />

        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative max-w-xl">
            <SearchIcon size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
            <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search products…" className="h-11 pl-10" />
          </div>
        </form>

        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className={`${showFilters ? "block" : "hidden"} shrink-0 lg:block lg:w-64`}>
            <div className="space-y-6 rounded-lg border border-border bg-surface p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-[13.5px] font-semibold text-ink">Filters</h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => {
                      resetFilters();
                      setSearchTerm("");
                    }}
                    className="text-[12px] font-medium text-ink-secondary hover:text-ink"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div>
                <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-ink-muted">Category</p>
                <div className="space-y-1">
                  {categories.map((c) => (
                    <label key={c} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-ink-secondary hover:bg-surface-sunken">
                      <input type="radio" name="category" checked={filters.category === c} onChange={() => filterProducts({ category: c })} className="accent-ink" />
                      {formatEnumLabel(c)}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-ink-muted">Price</p>
                <Select value={priceValue} onChange={(e) => filterProducts({ priceRange: e.target.value ? e.target.value.split(",").map(Number) : null })}>
                  {PRICE_RANGES.map((r) => (
                    <option key={r.label} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-ink-muted">Condition</p>
                <div className="space-y-1">
                  {conditions.map((c) => (
                    <label key={c} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-ink-secondary hover:bg-surface-sunken">
                      <input type="radio" name="condition" checked={filters.condition === c} onChange={() => filterProducts({ condition: c })} className="accent-ink" />
                      {formatEnumLabel(c)}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[13px] text-ink-secondary">{pagination.totalElements} products found</p>
              <Select value={filters.sort} onChange={(e) => filterProducts({ sort: e.target.value })} className="w-auto">
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </div>

            {error && <ErrorState description={error} action={<Button size="sm" onClick={refreshProducts}>Try again</Button>} />}

            {!error && loading && products.length === 0 && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[4/5.2] w-full rounded-lg" />
                ))}
              </div>
            )}

            {!error && !loading && products.length === 0 && (
              <EmptyState title="No products found" description="Try adjusting your search or filters." action={<Button size="sm" onClick={resetFilters}>Clear filters</Button>} />
            )}

            {products.length > 0 && (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                {hasMoreProducts && (
                  <div className="mt-8 flex justify-center">
                    <Button variant="outline" loading={loading} onClick={loadMoreProducts}>
                      Load more
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default ProductsPage;
