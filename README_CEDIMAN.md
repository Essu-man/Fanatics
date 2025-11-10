# cediman — Football jerseys storefront (prototype)

This repository is a Next.js (App Router) prototype for "cediman" — a curated football jerseys storefront. It includes a small homepage, components, and sample product data so you can preview the UI quickly.

## What I added

- A modern homepage with hero and featured product grid (`app/page.tsx`).
- Components: `Header`, `Hero`, `ProductCard`, `Footer` in `app/components/`.
- A small product dataset in `lib/products.ts` used to populate the grid.

## Run locally (Windows PowerShell)

1. Install dependencies

```powershell
npm install
```

2. Start the dev server

```powershell
npm run dev
```

3. Open http://localhost:3000 in your browser.

## Next steps

- Wire a cart state (client-side or with a backend).
- Add product detail pages and image assets in `public/`.
- Integrate real payments and an orders backend for production.

For more on Next.js, see the official documentation: https://nextjs.org/docs
