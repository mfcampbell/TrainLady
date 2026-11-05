"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useCart } from "@/components/CartProvider";

const money = (amount: string | number, currency: string) =>
  new Intl.NumberFormat("en-CA", { style: "currency", currency }).format(Number(amount));

export default function CartOverlay() {
  const { cart, setCart, isOpen, setIsOpen } = useCart();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!isOpen) {
      if (dialog.open) dialog.close();
      return;
    }
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      if (dialog.open) dialog.close();
      previousFocus?.focus();
    };
  }, [isOpen]);

  async function checkout() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/shopify/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines: cart.map(line => ({ merchandiseId: line.variant.id, quantity: line.quantity })) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      const url = new URL(data.checkoutUrl);
      if (url.protocol !== "https:") throw new Error("Unable to open checkout.");
      window.location.assign(url.href);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to open checkout."); }
    finally { setBusy(false); }
  }

  return (
    <dialog ref={dialogRef} id="cart-overlay" aria-labelledby="cart-overlay-heading"
      onCancel={() => setIsOpen(false)} onClose={() => setIsOpen(false)}
      onClick={event => { if (event.target === event.currentTarget) setIsOpen(false); }}
      className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-2xl border border-black/10 bg-[var(--butter)] p-0 text-[#1c1c1c] shadow-2xl backdrop:bg-black/50">
      <div className="relative" onClick={event => event.stopPropagation()}>
        <header className="flex items-center justify-between border-b border-black/10 px-6 py-4">
          <h2 id="cart-overlay-heading" className="text-2xl font-bold">Your cart</h2>
          <button type="button" autoFocus onClick={() => setIsOpen(false)} aria-label="Close shopping cart" className="cursor-pointer rounded p-2 focus-visible:outline-2 focus-visible:outline-[#1c1c1c]">
            <X aria-hidden="true" className="h-6 w-6" />
          </button>
        </header>
        <div className="p-6">
          {cart.length > 0 ? <>
          
          <ul className="divide-y divide-black/10">{cart.map(line => <li key={line.variant.id} className="py-4 flex flex-wrap items-center gap-4">
            <div className="flex w-full items-center gap-4">
              {line.image ? (
                // Shopify CDN images use the same native rendering as the product cards.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={line.image.url} alt={line.image.altText ?? line.title} width={80} height={80} loading="lazy" className="h-20 w-20 shrink-0 rounded-lg border border-black/10 object-cover" />
              ) : <div aria-hidden="true" className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-black/10 text-center text-xs">No image</div>}
              <span className="min-w-0 flex-1 break-words">{line.title}{line.variant.title !== "Default Title" && ` — ${line.variant.title}`}</span>
            </div>
            <label>Quantity <input type="number" min={1} max={99} disabled={busy} value={line.quantity} aria-label={`Quantity for ${line.title}, ${line.variant.title}`} className="border rounded p-2 w-20 ml-2" onChange={e => {
              const quantity = Number(e.target.value);
              if (Number.isInteger(quantity) && quantity >= 1 && quantity <= 99) setCart(current => current.map(item => item.variant.id === line.variant.id ? { ...item, quantity } : item));
            }} /></label>
            <span>{money(Number(line.variant.price.amount) * line.quantity, line.variant.price.currencyCode)}</span>
            <button disabled={busy} className="underline" aria-label={`Remove ${line.title}, ${line.variant.title}`} onClick={() => setCart(current => current.filter(item => item.variant.id !== line.variant.id))}>Remove</button>
          </li>)}</ul>
          <div aria-live="polite" className="font-bold my-4">{[...new Set(cart.map(line => line.variant.price.currencyCode))].map(currency => <p key={currency}>Subtotal: {money(cart.filter(line => line.variant.price.currencyCode === currency).reduce((sum, line) => sum + Number(line.variant.price.amount) * line.quantity, 0), currency)} {currency}</p>)}</div>
          <p className="mb-4 text-sm">Shipping, taxes, and available discounts are calculated at checkout.</p>
          {error && <p role="alert" className="mb-4 text-[#1c1c1c]">{error}</p>}
          <button disabled={busy} onClick={checkout} className="cursor-pointer rounded border border-[#1c1c1c]/20 bg-[var(--butter)] px-6 py-3 font-bold text-[#1c1c1c] hover:underline disabled:cursor-not-allowed disabled:opacity-50">{busy ? "Opening checkout…" : "Checkout with Shopify"}</button>
          </> : <><p>Your cart is empty. Browse our merch to find something for your next journey.</p></>}
        </div>
      </div>
    </dialog>
  );
}
