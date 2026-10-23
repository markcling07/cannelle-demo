# GROUPE JAOVAZAHA — bilingual cinnamon shop demonstration

A working demonstration of **Payload CMS 3** connected to a **React / Next.js**
front end: a small cinnamon catalogue and journal, managed independently in
**French and English**.

The sample shop is called **Cannelle**. That name, the tagline and the
newsletter wording are all one field each under **Site settings** — change them
to GROUPE JAOVAZAHA in the admin panel if you want the client's own name on it.
No code change needed.

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
| Journal / blog, two sample articles | Journal collection; section at the bottom of the catalogue, articles at `/fr/journal/…` |
| Category filter, result count, price sorting | The pills and controls above the grid — all real, driven by the URL |
| Newsletter sign-up | Writes to the **Newsletter** collection; duplicates and bad addresses are handled |

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

Re-running `npm run seed` wipes products, categories and photographs and
rebuilds them. User accounts are kept. Useful for resetting between rehearsals.

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

### Two things that will break the deploy

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

---

## How the two languages work

`localization` in `src/payload.config.ts` declares the two locales. Every field
marked `localized: true` is stored once per language.

- **Separate per language:** product name, short description, full description,
  key features, web address (slug), photograph alt text, and all the site
  settings wording.
- **Shared between languages:** price, currency, reference, category link,
  availability, and the photograph file itself.

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
| Journal articles — create, edit, publish, delete | yes | yes |
| Categories | yes | yes |
| Photographs | yes | yes |
| Site name, tagline, newsletter wording, contact details | yes | yes |
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
    Products.ts            the catalogue: tabs, drafts, bilingual fields
    Posts.ts               the journal, same draft/publish behaviour
    Categories.ts
    Media.ts               uploads + the three generated image sizes
    Users.ts               login and roles
    Subscribers.ts         newsletter sign-ups from the public form
  globals/SiteSettings.ts  site name, tagline, newsletter wording, contact
  fields/slug.ts           web address, generated from the title per language
  components/              language switcher, sort control, newsletter form
  app/(payload)/           the admin panel (from the Payload template)
  app/(frontend)/
    actions.ts             the newsletter server action
    [locale]/              catalogue, product pages, journal articles
  seed/seed.ts             sample content
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
- **Sample photographs are generated placeholders**, not real product
  photography. Replace them from Media library before anyone sees this as a
  finished site.
- **No basket or checkout.** This is a catalogue, which is what was agreed for
  the demonstration. There is deliberately no "Bag" in the navigation, because
  a button that does nothing is worse than no button.
- **Newsletter addresses are stored, not emailed.** There is no mailing
  integration yet; the list sits in the Newsletter collection.
- **SEO is basic** — per-language titles, descriptions, canonical URLs and
  Open Graph tags. No sitemap or robots.txt yet.
