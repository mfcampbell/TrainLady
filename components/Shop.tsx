"use client";

import { useEffect, useState } from "react";
import type { ShopProduct, ShopVariant } from "@/lib/shopify";

import { useCart } from "@/components/CartProvider";
const money = (amount: string | number, currency: string) =>
  new Intl.NumberFormat("en-CA", { style: "currency", currency }).format(Number(amount));

export default function Shop() {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [pageInfo, setPageInfo] = useState<{ hasNextPage: boolean; endCursor: string | null }>({ hasNextPage: false, endCursor: null });
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState("");
  const [selected, setSelected] = useState<Record<string, string>>({});
  const { setCart, setIsOpen } = useCart();
  const [status, setStatus] = useState("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    fetch("/api/shopify/products", { signal: controller.signal })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setProducts(data.products);
        setPageInfo(data.pageInfo ?? { hasNextPage: false, endCursor: null });
        setStatus(data.configured ? "ready" : "unconfigured");
      })
      .catch(e => { if (e.name !== "AbortError") setStatus("error"); });
    return () => controller.abort();
  }, [attempt]);

  async function loadMore() {
    if (loadingMore || !pageInfo.hasNextPage || !pageInfo.endCursor) return;
    setLoadingMore(true);
    setLoadMoreError("");
    try {
      const response = await fetch(`/api/shopify/products?after=${encodeURIComponent(pageInfo.endCursor)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setProducts(current => {
        const ids = new Set(current.map(product => product.id));
        return [...current, ...data.products.filter((product: ShopProduct) => !ids.has(product.id))];
      });
      setPageInfo(data.pageInfo ?? { hasNextPage: false, endCursor: null });
    } catch {
      setLoadMoreError("Unable to load more products. Please try again.");
    } finally {
      setLoadingMore(false);
    }
  }

  function add(product: ShopProduct, variant: ShopVariant) {
    setCart(current => {
      const existing = current.find(line => line.variant.id === variant.id);
      return existing ? current.map(line => line.variant.id === variant.id ? { ...line, quantity: Math.min(99, line.quantity + 1) } : line)
        : [...current, { variant, title: product.title, image: product.featuredImage, quantity: 1 }];
    });
    setIsOpen(true);
  }


  return (
    <section id="shop" aria-labelledby="shop-heading" className="px-4 py-16 scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        <div aria-live="polite">
          {status === "loading" && <p className="text-center">Loading the shop…</p>}
          {status === "unconfigured" && <p className="text-center">Our shop is coming soon. Please check back for products.</p>}
          {status === "error" && <div className="text-center"><p>The shop is temporarily unavailable.</p><button className="underline mt-3" onClick={() => setAttempt(n => n + 1)}>Try again</button></div>}
          {status === "ready" && products.length === 0 && <p className="text-center">New products are on their way. Please check back soon.</p>}
        </div>
        <div id="shop-products" aria-busy={loadingMore} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map(product => {
            const variant = product.variants.nodes.find(v => v.id === selected[product.id]) ?? product.variants.nodes.find(v => v.availableForSale) ?? product.variants.nodes[0];
            return <article key={product.id} className="flex flex-col overflow-hidden rounded-xl border border-[var(--green)]/20 bg-[var(--butter)] text-[var(--green)]">
              {product.featuredImage ? (
                // Shopify serves product images from its CDN; native images avoid remote host configuration.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.featuredImage.url} alt={product.featuredImage.altText ?? product.title} loading="lazy" className="w-full aspect-square object-cover" />
              ) : <div className="flex aspect-square items-center justify-center bg-[var(--green)] text-[var(--butter)]">Train Lady</div>}
              <div className="p-6 flex flex-col flex-1 gap-4">
                <h3 className="text-xl font-bold">{product.title}</h3>
                <p className="line-clamp-3">{product.description}</p>
                {product.variants.nodes.length > 1 && <label className="flex flex-col gap-2">Options for {product.title}
                  <select className="rounded border border-[var(--green)]/30 bg-[var(--butter)] p-2 text-[var(--green)]" value={variant?.id ?? ""} onChange={e => setSelected({ ...selected, [product.id]: e.target.value })}>
                    {product.variants.nodes.map(v => <option key={v.id} value={v.id}>{v.title}{!v.availableForSale ? " — Sold out" : ""}</option>)}
                  </select>
                </label>}
                {variant && <p className="font-semibold">{money(variant.price.amount, variant.price.currencyCode)} {variant.price.currencyCode}</p>}
                <button disabled={!variant?.availableForSale} onClick={() => variant && add(product, variant)} className="mt-auto cursor-pointer rounded bg-[var(--green)] px-6 py-3 font-bold text-[var(--butter)] hover:bg-[rgba(69,100,68,0.8)] focus:bg-[rgba(69,100,68,0.6)] disabled:cursor-not-allowed disabled:opacity-50">{variant?.availableForSale ? "Add to cart" : "Sold out"}</button>
              </div>
            </article>;
          })}
        </div>
        {status === "ready" && products.length > 0 && <div className="text-center mt-8">
          <p aria-live="polite" className="text-sm mb-4">Showing {products.length} products</p>
          {loadMoreError && <p role="alert" className="text-red-700 mb-4">{loadMoreError}</p>}
          {pageInfo.hasNextPage && <button type="button" aria-controls="shop-products" disabled={loadingMore} onClick={loadMore} className="cursor-pointer rounded bg-[var(--butter)] px-6 py-3 font-semibold text-[#1c1c1c] disabled:cursor-wait disabled:opacity-50">
            {loadingMore ? "Loading…" : "Load more"}
          </button>}
        </div>}

      </div>
    </section>
  );
}
