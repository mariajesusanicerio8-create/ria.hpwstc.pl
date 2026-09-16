# IONTECH Product Catalog — GitHub Pages

A responsive, readable public catalog generated from the supplied **IONTECH WS AND TC PL — September 2026** CSV.

## Included

- Public product catalog (`index.html`)
- Product search and category filtering
- Product detail modal with:
  - description
  - VAT-inclusive pricing
  - on-hand / order-basis pricing for the workstation catalog
  - detailed specifications from the source file
  - component / part lists from the source file
- Thin Client catalog entries with source labels **DP with VAT** and **SRP**
- Two image slots for every product
- Company logo upload area
- Product-level SEO:
  - dynamic page title
  - meta description
  - canonical URL
  - Product JSON-LD structured data
- Admin page (`admin.html`)
- Mobile-friendly, high-contrast, large-readable interface

## Publish on GitHub Pages

1. Create a new GitHub repository.
2. Upload everything in this folder to the repository root.
3. Go to **Settings → Pages**.
4. Choose **Deploy from a branch**.
5. Select the `main` branch and `/ (root)`.
6. Save and open the generated GitHub Pages URL.

## Admin login

The demo password is configured in:

`assets/admin.js`

Search for:

`const ADMIN_PASSWORD="CHANGE-ME-1234";`

Change it before testing.

### Security warning

This is a **static GitHub Pages implementation**. A password embedded in JavaScript is not a secure authentication system because visitors can inspect the source code.

The admin currently stores edits and uploaded images in the browser's local storage. Therefore:

- An image uploaded on one computer is not automatically visible to another visitor.
- Product changes are not automatically committed back to GitHub.
- Do not use the included password as real security for sensitive pricing or business data.

## Recommended production architecture

For a genuinely public website with a secure admin portal, keep this frontend on GitHub Pages and connect the admin area to:

- Supabase Auth for admin login
- Supabase Storage for product images
- Supabase Postgres for products, pricing, specs and components

That architecture lets an authorized admin update a product once and have the changes appear publicly for every visitor.

## Logo

The admin page has a logo upload area. For a permanent public logo on GitHub Pages, the most reliable approach is to place your company logo in `assets/` and reference it in the site settings, or connect the logo upload to Supabase Storage.

## Source data

The site was generated from the uploaded CSV. Product rows and detailed workstation specification/component sections were mapped into `data/products.js`.
