# Tiny Desk AI Videos — visual preview branch

This branch turns the former multi-template Zombie Video Lab site into a **single-topic site with a homepage and editorial guides** for `tinydeskaivideos.com`. The reference site informs the dark purple / hot pink visual language, centered hero, split studio and preview, pricing cards, and responsive layout. The studio preview plays a fixed reference sample from R2; the concert artwork is original concept art, not a generated result.

## Current state

- The homepage lets visitors preview a portrait locally, switch between planned 480p ($5.99) and 720p ($8.99) prices, and inspect the concept preview, pricing and FAQs.
- **Video generation and purchase are not wired to the new Tiny Desk product.** The button is disabled; no portrait is sent from the homepage and no Stripe checkout is offered here. Do not turn on payment until the product, prompt, provider workflow, sample output, safety and legal pages have been updated and verified.
- Former zombie/tiptoeing public pages and old legal drafts were removed from this branch. Six new Tiny Desk editorial guides live under `/blog` and are linked from the homepage. Illustrations are concept artwork; the sample video is a reference, not a visitor-generated result. The existing backend/API source is retained for later adaptation; legacy checkout is disabled by default with `TINY_DESK_CHECKOUT_ENABLED=false`. Do not enable it until the product and checkout are replaced.
- This is an unofficial Tiny Desk-inspired concept, not an NPR product.

## Local checks

Run `npm run dev`, `npm run typecheck`, `npm run build`, and `node --test tests/tiny-homepage.test.cjs`. Next may retain generated route types under `.next` or `.next-dev` after deleting pages; run `npx next typegen` and start the dev server once to refresh both caches before typechecking. Compare desktop and mobile layouts in the browser.

Canonical, sitemap, and robots URLs are pinned to `https://tinydeskaivideos.com` on this branch, even if a deployment retains an old site URL environment variable. Review database and old API routes separately before enabling generation or checkout. Publish appropriate product-specific privacy, terms, and refund policies before launching payments; the footer currently labels these as forthcoming rather than linking to obsolete Zombie policies.
