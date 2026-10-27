# Handover: continuing on another computer

Where the GROUPE JAOVAZAHA site stands, and how to pick it up on a new PC.
Written on 28 October 2026. For how the site itself works, see
[README.md](README.md).

**No passwords or keys are in this file or anywhere in the repository.**
They live in Vercel, Neon and your own `.env`, which Git never copies.

---

## Where everything is

| What | Where |
|---|---|
| Code | https://github.com/markcling07/cannelle-demo |
| Live site | https://cannelle-demo.vercel.app (opens on `/fr/news`) |
| Live admin | https://cannelle-demo.vercel.app/admin |
| Hosting | Vercel, project `cannelle-demo`: https://vercel.com/tanget-line/cannelle-demo |
| Live database | Neon (PostgreSQL): https://console.neon.tech |
| Photos | Vercel Blob, the store connected to the Vercel project |
| Admin guide for the client (FR + EN) | https://claude.ai/artifact/GaHnLfDFrbXMrdggJ7tbEP, in your claude.ai account |
| Demo script for showing the admin | [DEMO-RUNSHEET.md](DEMO-RUNSHEET.md) |

**Branches**

- `institutional-site`: where the work is done.
- `main`: what the live site runs. Vercel redeploys whenever `main` changes.
- Tag `shop-version`: the old shop, kept as a backup.

At handover, both branches hold the same site code.

---

## 1. Set up the new PC

You need **Node.js 24** (https://nodejs.org, the LTS version) and **Git**
(https://git-scm.com). The commands below are for PowerShell.

**Clone the project outside OneDrive**, for example into `C:\dev`. OneDrive
syncing the thousands of files in `node_modules` and the local database
causes "file in use" errors.

```powershell
git clone https://github.com/markcling07/cannelle-demo.git C:\dev\cannelle-demo
cd C:\dev\cannelle-demo
git checkout institutional-site
```

Git asks you to sign in to GitHub the first time. Use the **markcling07**
account.

**Sign the commits as markcling07** (this repository only):

```powershell
git config user.name "Mark Cling Alinsonorin"
git config user.email "markcling1997@gmail.com"
```

**Install, configure and fill the local database:**

```powershell
npm install
Copy-Item .env.example .env
```

Open `.env` and fill it in like this:

| Variable | Local value |
|---|---|
| `PAYLOAD_SECRET` | the output of `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `NEXT_PUBLIC_SERVER_URL` | `http://localhost:3001` |
| `DATABASE_URL` | **leave empty**: a local SQLite file is used |
| `BLOB_READ_WRITE_TOKEN` | **leave empty**: photos are stored in `./media` |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | a local test account, e.g. `admin@cannelle.test` and a password you choose |
| `SEED_EDITOR_EMAIL` / `SEED_EDITOR_PASSWORD` | e.g. `editor@cannelle.test` and a password you choose |

Then:

```powershell
npm run seed
npm run dev -- --port 3001
```

The seed takes a few minutes. Then open:

- http://localhost:3001/fr/news, the public site
- http://localhost:3001/admin, the admin, with the `SEED_*` account above

`NEXT_PUBLIC_SERVER_URL` must match the port the site runs on, or photos
don't load. Port 3001 is also what Claude Code's preview uses
(`.claude/launch.json`).

Your local site has its own database and photos, separate from the live
site. Nothing you do locally changes the live site until you push to `main`.

---

## 2. Working on two computers

Git is how the two PCs stay in step. **Before you start** on either PC:

```powershell
git checkout institutional-site
git pull
```

**Before you stop**, commit and push, so the other PC can pull your work:

```powershell
git push origin institutional-site
```

Your `.env` and local database stay on each PC. That is on purpose: they
hold passwords.

---

## 3. Putting changes live

**Text, photos, products, news:** no code needed. Edit them in the live admin
and publish. They show on the site at once.

**Code changes** (design, layout, new pages): push the branch, then move
`main` up to it:

```powershell
git checkout institutional-site
git push origin institutional-site
git checkout main
git pull
git merge --ff-only institutional-site
git push origin main
git checkout institutional-site
```

Vercel builds and publishes in about two minutes. Watch it on the Vercel
project page.

**Changes to fields or collections** (anything in `src/collections/` or
`src/globals/`) need one more step **before** pushing `main`: the live
database must get the new structure. Follow step 5 of "Deploying to Vercel +
Neon" in the README. In short:

1. Copy `DATABASE_URL` and `BLOB_READ_WRITE_TOKEN` from Vercel (project →
   Settings → Environment Variables) into your `.env`.
2. Run `npm run dev`, open one page, and answer the terminal's questions.
   Read each question before you answer.
3. Stop the server and put your local `.env` values back.

**Never run `npm run seed` while `.env` points at the live database**, unless
you mean to replace all live content with the sample content. It deletes
everything editors have entered.

---

## 4. Logging in to the live admin

The live admin account is **markcling1997@gmail.com**. Its password is the
`SEED_ADMIN_PASSWORD` you typed into `.env` when the live database was
seeded on 27 October. That `.env` was then switched back to local values, so
the password isn't on the old PC any more either.

If you can't remember it, the "Forgot password" link won't help, because the
site can't send email. Ask Claude Code to "reset the live admin password with
a one-off Payload script". It needs the live `DATABASE_URL` in `.env` for a
few minutes.

---

## 5. Still to do

**Security, first:**

- **Replace the two live keys.** The Vercel Blob token and the Neon database
  password were pasted in a chat while the site was being put live, so treat
  them as known.
  - **Neon:** reset the password of the `neondb_owner` role, then paste the
    new connection string into Vercel's `DATABASE_URL`.
  - **Vercel:** create a new Blob read-write token and update
    `BLOB_READ_WRITE_TOKEN`.
  - Then redeploy from Vercel. Menu names may differ slightly. Claude Code
    can walk you through it in the browser.

**For the client:**

- **Accounts for Célestin and Heide:** create them in the live admin
  (Users → Create, role *Editor*; in the French admin, Utilisateurs →
  Créer, rôle *Éditeur*) once you have their email addresses.
  Send each person their own login. Don't share yours.
- **Official colours:** the client's palette (#0B4F3C green, #D4AF37 gold,
  #F7F4EA cream, #222222 text) was applied once and then reverted on
  request. The site uses the original greens and golds until the client
  confirms.
- **Real content:** everything is fictional sample content. The founder is a
  placeholder, and company registration numbers say "À compléter / To be
  provided". Replace them through the admin as the client sends real texts
  and photos.
- **Own domain:** when there is one, add it in Vercel (Settings → Domains).
  Set `NEXT_PUBLIC_SERVER_URL` to it in Vercel, then redeploy, so share cards
  and photo links use it.
- **Email:** the contact form saves enquiries in the admin but sends no
  email. Sending it needs a mail service, which is a subscription decision.

---

## 6. Things learned the hard way

- **Don't call a dropdown field `status`** in a collection that has drafts.
  On PostgreSQL it clashes with Payload's own `_status` and breaks the
  deploy. That is why projects use `progress`.
- **`npm run lint` is broken** (an error in the ESLint configuration). Check
  the code with `npx tsc --noEmit` instead. No output means no errors.
- **After changing collections or globals,** run `npm run generate:types`
  and `npm run generate:importmap`, then commit both, as the README explains.
- **The live site only changes when `main` changes.** Pushing
  `institutional-site` alone creates a preview on Vercel, which only you can
  open while signed in to Vercel.
- **"LF will be replaced by CRLF" warnings** from Git on Windows are
  harmless.
- **Share cards** (the preview picture when a link is shared) are drawn from
  live content. To refresh one a network has already stored, paste the link
  into Facebook's Sharing Debugger or LinkedIn's Post Inspector.

---

## 7. Continuing with Claude Code

Claude Code on the new PC doesn't remember earlier conversations. Open the
project folder, then start with:

> Read HANDOFF.md and README.md first. Commits go out as markcling07.
> Ask me before pushing to `main`.
