# Demonstration run-sheet — Monday 26 October

For Célestin Mahavita Jaovazaha, GROUPE JAOVAZAHA.
Target length: **20 minutes** for his seven points, then about **6 minutes**
of extras (journal, basket, stock, reviews), plus questions. If time is short,
cut the extras, never his points.

Read this once the night before. On the day, keep it open on a second screen.

---

## Part 1 — Before the call

### The evening before

- [ ] **Change the demo passwords.** They live only in `.env`, which is not
      committed — but the current values are throwaway ones I picked. Replace
      them with your own:

      SEED_ADMIN_EMAIL=...
      SEED_ADMIN_PASSWORD=...
      SEED_EDITOR_EMAIL=...
      SEED_EDITOR_PASSWORD=...

      then `npm run seed` to apply them.

- [ ] **Make Célestin his own account.** He asked for temporary administrator
      access. Admin panel → Users → Create New → his email, role
      **Administrator**. Use a password you are happy to send in an email, and
      tell him to change it.

- [ ] **Check the site name and logo.** The demo carries his company name,
      **GROUPE JAOVAZAHA**, and his logo. Both are under Site settings —
      Site name in each language, Logo once for both. One field each, no code.

- [ ] **Know where the photographs come from.** Every product has real
      photographs now — stock images chosen to match each product, not his
      own goods. Bring one of **his** product photos for step 3 anyway:
      seeing his own picture on his own site lands better than anything else.

- [ ] **Check the tagline.** Site settings → Tagline, in each language. It
      shows in Google results. The seed sets *Épices et vanille de
      Madagascar* / *Spices and vanilla from Madagascar*.

- [ ] **Run through this whole sheet once, out loud, with a timer.** This is
      the single highest-value thing you can do. Do not skip it.

### Thirty minutes before

- [ ] Open the public site and the admin panel in **two separate browser
      tabs**. You will switch between them constantly. Do not do it in one tab.
- [ ] Log into the admin tab already. Then **log out again** — you want to
      demonstrate the login, but you want to know it works first.
- [ ] Have a cinnamon photo file ready **on your desktop**, named sensibly.
      Not buried in Downloads.
- [ ] Close every other tab, notification, and messaging app.
- [ ] Have the product text ready to paste, French and English, in a notepad.
      Do not compose sentences live.
- [ ] Re-run `npm run seed` for a clean catalogue. This also refills the
      stock your rehearsal orders used up, and puts back the one pending
      review you will approve in step 10.
- [ ] If you show the deployed site: after any collection change, the Neon
      database must be updated first (README, *Deploying*, step 5) or pages
      fail. Check the live site loads a product page before the call.

### The link

- Public site: your Vercel URL, or `http://localhost:3001` if you are
  screen-sharing locally.
- Admin panel: the same address with `/admin` on the end.

> If you are running locally rather than deployed, say so plainly at the start:
> *"Today I am showing you this from my machine. The public link follows after
> the call."* Do not let him discover it.

---

## Part 2 — Order of play

His list had delete before publish. Deleting a product and then publishing it
does not work, so the order below is rearranged. Every one of his seven points
is still covered — the mapping is in the right-hand column.

| # | What you do | His bullet |
|---|---|---|
| 1 | Log in | Log in securely |
| 2 | Create the product in French | Create in French and English |
| 3 | Add photograph and details | Add photograph, description, information |
| 4 | Switch to English, fill it in | Create in French and English |
| 5 | Publish, show the public site | Publish and view the result |
| 6 | Edit and republish | Edit the product |
| 7 | Computer and phone | Displays correctly on both |
| 8 | Delete | Delete the product |
| 9 | Journal + newsletter | *(extra — yours, not asked for)* |
| 10 | Basket, stock and reviews | *(extra — yours, not asked for)* |

---

### 1. Log in — 2 min

Go to `/admin`. Type the email and password while he watches.

**Say:** *"The password is never stored, only a one-way hash. The session is a
secure cookie that expires after eight hours. After five wrong attempts the
account locks itself for ten minutes."*

Then point at the left sidebar: **Products, Categories, Avis clients, Journal,
Media library, Users, Newsletter.**

**Say:** *"Everything the site shows is in this list. Nothing here needs a
developer."*

---

### 2. Create the product in French — 3 min

Products → **Create New**.

Check the top right says **Locale: Français** before you type anything. If it
does not, change it first.

Fill in:
- **Product name** — e.g. *Cannelle de Ceylan — bâtons*
- **Short description** — one sentence
- **Full description** — paste two paragraphs, then make one word **bold** so
  he sees it is a real editor

**Say:** *"Notice each field says 'Français'. I am only editing the French
version right now."*

---

### 3. Photograph and commercial details — 3 min

**Main photograph** → drag your prepared file in → add alternative text.

**Say:** *"The alternative text is what a blind visitor's screen reader says,
and what Google reads. It is per language, so it gets translated too."*

> **The photograph is required.** If Publish refuses later, this is why.

Add two or three **Key features** with the + button.

Then the **Commercial details** tab: reference, price, currency, category
(**Épices**), and **Stock** — type 10.

**Say:** *"Price, reference and stock sit outside the language system. One
price, two languages — change it once. The stock goes down by itself every
time someone orders."*

Click **Save Draft**.

**Say:** *"Saved, but not public. Let me show you."* Switch to the public tab,
reload, show it is absent. **This is the moment that sells the system** — do
not rush it.

---

### 4. The English version — 4 min

**This is the part he actually cares about. Slow down.**

Top right, change **Locale: Français** → **English (en)**.

Watch the form: the fields empty out.

**Say:** *"This is the same product, not a copy. Same price, same reference,
same photograph. Only the words are separate. If I am only selling in French
this week, I leave this empty and the product simply does not appear on the
English site."*

Now fill in the English name and description.

> **Shortcut if you are running late:** the **⋯** menu top right has
> **Copy to locale** — it copies the French text across as a starting point to
> translate over. Useful, but only use it if you have practised it.

Point at the **Web address (slug)** in the right sidebar.

**Say:** *"The address is different in each language — `/fr/products/cannelle-de-ceylan`
and `/en/products/ceylon-cinnamon`. That matters for Google. And if someone on
the French page switches to English, the site sends them to the right English
address automatically."*

---

### 5. Publish and view — 2 min

Click **Publish changes**.

Switch to the public tab. Reload `/fr`. The product is there.

Click into it. Then click **EN** in the header — the same product, in English,
at a different address.

**Say:** *"Published pages are read fresh each time, so what you publish is live
on the next page load. No waiting, no cache to clear."*

---

### 6. Edit and republish — 2 min

Back to admin. Change the price. **Publish changes.** Reload the public page.
New price.

Now click the **Versions** tab.

**Say:** *"Every save is kept. If Heide changes something by mistake, you open
this list and restore the previous version. Nothing is ever really lost."*

---

### 7. Computer and phone — 2 min

Open the public site **on your actual phone** and hold it up to the camera.
This is far more convincing than resizing the browser window.

If you cannot, resize the browser window slowly from wide to narrow and let him
watch the three columns become one.

**Say:** *"One site, one piece of content. It rearranges itself — there is no
separate mobile version to maintain."*

---

### 8. Delete — 1 min

Back to the product. **⋯** menu top right → **Delete** → confirm.

Reload the public page. Gone.

**Also show him Unpublish** in the same menu.

**Say:** *"Unpublish is usually what you want. It takes the product off the site
but keeps everything, so you can put it back in one click. Delete is permanent."*

---

### 9. The journal and the newsletter — 2 min

*You added these. He did not ask for them. Say so — it reads as generosity
rather than scope creep.*

Click **Journal** in the header — it has its own page, separate from the
catalogue. The latest article fills the screen as a large photograph; scroll
through the introduction, the featured article and the numbered index, then
open one article.

**Say:** *"The journal works exactly like the products — same two languages,
same draft and publish, same photographs. Publish a new article and it takes
the top of the page by itself. Useful for Google, because a shop with nothing
but product pages ranks poorly."*

If he likes it, show that the introduction sentence is his to change:
Site settings → **Page Journal**.

Then the newsletter box. Type an address, click **Envoyer**, then show it appear
under **Newsletter** in the admin.

**Say:** *"The addresses are collected and stored. Sending the actual newsletter
would be a separate tool — I have not connected one yet."*

---

### 10. Basket, stock and reviews — 4 min

*Also yours, not asked for. Say so, and say plainly that the payment is
simulated — before he asks.*

**Stock and reviews.** Open **Vanille Bourbon de Madagascar**. Point at the
stars under the title, then the orange **Plus que 3 en stock**. Scroll to
**Avis clients**: the average, the star bars, the reviews.

**The order.** Back up, set the quantity to 3 — the + button stops there —
**Ajouter au panier**. The cart icon shows 3. Open the cart, **Passer au
paiement**, fill the form, pay with `4242 4242 4242 4242`, any future date,
any CVC. Wait for the confirmation.

Reload the vanilla page: **Rupture de stock**, no buy button.

**Say:** *"It behaves exactly as if a payment provider were connected — the
stock really went down — but no money moves. Connecting a real one, cards,
PayPal, MVola, Orange Money, is part of the real project and I will price it
separately."*

*Optional, if he enjoys it:* pay with `4000 0000 0000 0002` instead — the
"bank" refuses it and nothing is ordered.

**Moderation.** Admin → **Avis clients** (*Reviews* if the admin is in
English). One review is **En attente** / *Pending* (Marc D., on the vanilla).
Open it, set **Approuvé** / *Approved*, save. Reload the vanilla
page — it is there.

**Say:** *"Nobody can post on your site without you seeing it first. Reviews
wait here until you or Heide approve them."*

> Re-run `npm run seed` after rehearsing this step — it refills the vanilla
> and puts the pending review back.

---

## Part 3 — The two-language explanation

He has asked about this in nearly every email. Have this straight.

**Separate for each language:**
product name, short description, full description, key features, web address,
photograph alternative text, journal articles, and all the site wording.

**Shared between both:**
price, currency, reference, category, stock, availability, and the photograph
itself.

**Reviews** are written in one language and shown on both versions.

**Say it like this:**

> *"There are not two websites. There is one product, and the text on it exists
> twice — once in French, once in English. The price only exists once, so when
> it changes you change it in one place.*
>
> *If the English version of a product is empty, that product just does not
> appear on the English site. Nothing breaks, nothing shows half-translated.
> You can add the English later and it appears then."*

**If he asks about automatic translation:** be straight. *"No. The system does
not translate for you — it gives you a place to put each language and keeps them
apart. Machine translation could be added, but you would still want someone to
check it."*

---

## Part 4 — What Célestin and Heide can change without a developer

Show this on screen by walking the sidebar, not by reading a list.

| | Editor | Administrator |
|---|---|---|
| Products — create, edit, publish, delete | yes | yes |
| Stock levels | yes | yes |
| Approve or reject reviews | yes | yes |
| Journal articles | yes | yes |
| Categories | yes | yes |
| Photographs | yes | yes |
| Site name, logo, tagline, journal introduction, newsletter wording, contact details | yes | yes |
| See the newsletter list | yes | yes |
| Delete newsletter entries | no | yes |
| Create accounts and set roles | no | yes |

**Then be honest about the other side of the line:**

> *"What does need me: changing the page layout, adding a new kind of field —
> say a 'country of origin' box on every product — changing the design, or
> adding a new type of page. Those are code changes. Everything you will do
> week to week is in the panel."*

**Worth mentioning:** Account → Language switches the whole admin interface to
French. Confirmed working — French ships with the system.

---

## Part 5 — Questions he will ask

### "What organisation do you work through?"

**He has asked this three times and you have not answered it.** He will ask
again, and a vague answer here costs you more than any technical mistake.

Decide tonight whether you are answering as an independent developer or through
a named company, and say it in one plain sentence. If you have been signing
"Co-founder" of something, name it. If it is not relevant to this project, say
that it is a separate venture and that you are doing this work personally.

Do not improvise this on the call.

### "You said Wasabi for the photographs."

You did, in writing. The demo uses **Vercel Blob** instead.

**Say:** *"I changed it. Wasabi has a monthly minimum charge, and you asked for
no subscriptions. Vercel Blob does the same job and the demo costs nothing. For
the real project we can use either — I will put the cost of each in the
proposal."*

Raise this yourself before he finds it. It reads as diligence.

### "Is it secure? You said WordPress gets hacked."

**Say:** *"Most WordPress break-ins come through plugins — lots of separate
pieces of code from different authors. This has no plugin system, so that route
does not exist. Logins are hashed and rate-limited, the hosting handles
certificates and patching. Nothing is unbreakable, but the surface is much
smaller."*

Do not oversell this.

### "How long for the real site, and how much?"

You do not have to answer on the call, and you should not guess.

**Say:** *"Let me put that in writing after you have seen this, so the numbers
are based on the pages you actually want rather than my assumptions. You will
have it within two days."*

### "Can it take real payments?"

**Say:** *"Not yet — the basket and checkout you saw are real, but the payment
is simulated. Taking real money means opening accounts with payment providers —
cards and PayPal, and MVola or Orange Money for customers in Madagascar — plus
order emails, saving orders, and terms of sale. That is real additional work and
I would rather price it properly than bolt it on."*

Do not say yes to a date on the call.

### "Are those reviews real?"

**Say:** *"No — they are sample reviews I wrote so you can see how it looks.
They are removed before the site goes live, and from then on every review comes
from a real customer and waits for your approval."*

### "Who owns it?"

**Say:** *"You do. Source code, administrator access, the hosting and database
accounts, all handed over on delivery. The system itself is open source, so
there is no licence to pay and no one can take it away from you."*

---

## Part 6 — If something breaks

**Stay calm and narrate it.** He is evaluating how you handle problems as much
as the software.

| Problem | Do this |
|---|---|
| Page will not load | Reload once. Then `npm run devsafe` and carry on talking while it restarts. |
| Publish is refused | The photograph is missing. It is required. |
| A field looks empty that should not be | Check the **Locale** selector top right — you are probably in the other language. |
| Product will not appear publicly | Check the status says **Published**, not Draft. |
| Images do not appear | Check `BLOB_READ_WRITE_TOKEN` is set in the Vercel environment variables. |
| A product says **Rupture de stock** | A rehearsal order used it up. Raise its **Stock** in the admin, or re-seed. |
| Checkout sends you back to the cart | A line asks for more than is in stock — the cart says which. Lower it. |
| A new review does not appear | It is waiting under **Avis clients**. Set it to **Approuvé**. |
| Product pages fail on the deployed site only | The Neon database is missing a recent change. README, *Deploying*, step 5. |
| Everything is broken | *"Let me reset to a clean state — one moment."* Run `npm run seed`, restart. **Do not debug live.** |

**The rule: never type code on screen while he watches.** If you cannot fix it
in thirty seconds, switch to talking about something else and come back.

---

## Part 7 — Immediately after

Send one short email the same day with:

1. The public demonstration link.
2. His administrator email and password, and a note to change it.
3. A one-paragraph recap of what you showed.
4. **The answer about your organisation**, in writing, so it is settled.
5. One sentence on what happens next and when.

Do not attach a price yet unless he asked for one on the call. Let him respond
to the demonstration first.

---

## Honest reminders

- The photographs are stock images chosen to match each product, not his
  goods. If he asks, say so — it is sample content, as agreed.
- The reviews, stock figures and product details are invented sample content
  too.
- The payment is simulated: nothing is charged and orders are not saved. There
  is no newsletter sending either. Do not imply otherwise.
- This stack is new to you. That is fine. Show what it does, and if he asks
  something you do not know, say *"I will confirm that and come back to you"*
  rather than guessing. One wrong confident answer costs more than three
  honest ones.
