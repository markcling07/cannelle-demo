import { postgresAdapter } from '@payloadcms/db-postgres'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { en } from '@payloadcms/translations/languages/en'
import { fr } from '@payloadcms/translations/languages/fr'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Albums } from './collections/Albums'
import { Categories } from './collections/Categories'
import { Companies } from './collections/Companies'
import { Enquiries } from './collections/Enquiries'
import { Media } from './collections/Media'
import { Partners } from './collections/Partners'
import { Posts } from './collections/Posts'
import { Products } from './collections/Products'
import { Projects } from './collections/Projects'
import { Subscribers } from './collections/Subscribers'
import { Team } from './collections/Team'
import { Users } from './collections/Users'
import { AboutPage } from './globals/AboutPage'
import { HomePage } from './globals/HomePage'
import { LegalPages } from './globals/LegalPages'
import { SectionIntros } from './globals/SectionIntros'
import { SiteSettings } from './globals/SiteSettings'
import { SITE_URL } from './lib/siteUrl'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const databaseUrl = (process.env.DATABASE_URL ?? '').replace(/^﻿/, '').trim()
const usePostgres = /^postgres(ql)?:\/\//i.test(databaseUrl)

/**
 * Production and the deployed demonstration run on PostgreSQL (Neon).
 *
 * With no DATABASE_URL set, the project falls back to a local SQLite file so
 * `npm run dev` works on a laptop with nothing else installed. The collections,
 * the admin panel and the public pages are identical either way — only the
 * storage engine changes.
 */
const database = usePostgres
  ? postgresAdapter({
      pool: { connectionString: databaseUrl },
      // Keeps the database schema in step with the collections below.
      // A long-lived production project should turn this off and use
      // committed migrations instead (`payload migrate:create`).
      push: true,
    })
  : sqliteAdapter({
      client: { url: databaseUrl || 'file:./jaovazaha-demo.db' },
      push: true,
    })

export default buildConfig({
  serverURL: SITE_URL,

  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' — Administration',
    },
  },

  // The administration sidebar follows this order: enquiries first, because
  // they are what needs looking at most often.
  collections: [
    Enquiries,
    Companies,
    Team,
    Projects,
    Partners,
    Products,
    Categories,
    Posts,
    Subscribers,
    Albums,
    Media,
    Users,
  ],
  globals: [HomePage, AboutPage, SectionIntros, LegalPages, SiteSettings],

  // The administration area in French or English. Each person picks their
  // own under Account → Language; French is the default.
  i18n: {
    supportedLanguages: { fr, en },
    fallbackLanguage: 'fr',
  },

  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  db: database,

  // The two language versions of the site. Every field marked
  // `localized: true` is stored once per locale, so French and English
  // content are edited and published independently of each other.
  localization: {
    locales: [
      { code: 'fr', label: 'Français' },
      { code: 'en', label: 'English' },
    ],
    defaultLocale: 'fr',
    // No fallback: if the English title is empty it stays empty rather than
    // silently showing the French one. This makes it obvious in the demo
    // that the two languages really are separate.
    fallback: false,
  },

  sharp,

  plugins: [
    // Product photographs are stored on Vercel Blob once a token is set.
    // Without the token (local development) Payload falls back to writing
    // files into the local media folder, so `npm run dev` works offline.
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
    }),
  ],
})
