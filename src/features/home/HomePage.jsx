import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageShell from "../../components/layout/PageShell";
import ProductCard from "../products/ProductCard";
import { Skeleton } from "../../components/ui/Feedback";
import { CATEGORY_META } from "../../constants/catalog";
import { ArrowRightIcon, StoreIcon, CartIcon } from "../../components/ui/icons";
import * as productsApi from "../../api/products";
import * as dropdownsApi from "../../api/dropdowns";

const HomePage = () => {
  const [deals, setDeals] = useState([]);
  const [dealsLoading, setDealsLoading] = useState(true);
  const [categories, setCategories] = useState(Object.keys(CATEGORY_META));

  useEffect(() => {
    let active = true;
    productsApi
      .getTopDiscountedProducts({ page: 0, size: 8 })
      .then((data) => active && setDeals(data?.content || []))
      .catch(() => {})
      .finally(() => active && setDealsLoading(false));

    dropdownsApi
      .getDropdown("product-categories")
      .then((data) => active && Array.isArray(data) && data.length && setCategories(data))
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  return (
    <PageShell>
      {/* Hero */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:items-center md:py-24">
          <div>
            <p className="mb-4 inline-flex items-center rounded-full border border-border bg-surface-sunken px-3 py-1 text-[12px] font-medium text-ink-secondary">
              A marketplace of independent shops
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-ink sm:text-5xl">
              Shop smarter. <br className="hidden sm:block" />
              Sell without limits.
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-secondary">
              Discover electronics, fashion, home goods and more from independent sellers — or open your own shop in minutes.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/products" className="inline-flex items-center gap-2 rounded-md bg-ink px-5 py-3 text-[14px] font-semibold text-ink-inverse hover:bg-ink/90">
                <CartIcon size={16} /> Shop products
              </Link>
              <Link to="/shops" className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-3 text-[14px] font-semibold text-ink hover:bg-surface-sunken">
                <StoreIcon size={16} /> Explore shops
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-3">
            {Object.entries(CATEGORY_META).slice(0, 6).map(([key, meta]) => (
              <Link
                key={key}
                to={`/products?category=${key}`}
                className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-border bg-canvas p-5 text-center transition-colors hover:border-border-strong hover:bg-surface-sunken"
              >
                <span className="text-[13px] font-semibold text-ink">{meta.label}</span>
                <span className="text-[11px] text-ink-muted">{meta.blurb}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categories bar */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Link
              key={cat}
              to={`/products?category=${cat}`}
              className="rounded-full border border-border px-4 py-2 text-[13px] font-medium text-ink-secondary hover:border-border-strong hover:text-ink"
            >
              {CATEGORY_META[cat]?.label || cat}
            </Link>
          ))}
        </div>
      </section>

      {/* Top deals */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold text-ink">Today&apos;s top deals</h2>
            <p className="mt-1 text-[13.5px] text-ink-secondary">The best discounts across the marketplace right now.</p>
          </div>
          <Link to="/products" className="hidden items-center gap-1 text-[13px] font-medium text-ink-secondary hover:text-ink sm:flex">
            View all <ArrowRightIcon size={14} />
          </Link>
        </div>

        {dealsLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5.2] w-full rounded-lg" />
            ))}
          </div>
        ) : deals.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {deals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-[13.5px] text-ink-muted">No active discounts at the moment — check back soon.</p>
        )}
      </section>

      {/* Sell CTA */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 rounded-lg border border-border bg-surface p-8 sm:flex-row sm:p-10">
          <div>
            <h2 className="text-xl font-semibold text-ink">Have something to sell?</h2>
            <p className="mt-1.5 max-w-md text-[13.5px] text-ink-secondary">
              Open a shop, list your products, and reach buyers across the marketplace — free to start.
            </p>
          </div>
          <Link to="/profile" className="inline-flex shrink-0 items-center gap-2 rounded-md bg-ink px-5 py-3 text-[14px] font-semibold text-ink-inverse hover:bg-ink/90">
            <StoreIcon size={16} /> Start selling
          </Link>
        </div>
      </section>
    </PageShell>
  );
};

export default HomePage;
