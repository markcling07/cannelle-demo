# GROUPE JAOVAZAHA — bilingual spice shop demonstration

A working demonstration of **Payload CMS 3** connected to a **React / Next.js**
front end: a small catalogue of Madagascar spices and fine foods, with a
journal, managed independently in **French and English**.

The site carries the client's name, **GROUPE JAOVAZAHA**, and logo. The name,
logo, tagline and newsletter wording are all one field each under
**Site settings**, so they can be changed in the admin panel. No code change
needed.

All content in this project is fictional sample content. Nothing here is
connected to groupejaovazaha.com, and no paid service is required to run it.

---

## What the demonstration covers

| Asked for | Where it is |
|---|---|
| Secure login to the administration area | `/admin` — password hashing, HTTP-only session cookie, account locks after 5 failed attempts |
| Create a product in French and English | Products → Create New, then switch the **Locale** selector top right |
| Add a photograph, description, other information | Main photograph, full description, key features, price, reference |
| Edit the product | Open it, change it, **Publish changes** |
| Delete the product | Open it, ⋯ menu → Delete |
| Publish and view on the public site | **Publish changes**, then `/fr` or `/en` |
| Works on computer and mobile | One responsive layout, 1 / 2 / 3 columns by screen width |

Plus, beyond the agreed list:

| Also included | Where it is |
|---|---|
| Eleven sample products with real photographs | Four photographs each, with next/previous and thumbnails on the product page |
| Category filter, result count, price sorting | The pills and controls above the grid — all real, driven by the URL |
| Basket and a simulated checkout | Cart icon in the header, `/fr/cart`, `/fr/checkout` — card, Mobile Money (MVola, Orange Money, Airtel Money) or PayPal. **Nothing is charged**; see the test cards below |
| Stock tracking | **Stock** field on each product; the page shows units left, warns at 5 or fewer, and stops sales at 0. Each order takes its units off |
| Customer reviews, moderated | Stars and reviews on each product page; new reviews wait in **Avis clients** until staff approve them |
| Journal / blog, six sample articles | Its own page at `/fr/journal` — magazine layout, photographs only. The introduction text is under **Site settings → Journal page** |
| Newsletter sign-up | Writes to the **Newsletter** collection; duplicates and bad addresses are handled |

### Test payments

The checkout behaves as if a payment provider were connected, but none is.
The "bank" is simulated in the browser, card numbers never leave the page, and
the confirmation says nothing was charged.

| Card number | Result |
|---|---|
| `4242 4242 4242 4242` | Approved |
| `4000 0000 0000 0002` | Declined by the bank |

Any future expiry date and any CVC work. Mobile Money accepts any Malagasy
number (`034 12 345 67`); PayPal needs no details.

---

## Running it locally

Requires Node 20.9 or newer (built and tested on Node 24.18).

```bash
npm install
cp .env.example .env     # then fill in PAYLOAD_SECRET
npm run seed             # creates the sample catalogue and two accounts
npm run dev
```

- Public site — http://localhost:3000/fr and http://localhost:3000/en
- Administration — http://localhost:3000/admin

`npm run seed` prints the two account emails when it finishes. The passwords
are the `SEED_*` values in `.env`. There is no default — the seed stops and
tells you what to add if they are missing, so no password ever ships in the
repository. **Change them before sharing the link with anyone.**

Re-running `npm run seed` wipes products, reviews, categories, journal
articles and photographs and rebuilds them. User accounts and newsletter
sign-ups are kept. Useful for resetting between rehearsals — test orders use
up stock, and approving the sample pending review changes what the demo shows.

### The database

| Situation | What is used |
|---|---|
| `DATABASE_URL` empty | A local SQLite file, `jaovazaha-demo.db`. No setup, works offline. |
| `DATABASE_URL` is a `postgres://` string | PostgreSQL (Neon). |

The collections, the admin panel and the public pages are identical either way.

---

## Deploying to Vercel + Neon

Both have free tiers that cover this demonstration. **You need to create these
two accounts yourself** — then:

**1. Neon** — create a project, copy the connection string (it must end with
`?sslmode=require`).

**2. Vercel Blob** — Storage → create a Blob store → copy the token. It starts
with `vercel_blob_rw_`. Without this, uploaded photographs vanish on Vercel,
because its file system is not writable between requests.

**3. Vercel** — import the repository and set four environment variables:

| Variable | Value |
|---|---|
| `DATABASE_URL` | the Neon connection string |
| `PAYLOAD_SECRET` | a long random string — `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `BLOB_READ_WRITE_TOKEN` | the Blob token |
| `NEXT_PUBLIC_SERVER_URL` | `https://<your-project>.vercel.app` |

**4. Seed the deployed database** — point your local `.env` at the Neon
connection string and the Blob token, then run `npm run seed` once.

**5. After any change to the collections, update the deployed database too.**
The deployed site never changes the database structure itself — that only
happens when the project runs on your machine. So when collections change (as
when stock and reviews were added), the Neon database must catch up before the
new code works:

- **Re-run `npm run seed`** against Neon, as in step 4. Simple, but it replaces
  the content with the sample content.
- **Or keep the content:** with `.env` pointed at Neon, run `npm run dev`, open
  any page once so Payload connects and updates the tables, then stop it.

### Three things that will break the deploy

- **A malformed `BLOB_READ_WRITE_TOKEN`.** The adapter validates the shape and
  throws while the config is being built, so the whole site fails, not just
  uploads. Paste it exactly.
- **Changing collections without regenerating the import map.** After editing
  anything in `src/collections/`, run:

  ```bash
  npm run generate:types
  npm run generate:importmap
  ```

  and commit both. A stale `src/app/(payload)/admin/importMap.js` silently
  breaks admin fields — the rich-text editor and the upload button disappear.
- **Deploying collection changes before the database has them.** Pages that
  read a missing column or table fail. Do step 5 above first.

---

## How the two languages work

`localization` in `src/payload.config.ts` declares the two locales. Every field
marked `localized: true` is stored once per language.

- **Separate per language:** product name, short description, full description,
  key features, web address (slug), photograph alt text, and all the site
  settings wording.
- **Shared between languages:** price, currency, reference, category link,
  stock, availability, and the photograph file itself.
- **Reviews** are written in one language and shown on both versions of the
  page; the language each was written in is recorded.

`fallback` is **off** on purpose. If the English name is empty it stays empty
rather than quietly showing the French one, so it is obvious which products
still need translating. The catalogue hides any product with no name in the
language being viewed.

French and English addresses differ — `/fr/products/vanille-bourbon-de-madagascar`
and `/en/products/madagascar-bourbon-vanilla`. Switching language on a product
page redirects to the right address automatically.

---

## Who can change what

Two roles, set per user account under Administration → Users.

| | Editor | Administrator |
|---|---|---|
| Products — create, edit, publish, delete | yes | yes |
| Stock levels | yes | yes |
| Reviews — approve, reject, delete | yes | yes |
| Journal articles — create, edit, publish, delete | yes | yes |
| Categories | yes | yes |
| Photographs | yes | yes |
| Site name, logo, tagline, journal introduction, newsletter wording, contact details | yes | yes |
| Read the newsletter sign-up list | yes | yes |
| Delete newsletter sign-ups | no | yes |
| User accounts and roles | no | yes |

An editor cannot change their own role — that field is locked to
administrators (`src/access/roles.ts`).

**Nothing in the table above requires touching code.** Changing the page
layout, adding a new type of field, or altering the site's structure does
require a developer.

---

## Draft and published

Products use Payload's draft system.

- **Save Draft** stores the change privately. The public site keeps showing the
  last published version.
- **Publish changes** makes it live. Public pages are rendered per request, so
  the change appears on the next page load.
- **Versions** keeps the last 20 saves of each product, and any of them can be
  restored.

Visitors only ever receive published products — enforced in the collection's
`access.read`, not just hidden in the interface. To prove that rather than
take it on trust:

```bash
npx payload run src/seed/verify-drafts.ts
```

It unpublishes a product, checks it disappears from what a visitor is served,
then republishes it.

---

## Project layout

```
src/
  payload.config.ts        collections, the two locales, database, storage
  access/roles.ts          who may read and write what
  collections/
    Products.ts            the catalogue: tabs, drafts, bilingual fields, stock
    Reviews.ts             customer reviews, pending until approved
    Posts.ts               the journal, same draft/publish behaviour
    Categories.ts
    Media.ts               uploads + the three generated image sizes
    Users.ts               login and roles
    Subscribers.ts         newsletter sign-ups from the public form
  globals/SiteSettings.ts  site name, logo, tagline, journal intro, contact
  fields/slug.ts           web address, generated from the title per language
  lib/
    cart.ts                the basket (a cookie of ids and quantities), totals
    reviews.ts             average ratings and approved reviews
    locale.ts              interface wording in both languages
  components/              gallery, buy box, cart, checkout, reviews, stars…
  app/(payload)/           the admin panel (from the Payload template)
  app/(frontend)/
    actions.ts             the newsletter server action
    cart-actions.ts        add to cart, quantities, the simulated order
    review-actions.ts      saves a review from the product page as pending
    [locale]/              catalogue, product pages, cart, checkout, journal
  seed/seed.ts             sample content
  seed/images/             the photographs the seed uploads
  proxy.ts                 sends "/" to "/fr"
```

---

## Notes and known limits

Deliberate choices for a demonstration, worth revisiting for the real project:

- **`push: true`** keeps the database schema in step with the collections
  automatically. A production project should turn this off and use committed
  migrations (`payload migrate:create`).
- **Slugs are indexed but not unique.** Two products can share an address and
  the first one wins, rather than the editor hitting a database error mid-demo.
  Production should enforce uniqueness with a clear message.
- **No email adapter**, so password-reset mail is written to the server console
  rather than sent.
- **The photographs are stock images, not the client's products.** Product
  and journal photographs come from Pexels (free licence, commercial use, no
  attribution required), chosen to match each species; the gift box uses
  supplied photographs. The real site should use the client's own photography.
- **The checkout is a simulation.** No payment provider is connected, nothing
  is charged, and orders are not stored — only the stock goes down. Taking real
  money needs a provider (for example Stripe for cards and PayPal, and the MVola
  and Orange Money APIs for Madagascar), order emails, and terms of sale.
- **Sample content is invented.** Product details, prices, stock figures and
  the 29 reviews are fictional. Remove them before going live.
- **Reviews have no email alert.** New reviews wait in **Avis clients** until
  someone approves them; nobody is notified that one has arrived.
- **Newsletter addresses are stored, not emailed.** There is no mailing
  integration yet; the list sits in the Newsletter collection.
- **A French shop going live needs legal pages** — mentions légales, terms of
  sale, and a privacy page, since reviews and the newsletter collect personal
  data.
- **SEO is basic** — per-language titles, descriptions, canonical URLs and
  Open Graph tags. No sitemap, robots.txt or product structured data (which
  would let Google show price, stock and stars) yet.
