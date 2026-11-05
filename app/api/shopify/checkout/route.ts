import { NextResponse } from "next/server";
import { shopify, shopifyConfigured } from "@/lib/shopify";

export async function POST(request: Request) {
  if (!shopifyConfigured()) return NextResponse.json({ error: "The shop is not connected yet." }, { status: 503 });
  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid cart." }, { status: 400 });
  }
  const lines = body?.lines;
  if (!Array.isArray(lines) || lines.length === 0 || lines.length > 50 || lines.some((line) =>
    !line || typeof line.merchandiseId !== "string" || !/^gid:\/\/shopify\/ProductVariant\/\d+$/.test(line.merchandiseId) ||
    !Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 99
  )) return NextResponse.json({ error: "Please check the items and quantities in your cart." }, { status: 400 });
  try {
    const data = await shopify<{ cartCreate: {
      cart: { checkoutUrl: string } | null;
      userErrors: { message: string }[];
      warnings?: { message: string }[];
    } }>(`mutation Checkout($input: CartInput!) {
      cartCreate(input: $input) { cart { checkoutUrl } userErrors { message } warnings { message } }
    }`, { input: { lines: lines.map(({ merchandiseId, quantity }) => ({ merchandiseId, quantity })) } });
    const result = data.cartCreate;
    if (result.userErrors.length || result.warnings?.length || !result.cart) {
      return NextResponse.json({ error: [...result.userErrors, ...(result.warnings ?? [])].map(e => e.message).join(" ") || "Unable to create checkout." }, { status: 422 });
    }
    return NextResponse.json({ checkoutUrl: result.cart.checkoutUrl });
  } catch (error) {
    console.error("Shopify checkout:", error);
    return NextResponse.json({ error: "Checkout is temporarily unavailable. Please try again." }, { status: 502 });
  }
}
