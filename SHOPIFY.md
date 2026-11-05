# Shopify shop

The homepage embeds `components/Shop.tsx` at `/#shop`. To reuse it on another
page, import `Shop` from `@/components/Shop` and render `<Shop />`.

## Connect the store

1. Add the values from `.env.shopify.example` to `.env.local` and your deployment
   environment. Set `SHOPIFY_STORE_DOMAIN` to the permanent `your-store.myshopify.com`
   hostname. Do not commit `.env.local`.
2. Configure Shopify's Headless sales channel and publish the products you want
   available to the storefront. Set up product images, variants, inventory,
   shipping, taxes, and payments in Shopify.
3. Basic product and cart operations use tokenless Storefront API access. If your
   setup requires a token, use a **public Storefront access token** for
   `SHOPIFY_STOREFRONT_ACCESS_TOKEN`. Do not use an Admin API token or a private token.
4. Restart the development server or redeploy after setting the environment.
5. Verify product options, sold-out variants, quantities, removal, and checkout.
   Complete a test order using Shopify's test payment configuration before launch.

The component shows only products in the Apparel collection (handle: `apparel`),
initially displaying three published products. Publish the collection and its
products to the connected storefront in Shopify. The Load more button
fetches the next three products and disappears when all products have loaded. Each
product includes up to 100 variants. The cart is shared across pages through the root CartProvider and resets on page reload. Navigation shows a badge with the total item quantity and opens a cart overlay on any page. Adding a product also opens the overlay. Checkout creates
an up-to-date Shopify cart and redirects to Shopify's hosted checkout. Shopify
validates availability and calculates final prices, shipping, and taxes. Product
and checkout requests stay on the Next.js server. API version: `2026-01`.

Without a configured store, visitors see a “coming soon” message. No sample
products or invented prices are shown.

Reference: https://shopify.dev/docs/api/storefront/2026-01
