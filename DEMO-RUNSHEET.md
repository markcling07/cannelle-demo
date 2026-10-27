# Demonstration run-sheet — the institutional site

For Célestin Mahavita Jaovazaha and Heide, GROUPE JAOVAZAHA.
Target length: **25 minutes**, plus questions.

His brief asked for an institutional site, not a shop, and for this
demonstration in particular:

- the temporary link to the administration area and temporary credentials;
- how to create a product in French and English;
- how to add or replace photographs;
- how to edit, publish and delete a product;
- how he and Heide manage content without touching code;
- an institutional home page showing GROUPE JAOVAZAHA above MFC and EAC.

Every one of these is covered below. Read this once the night before. On the
day, keep it open on a second screen.

---

## Part 1 — Before the call

### The evening before

- [ ] **The live site is up to date.** The new version must be merged, deployed
      and the Neon database updated (README, *Deploying*, steps 4–5). Open the
      Vercel address and click through every menu entry once.
- [ ] **Change the demo passwords.** They live only in `.env`. Replace the
      `SEED_*` values with your own, then re-run the seed against Neon.
- [ ] **Create Célestin's and Heide's accounts** on the live admin: Settings →
      Users → Create new → their email, role **Administrator** for Célestin,
      **Editor** for Heide. Use passwords you are happy to send, and tell them
      to change them at first login. Do **not** reuse the seed passwords.
- [ ] **Set your own admin to French** (Account → Language → Français) if you
      demonstrate in French, so the screens match what he will see.
- [ ] **Have one of his own photographs ready on your desktop**, named sensibly,
      under 4 MB. Seeing his own picture on his own site lands better than
      anything else.
- [ ] **Run through this whole sheet once, out loud, with a timer.** This is
      the single highest-value thing you can do. Do not skip it.

### Thirty minutes before

- [ ] Open the public site and the admin panel in **two separate browser
      tabs**. You will switch between them constantly.
- [ ] Log into the admin tab, then **log out again** — you want to show the
      login, but you want to know it works first.
- [ ] Have the product text ready to paste, French and English, in a notepad.
      Do not compose sentences live.
- [ ] Close every other tab, notification and messaging app.

### The link

- Public site: your Vercel address, e.g. `https://<project>.vercel.app/fr`.
- Admin panel: the same address with `/admin` on the end.

> Nothing is connected to groupejaovazaha.com, and nothing paid has been
> subscribed. Say so at the start — he asked for both.

---

## Part 2 — Order of play

| # | What you do | His request |
|---|---|---|
| 1 | The home page: the Group above MFC and EAC | Institutional home page |
| 2 | A quick tour of the sections | The structure he listed |
| 3 | A product page, then a quotation request | Catalogue, quotation and contact buttons, Shopify link |
| 4 | Log in to the admin | Temporary link and credentials |
| 5 | Create a product in French | Create a product in FR and EN |
| 6 | Add the photographs | Add or replace photographs |
| 7 | The English version | Create a product in FR and EN |
| 8 | Publish and view | Publish |
| 9 | Edit, replace a photograph, versions | Edit, replace photographs |
| 10 | Unpublish and delete | Delete |
| 11 | Everything else they can change | Manage content without code |

---

### 1. The home page — 3 min

Open `/fr`. Let the banner sit for a second, then scroll to **Notre
organisation**.

Point at the diagram: GROUPE JAOVAZAHA on top, a line down to **MFC —
Madagascar** and **EAC — France**, and a dashed card for **Projets futurs**.
Then the note underneath.

**Say:** *"This is the point you insisted on. The Group is shown as a common
brand, not a company. MFC and EAC each carry the label 'société indépendante',
each has its own page with its own legal details, and this note — and the same
sentence in the footer of every page — says it plainly. Quotations and invoices
come from the company concerned."*

Scroll on: featured products, latest news, partners, the contact band.

---

### 2. The sections — 3 min

Use the menu, top to bottom. Do not linger anywhere.

- **À propos** → *À propos du Groupe* (the four values from the logo), then
  *Fondateur et direction*. **Say:** *"The founder's text is deliberately a
  placeholder — I will not write your biography for you. You write it, it goes
  in one field."*
- **Nos sociétés** → MFC, then EAC: presentation, *En bref*, *Informations
  légales* — all marked *À compléter* until you send the real details.
- **Nos projets**, **Partenariats**, **Actualités**, **Galerie** (open a photo,
  use the arrows).
- **Contact**, and the two legal pages in the footer.

**Say:** *"Every word you are reading is fictional and editable. You will send
the real texts, logos and photographs, and they go into the same fields."*

---

### 3. A product, and a quotation request — 3 min

**Nos produits** → **Vanille Bourbon de Madagascar**.

Point at what is there and what is not: photographs, description, **Fiche
technique**, *Proposé par MFC*. No price, no stock, no basket.

Then the three buttons:

- **Demander un devis** — click it. The contact form opens with *Demande de
  devis* and the vanilla already selected.
- **Contacter notre équipe** — the same form, empty.
- **Boutique en ligne EAC** — **Say:** *"This button only appears when the
  product has a link to EAC's online store. I put an example link on the
  vanilla so you can see it. When the Shopify store exists, you paste the
  address in one field."*

Fill the form quickly with a test name and send it. Keep the admin tab for
step 4 — the request will be waiting there.

---

### 4. Log in — 2 min

Admin tab, `/admin`. Type the email and password while he watches.

**Say:** *"The password is never stored, only a one-way hash. After five wrong
attempts the account locks itself for ten minutes."*

The first thing in the sidebar is **Demandes** — open it. The request you just
sent is there, with the product, the volume and the date the visitor
consented. **Say:** *"No email is sent yet — that would need a mail service,
and you asked for no subscriptions. Requests wait here; you mark them in
progress, closed, and keep internal notes."*

Then point at the rest of the sidebar: **Pages du site, Groupe et sociétés,
Catalogue, Actualités, Photographies, Réglages.**

---

### 5. Create a product in French — 3 min

Catalogue → **Produits** → **Créer un(e) nouveau ou nouvelle**.

Check the top right says **Paramètres régionaux : Français** before typing.

Fill in:
- **Nom du produit** — e.g. *Cannelle de Madagascar — bâtons*
- **Description courte** — one sentence
- **Description complète** — paste two paragraphs, make one word **bold**
- **Fiche technique** — add three rows: *Espèce*, *Origine*, *Conditionnement*

Then the **Classement et liens** tab: a reference, the category **Épices**,
the company **MFC**. Leave the store link empty.

**Say:** *"Notice each text field says 'Français'. Reference, category and
company sit outside the language system — set once, shared by both."*

---

### 6. Add the photographs — 2 min

Back to **Contenu** → **Photographie principale** → drag in his photograph.
Fill in the **Texte alternatif** in the window that opens.

**Say:** *"The alternative text is what a blind visitor's screen reader says,
and what Google reads. It is translated too."*

Add one or two **Photographies supplémentaires** the same way, or pick
existing ones with **Choisir parmi les existant(e)s**.

> **The main photograph is required.** If Publish refuses later, this is why.
> Photographs over about 4 MB are refused online — resize them first.

Click **Enregistrer le brouillon**. Switch to the public tab, reload *Nos
produits*: the product is **not** there. **Say:** *"Saved, but private."*
This is the moment that sells the system — do not rush it.

---

### 7. The English version — 3 min

**Slow down here — this is what he cares about most.**

Top right, switch to **English**. The text fields empty out.

**Say:** *"Same product, not a copy. Same photographs, same reference. Only
the words are separate. Leave the English empty and the product simply does
not appear on the English site."*

Fill in the English name, short description and technical information.

> **Shortcut if running late:** the **⋮** menu (top right of the form) → **Copier vers le lieu**
> (*Copy to locale*) copies the French across as a starting point. Only if
> practised.

Point at the **Adresse web (slug)** in the sidebar: different in each language.

---

### 8. Publish and view — 2 min

**Publier les modifications.**

Public tab → reload *Nos produits*. It is there. Open it, then click **EN** in
the header: the same product, in English, at its English address.

**Say:** *"What you publish is live on the next page load. No cache to clear."*

---

### 9. Edit, replace a photograph, versions — 2 min

Back in the admin: change the short description. To **replace** the main
photograph, click the **×** next to it, then drag in another one.
**Publier les modifications.** Reload the public page.

Then the **Versions** tab.

**Say:** *"Every save is kept. If Heide changes something by mistake, you open
this list and restore the previous version."*

---

### 10. Unpublish and delete — 1 min

**⋮** menu (top right of the form) → **Annuler la publication** first. Reload the public page: gone, but the
product is still in the admin. Then **⋮** → **Supprimer** → confirm.

**Say:** *"Unpublish is usually what you want — it takes it off the site and
keeps everything. Delete is permanent."*

---

### 11. Everything else they can change — 3 min

Walk the sidebar, opening one example in each group:

- **Pages du site → Accueil**: the banner title and text, the Group-and-companies
  note, the featured products. Change the banner title, **Sauvegarder**, reload
  the home page.
- **Groupe et sociétés → Sociétés → MFC**: presentation, *Informations
  légales*, contact.
- **Fondateur et direction**, **Projets**, **Partenaires**: one form each.
- **Photographies → Galerie**: albums; **Médiathèque**: every photograph, where
  captions are edited.
- **Réglages → Réglages du site**: name, logo, footer statement, contact
  details. **Utilisateurs**: accounts and roles.

**Say:** *"None of this needs a developer. What does: a new kind of page, a new
field on every product, or a change of design."*

Finally: **Compte → Langue** switches the whole admin to French or English,
per person.

---

## Part 3 — The two-language explanation

**Separate for each language:** titles, descriptions, technical information,
web addresses, photograph descriptions, page texts, company presentations,
roles and biographies.

**Shared between both:** the photographs themselves, references, links, company
names and legal identifiers.

**Say it like this:**

> *"There are not two websites. There is one product, and its text exists
> twice — once in French, once in English. If the English is empty, the
> product does not appear on the English site. Nothing breaks, nothing shows
> half-translated."*

**If he asks about automatic translation:** *"No. The system gives you a place
for each language and keeps them apart. Machine translation could be added, but
someone should still check it."*

---

## Part 4 — Who can do what

| | Editor (Heide) | Administrator (Célestin) |
|---|---|---|
| Products, news, projects — create, edit, publish, delete | yes | yes |
| Companies — edit and publish | yes | yes |
| Companies — delete | no | yes |
| Team, partners, gallery, photographs, page texts | yes | yes |
| Read and follow up enquiries | yes | yes |
| Delete enquiries (personal data) | no | yes |
| Accounts and roles | no | yes |

---

## Part 5 — Questions he will ask

### "What organisation do you work through?"

Decide beforehand whether you answer as an independent developer or through a
named company, and say it in one plain sentence. Do not improvise this.

### "Where are the photographs stored? You mentioned Wasabi."

The demo uses **Vercel Blob**. **Say:** *"Wasabi has a monthly minimum charge,
and you asked for no subscriptions. Vercel Blob does the same job and the demo
costs nothing. For the real project we can use either — I will put the cost of
each in the proposal."*

### "Will we receive the quotation requests by email?"

**Say:** *"Not yet — they are saved in the administration area. Email alerts
need a mail-sending service; there are free tiers, but it is a subscription
decision I will not make for you. It is a small addition once you choose."*

### "Is the legal notice correct?"

**Say:** *"It is a draft with the right headings and placeholders. The real
details come from you, and it should be checked by a lawyer before the site
goes live."*

### "How long for the real site, and how much?"

**Say:** *"Let me put that in writing after you have seen this, based on the
pages you actually want. You will have it within two days."*

### "Who owns it?"

**Say:** *"You do. Source code, administrator access, the hosting and database
accounts, all handed over on delivery. The system is open source — no licence
to pay."*

---

## Part 6 — If something breaks

**Stay calm and narrate it.**

| Problem | Do this |
|---|---|
| Page will not load | Reload once. Locally, `npm run devsafe` and carry on talking while it restarts. |
| Publish is refused | The main photograph is missing. It is required. |
| A photograph upload fails online | It is over about 4 MB. Use a smaller one. |
| A field looks empty that should not be | Check the language selector top right — you are probably in the other language. |
| Something will not appear publicly | Check the status says **Publié**, not Brouillon. |
| Images do not appear online | Check `BLOB_READ_WRITE_TOKEN` in the Vercel environment variables. |
| Pages fail on the deployed site only | The Neon database is missing a recent change. README, *Deploying*, step 5. |
| Everything is broken | *"Let me reset to a clean state."* Re-run `npm run seed`. **Do not debug live.** |

**The rule: never type code on screen while he watches.**

---

## Part 7 — Immediately after

Send one short email the same day with:

1. The public link and the admin link.
2. His and Heide's email and temporary password, and a note to change them.
3. The admin guide (French and English).
4. A one-paragraph recap of what you showed.
5. What you need from them: official logos (SVG or transparent PNG),
   photographs, validated texts, and the legal details of MFC and EAC.
6. One sentence on what happens next and when.

---

## Honest reminders

- Every text, person, project, partner and enquiry on the site is fictional.
  The founder's biography and the legal identifiers are deliberate
  placeholders.
- The photographs are stock images, not his. The logos of MFC, EAC and the
  partners are generated initials.
- Requests are not emailed and the newsletter is not sent. Do not imply
  otherwise.
- If he asks something you do not know, say *"I will confirm that and come
  back to you"* rather than guessing.
