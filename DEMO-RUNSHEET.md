# Demonstration run-sheet — Monday 26 October

For Célestin Mahavita Jaovazaha, GROUPE JAOVAZAHA.
Target length: **20 minutes**, plus questions.

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

- [ ] **Replace at least one placeholder photograph** with a real cinnamon
      photo. The generated gradients are obviously fake and he will notice.
      Media library → upload → then set it on a product.

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
- [ ] Re-run `npm run seed` for a clean catalogue.

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

---

### 1. Log in — 2 min

Go to `/admin`. Type the email and password while he watches.

**Say:** *"The password is never stored, only a one-way hash. The session is a
secure cookie that expires after eight hours. After five wrong attempts the
account locks itself for ten minutes."*

Then point at the left sidebar: **Products, Categories, Journal, Media library,
Users, Newsletter.**

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

Then the **Commercial details** tab: reference, price, currency, category.

**Say:** *"Price and reference sit outside the language system. One price, two
languages — change it once."*

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
catalogue — and open one article.

**Say:** *"The journal works exactly like the products — same two languages,
same draft and publish, same photographs. Useful for Google, because a shop with
nothing but product pages ranks poorly."*

Then the newsletter box. Type an address, click **Envoyer**, then show it appear
under **Newsletter** in the admin.

**Say:** *"The addresses are collected and stored. Sending the actual newsletter
would be a separate tool — I have not connected one yet."*

---

## Part 3 — The two-language explanation

He has asked about this in nearly every email. Have this straight.

**Separate for each language:**
product name, short description, full description, key features, web address,
photograph alternative text, journal articles, and all the site wording.

**Shared between both:**
price, currency, reference, category, availability, and the photograph itself.

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
| Journal articles | yes | yes |
| Categories | yes | yes |
| Photographs | yes | yes |
| Site name, tagline, newsletter wording, contact details | yes | yes |
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

### "Can we have a shopping basket?"

**Say:** *"Not in this demonstration — this is a catalogue, which is what we
agreed. A basket and payment is real additional work and I would rather price it
properly than bolt it on."*

Do not say yes to a date on the call.

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

- The photographs are generated placeholders. If he asks whether they are real
  products, say no — it is sample content, as agreed.
- There is no basket, no payment, and no newsletter sending. Do not imply
  otherwise.
- This stack is new to you. That is fine. Show what it does, and if he asks
  something you do not know, say *"I will confirm that and come back to you"*
  rather than guessing. One wrong confident answer costs more than three
  honest ones.
