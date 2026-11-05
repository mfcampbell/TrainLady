import "server-only";

export type ShopVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: { amount: string; currencyCode: string };
};
export type ShopProduct = {
  id: string;
  title: string;
  description: string;
  featuredImage: { url: string; altText: string | null } | null;
  variants: { nodes: ShopVariant[] };
};

export function shopifyConfigured() {
  return Boolean(process.env.SHOPIFY_STORE_DOMAIN);
}

export async function shopify<T>(query: string, variables = {}): Promise<T> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN?.trim();
  if (!domain || !/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i.test(domain)) {
    throw new Error("Set SHOPIFY_STORE_DOMAIN to your store's myshopify.com hostname.");
  }
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const response = await fetch(`https://${domain}/api/2026-01/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "X-Shopify-Storefront-Access-Token": token } : {}),
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`Shopify request failed (${response.status}).`);
  const result = await response.json();
  if (result.errors?.length || !result.data) throw new Error("Shopify could not complete the request.");
  return result.data as T;
}
