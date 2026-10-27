import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import type { Company } from '@/payload-types'
import { MediaImage } from '@/components/MediaImage'
import { PageHeader } from '@/components/PageHeader'
import { getGlobal, getPayloadClient, publishedIn } from '@/lib/content'
import { PROJECT_STATUS_KEYS, isLocale, t, type Locale } from '@/lib/locale'

export const dynamic = 'force-dynamic'

type PageProps = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}

  const intros = await getGlobal('section-intros', locale, 0)

  return {
    title: intros.projects?.title || t('projects', locale),
    description: intros.projects?.intro ?? undefined,
    alternates: { canonical: `/${locale}/projects` },
  }
}

export default async function ProjectsPage({ params }: PageProps) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale: Locale = raw

  const payload = await getPayloadClient()

  const [intros, projects] = await Promise.all([
    getGlobal('section-intros', locale, 0),
    payload.find({
      collection: 'projects',
      locale,
      depth: 1,
      limit: 50,
      sort: 'order',
      draft: false,
      where: { and: publishedIn() },
    }),
  ])

  return (
    <>
      <PageHeader
        title={intros.projects?.title || t('projects', locale)}
        intro={intros.projects?.intro}
      />

      <div className="container">
        {projects.docs.length === 0 ? (
          <p className="empty">{t('noProjects', locale)}</p>
        ) : (
          <ul className="card-grid">
            {projects.docs.map((project, index) => {
              const company =
                project.company && typeof project.company === 'object' ? (project.company as Company) : null

              return (
                <li key={project.id}>
                  <Link href={`/${locale}/projects/${project.slug}`} className="card__link">
                    <div className="card__media">
                      <MediaImage
                        media={project.coverImage}
                        sizes="(max-width: 900px) 100vw, 33vw"
                        eager={index < 3}
                      />
                      <span className="badge card__badge" data-status={project.progress}>
                        {t(PROJECT_STATUS_KEYS[project.progress], locale)}
                      </span>
                    </div>

                    <h2 className="card__title">{project.title}</h2>
                    {project.summary ? <p className="card__text">{project.summary}</p> : null}

                    <p className="card__meta">
                      {project.location ? <span>{project.location}</span> : null}
                      {project.period ? <span>{project.period}</span> : null}
                      <span>
                        {t('ledBy', locale)} {company ? company.shortName : t('groupLevel', locale)}
                      </span>
                    </p>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </>
  )
}
