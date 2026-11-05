import { NextResponse } from "next/server";
import { shopify, shopifyConfigured, type ShopProduct } from "@/lib/shopify";

export async function GET(request: Request) {
  const after = new URL(request.url).searchParams.get("after");
  if (!shopifyConfigured()) return NextResponse.json({ products: [], configured: false });
  try {
    const data = await shopify<{ collection: { products: { nodes: ShopProduct[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } } } | null }>(`query Products($after: String) {
      collection(handle: "apparel") {
      products(first: 3, after: $after, sortKey: TITLE) { pageInfo { hasNextPage endCursor } nodes {
        id title description featuredImage { url altText }
        variants(first: 100) { nodes { id title availableForSale price { amount currencyCode } } }
      } }
      }
    }`, { after });
    const products = data.collection?.products;
    return NextResponse.json({
      products: products?.nodes ?? [],
      pageInfo: products?.pageInfo ?? { hasNextPage: false, endCursor: null },
      configured: true,
    });
  } catch (error) {
    console.error("Shopify products:", error);
    return NextResponse.json({ error: "The shop is temporarily unavailable. Please try again shortly." }, { status: 502 });
  }
}
