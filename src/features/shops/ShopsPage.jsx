import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageShell from "../../components/layout/PageShell";
import PageHeader from "../../components/ui/PageHeader";
import { Input, Select } from "../../components/ui/FormField";
import Pagination from "../../components/ui/Pagination";
import { EmptyState, ErrorState, Skeleton } from "../../components/ui/Feedback";
import StarRating from "../../components/ui/StarRating";
import { SearchIcon, StoreIcon } from "../../components/ui/icons";
import * as shopsApi from "../../api/shops";

const PAGE_SIZE = 12;

const ShopsPage = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(0);

  useEffect(() => {
    let active = true;
    shopsApi
      .getAllShops({ page: 0, size: 200 })
      .then((data) => active && setShops(data?.content || []))
      .catch(() => active && setError("Failed to load shops."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    let list = term ? shops.filter((s) => s.shopName?.toLowerCase().includes(term)) : shops;
    list = [...list].sort((a, b) => {
      if (sort === "name") return (a.shopName || "").localeCompare(b.shopName || "");
      if (sort === "rating") return (b.rating || 0) - (a.rating || 0);
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
    return list;
  }, [shops, search, sort]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paged = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  useEffect(() => setPage(0), [search, sort]);

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <PageHeader title="Shops" description="Browse independent sellers on Shopery." />

        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <SearchIcon size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search shops by name…" className="h-11 pl-10" />
          </div>
          <Select value={sort} onChange={(e) => setSort(e.target.value)} className="sm:w-56">
            <option value="newest">Newest first</option>
            <option value="name">Name: A to Z</option>
            <option value="rating">Highest rated</option>
          </Select>
        </div>

        {error && <ErrorState description={error} />}

        {!error && loading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-lg" />
            ))}
          </div>
        )}

        {!error && !loading && paged.length === 0 && (
          <EmptyState icon={StoreIcon} title="No shops found" description={search ? `No shops match "${search}".` : "No shops are available yet."} />
        )}

        {!loading && paged.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paged.map((shop) => (
                <Link key={shop.id} to={`/shop/${shop.id}`} className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5 transition-shadow hover:shadow-card">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-md bg-surface-sunken text-ink-secondary">
                      <StoreIcon size={18} />
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate text-[14px] font-semibold text-ink">{shop.shopName}</h3>
                      <StarRating value={shop.rating || 0} size={12} />
                    </div>
                  </div>
                  <p className="line-clamp-2 text-[13px] text-ink-secondary">{shop.description || "No description provided."}</p>
                </Link>
              ))}
            </div>
            <div className="mt-8">
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
};

export default ShopsPage;
