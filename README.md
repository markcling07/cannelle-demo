# GROUPE JAOVAZAHA — institutional website demonstration

A working demonstration of **Payload CMS 3** connected to a **React / Next.js**
front end: the institutional website of GROUPE JAOVAZAHA, managed
independently in **French and English**.

GROUPE JAOVAZAHA is an **umbrella brand**, not a legally incorporated holding
company. It connects two legally independent businesses:

- **MFC — Madagascar Fragrances Company**, registered in Madagascar;
- **EAC — EURUSA AFRASIA CORPORATION**, registered in France;
- and future projects of the Group.

The site presents that structure without blurring the brand into the
companies: a diagram on the home page, a clarification note, one page per
company with its own legal details, and a footer statement on every page.

All content in this project is **fictional sample content**. Nothing here is
connected to groupejaovazaha.com, and no paid service is required to run it.
The official logos, photographs and validated texts will replace it.

The previous version — a small shop with a basket, checkout, prices, stock
and reviews — is kept in git under the tag `shop-version`.

---

## What the site contains

| Section | Address | Edited in the admin under |
|---|---|---|
| Home — the Group above MFC and EAC | `/fr`, `/en` | Site pages → Home page |
| About GROUPE JAOVAZAHA, with its values | `/about` | Site pages → About |
| Founder and management | `/leadership` | Group and companies → Founder and management |
| Our companies, MFC, EAC | `/companies`, `/companies/mfc`, `/companies/eac` | Group and companies → Companies |
| Our products — a professional catalogue | `/products`, `/products/<name>` | Catalogue → Products, Categories |
| Our projects | `/projects`, `/projects/<name>` | Group and companies → Projects |
| Partnerships | `/partnerships` | Group and companies → Partners |
| News | `/news`, `/news/<name>` | News → News |
| Gallery | `/gallery` | Photographs → Gallery |
| Contact, with the enquiry form | `/contact` | Enquiries → Enquiries (what arrives) |
| Legal notice, Privacy policy | `/legal-notice`, `/privacy` | Site pages → Legal notice and privacy |

The title and introduction at the top of each list page are under
**Site pages → Section introductions**. The name, logo, tagline, footer
statement and the Group's contact details are under **Settings → Site settings**.

Every address exists in both languages: `/fr/...` and `/en/...`. The old
`/journal` addresses redirect to `/news`.

**Visitors land on News.** Opening the bare site address goes to `/fr/news`.
The institutional home page with the Group above MFC and EAC stays at `/fr`
and `/en`, and the logo in the header always leads there. The landing page is
set in `src/proxy.ts`.

### Product pages

As asked, the catalogue has **no prices, stock, basket, "Buy now" or
reviews**. Each product page has:

- photographs, with next/previous and thumbnails;
- a French and an English description;
- **Technical information** — one row per item (species, origin, grade,
  packaging…);
- **Request a quotation** — opens the contact form with the request type and
  the product already chosen;
- **Contact our team**;
- **EAC online store** — only shown when the product's *Link to the EAC online
  store* field is filled. One sample product (vanilla) has an example link to
  show the button; it points at a reserved `.example` address that goes
  nowhere.

### Enquiries

The contact form saves each request in **Enquiries**, with its type, the
product, the sender's details and the moment consent was given. Staff mark
them New / In progress / Closed and can keep internal notes.

**No email is sent** — there is no mail service connected, and none can be
added without a subscription decision. A hidden field catches most spam bots.

---

## Running it locally

Requires Node 20.9 or newer (built and tested on Node 24).

```bash
npm install
cp .env.example .env     # then fill in PAYLOAD_SECRET and the SEED_* accounts
npm run seed             # creates all the sample content and two accounts
npm run dev
```

- Public site — http://localhost:3000/fr and http://localhost:3000/en
- Administration — http://localhost:3000/admin

`npm run seed` prints the two account emails when it finishes. The passwords
are the `SEED_*` values in `.env`. There is no default — the seed stops and
tells you what to add if they are missing, so no password ever ships in the
repository. **Change them before sharing the link with anyone.**

Re-running `npm run seed` wipes the companies, team, projects, partners,
products, categories, news, gallery, enquiries and photographs, rebuilds them,
and rewrites every page's text. User accounts and newsletter sign-ups are kept.

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

**3. Vercel** — import the repository and set these environment variables:

| Variable | Value |
|---|---|
| `DATABASE_URL` | the Neon connection string |
| `PAYLOAD_SECRET` | a long random string — `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `BLOB_READ_WRITE_TOKEN` | the Blob token |
| `NEXT_PUBLIC_SERVER_URL` | `https://<your-project>.vercel.app` (optional — Vercel's own address is used when empty) |

**4. Seed the deployed database** — point your local `.env` at the Neon
connection string and the Blob token, then run `npm run seed` once.

**5. After any change to the collections, update the deployed database too.**
The deployed site never changes the database structure itself — that only
happens when the project runs on your machine. So when collections change, the
Neon database must catch up before the new code works:

- **Re-run `npm run seed`** against Neon, as in step 4. Simple, but it replaces
  the content with the sample content.
- **Or keep the content:** with `.env` pointed at Neon, run `npm run dev`, open
  any page once so Payload connects and updates the tables, then stop it.

When a change *removes* tables or columns — as the move from the shop removed
reviews, prices and stock — Payload asks for confirmation in the terminal
before dropping them. Answer yes; that data is no longer used.

### Three things that will break the deploy

- **A malformed `BLOB_READ_WRITE_TOKEN`.** The adapter validates the shape and
  throws while the config is being built, so the whole site fails, not just
  uploads. Paste it exactly.
- **Changing collections without regenerating the import map.** After editing
  anything in `src/collections/` or `src/globals/`, run:

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

- **Separate per language:** titles, descriptions, technical information, web
  addresses (slugs), photograph alt text and captions, page texts, company
  presentations, roles and biographies.
- **Shared between languages:** photographs themselves, references, links,
  company names and legal identifiers, partner names, order of display.

`fallback` is **off** on purpose. If the English title is empty it stays empty
rather than quietly showing the French one, so it is obvious what still needs
translating. Lists hide anything with no title in the language being viewed.

French and English addresses differ — `/fr/products/vanille-bourbon-de-madagascar`
and `/en/products/madagascar-bourbon-vanilla`. Switching language on a product,
company, project or news page redirects to the right address automatically.

**The administration area** can itself be shown in French or English: each
person picks theirs under **Account → Language**.

---

## Who can change what

Two roles, set per user account under **Settings → Users**.

| | Editor | Administrator |
|---|---|---|
| Products, categories, news, projects — create, edit, publish, delete | yes | yes |
| Companies — create, edit, publish | yes | yes |
| Companies — delete | no | yes |
| Team, partners, gallery albums, photographs | yes | yes |
| Home, About, Legal and section introduction texts | yes | yes |
| Site name, logo, footer statement, contact details | yes | yes |
| Read and follow up enquiries | yes | yes |
| Delete enquiries (personal data) | no | yes |
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

Products, companies, projects and news use Payload's draft system.

- **Save Draft** stores the change privately. The public site keeps showing the
  last published version.
- **Publish changes** makes it live. Public pages are rendered per request, so
  the change appears on the next page load.
- **Versions** keeps the last 20 saves of each document, and any of them can
  be restored.

Team members, partners, gallery albums and the page texts have no drafts:
**Save** puts the change live straight away.

Visitors only ever receive published documents — enforced in each
collection's `access.read`, not just hidden in the interface. To prove that
rather than take it on trust:

```bash
npx payload run src/seed/verify-drafts.ts
```

It unpublishes a product, checks it disappears from what a visitor is served,
then republishes it.

---

## Project layout

```
src/
  payload.config.ts        collections, globals, the two locales, admin languages
  adminGroups.ts           the headings of the admin sidebar
  access/roles.ts          who may read and write what
  collections/
    Companies.ts           MFC, EAC: presentation, legal details, contact
    Team.ts                founder and management
    Projects.ts            projects, with status and the company leading them
    Partners.ts            partners, grouped by type
    Products.ts            the catalogue: technical information, company, store link
    Categories.ts
    Posts.ts               news (the collection keeps its original name)
    Albums.ts              the gallery
    Enquiries.ts           requests from the contact form
    Media.ts               uploads + the three generated image sizes
    Subscribers.ts         newsletter sign-ups
    Users.ts               login and roles
  globals/
    HomePage.ts            hero, the Group-and-companies section, featured products
    AboutPage.ts           presentation and values
    SectionIntros.ts       title and introduction of each list page
    LegalPages.ts          legal notice and privacy policy
    SiteSettings.ts        name, logo, footer statement, contact details
  fields/slug.ts           web address, generated from the title per language
  lib/
    content.ts             shared look-ups: by address, translations, globals
    locale.ts              interface wording in both languages
    media.ts               picks the right image size
  components/              menu, product card, gallery, photo viewer, forms…
  app/(payload)/           the admin panel (from the Payload template)
  app/(frontend)/
    actions.ts             the newsletter server action
    enquiry-actions.ts     validates and saves the contact form
    [locale]/              every public page
  seed/seed.ts             builds the sample content
  seed/institutional.ts    the fictional texts: companies, team, projects, news…
  seed/images/             the photographs the seed uploads
  proxy.ts                 sends "/" to "/fr/news", the landing page
```

---

## Notes and known limits

Deliberate choices for a demonstration, worth revisiting for the real project:

- **Sample content is invented.** Companies' descriptions, team members,
  projects, partners, news and enquiries are fictional. Legal identifiers and
  the founder's biography are visible placeholders, to be supplied by the Group.
- **Legal notice and privacy policy are drafts** with placeholders. They must
  be completed and checked by a lawyer before the site goes live.
- **The photographs are stock images, not the client's.** Product and news
  photographs come from Pexels (free licence, commercial use, no attribution
  required). The GROUPE JAOVAZAHA, MFC and EAC logos are the official ones
  (`src/seed/images/logo`, `logo-mfc`, `logo-eac`); partner logos and
  portraits are generated initials.
- **Enquiries are not emailed.** They wait in the admin; nobody is notified
  that one has arrived. Email alerts need a mail service.
- **Newsletter addresses are stored, not emailed.**
- **Upload size on Vercel's free plan** is limited to about 4.5 MB per file
  through the admin. Larger photographs should be resized first, or direct
  uploads to Vercel Blob enabled.
- **`push: true`** keeps the database schema in step with the collections
  automatically. A production project should turn this off and use committed
  migrations (`payload migrate:create`).
- **Slugs are indexed but not unique.** Two documents can share an address and
  the first one wins. Production should enforce uniqueness with a clear message.
- **No email adapter**, so password-reset mail is written to the server console
  rather than sent.
- **SEO is basic** — per-language titles, descriptions, canonical URLs and
  Open Graph tags. No sitemap or robots.txt yet.
