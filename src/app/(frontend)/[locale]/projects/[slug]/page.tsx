import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'

import type { Company } from '@/payload-types'
import { MediaImage } from '@/components/MediaImage'
import { findBySlug, redirectToTranslation } from '@/lib/content'
import { PROJECT_STATUS_KEYS, isLocale, t, type Locale } from '@/lib/locale'

export const dynamic = 'force-dynamic'

type PageParams = { params: Promise<{ locale: string; slug: string }> }

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale: raw, slug } = await params
  if (!isLocale(raw)) return {}

  const project = await findBySlug('projects', slug, raw, 1)
  if (!project?.title) return {}

  // The share card comes from opengraph-image.tsx beside this file.
  return {
    title: project.title,
    description: project.summary ?? undefined,
    alternates: { canonical: `/${raw}/projects/${project.slug}` },
  }
}

export default async function ProjectPage({ params }: PageParams) {
  const { locale: rawLocale, slug } = await params
  if (!isLocale(rawLocale)) notFound()
  const locale: Locale = rawLocale

  const project = await findBySlug('projects', slug, locale)

  if (!project?.title) {
    if (await redirectToTranslation('projects', slug, locale, 'projects')) {
      return (
        <div className="container">
          <Link href={`/${locale}/projects`} className="back-link">
            {t('backToProjects', locale)}
          </Link>
          <p className="empty">{t('notTranslated', locale)}</p>
        </div>
      )
    }
    notFound()
  }

  const company =
    project.company && typeof project.company === 'object' ? (project.company as Company) : null

  return (
    <div className="container">
      <Link href={`/${locale}/projects`} className="back-link">
        {t('backToProjects', locale)}
      </Link>

      <article className="article">
        <p>
          <span className="badge" data-status={project.progress}>
            {t(PROJECT_STATUS_KEYS[project.progress], locale)}
          </span>
        </p>

        <h1 className="article__title">{project.title}</h1>
        {project.summary ? <p className="article__lead">{project.summary}</p> : null}

        <p className="article__meta">
          {project.location ? (
            <span>
              <strong>{t('location', locale)}</strong> {project.location}
            </span>
          ) : null}
          {project.period ? (
            <span>
              <strong>{t('period', locale)}</strong> {project.period}
            </span>
          ) : null}
          <span>
            <strong>{t('ledBy', locale)}</strong>{' '}
            {company ? (
              <Link href={`/${locale}/companies/${company.slug}`}>{company.shortName}</Link>
            ) : (
              t('groupLevel', locale)
            )}
          </span>
        </p>

        <div className="article__media">
          <MediaImage media={project.coverImage} size="hero" sizes="(max-width: 800px) 100vw, 760px" eager />
        </div>

        {project.description ? (
          <div className="rich-text">
            <RichText data={project.description} />
          </div>
        ) : null}
      </article>
    </div>
  )
}
