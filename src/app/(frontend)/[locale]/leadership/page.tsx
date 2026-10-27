import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import type { Company, Team } from '@/payload-types'
import { MediaImage } from '@/components/MediaImage'
import { PageHeader } from '@/components/PageHeader'
import { getCompanies, getGlobal, getPayloadClient } from '@/lib/content'
import { isLocale, t, type Locale } from '@/lib/locale'

export const dynamic = 'force-dynamic'

type PageProps = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}

  const intros = await getGlobal('section-intros', locale, 0)

  return {
    title: intros.leadership?.title || t('leadership', locale),
    description: intros.leadership?.intro ?? undefined,
    alternates: { canonical: `/${locale}/leadership` },
  }
}

const companyId = (member: Team): number | null =>
  member.company && typeof member.company === 'object' ? member.company.id : (member.company ?? null)

function Person({ member }: { member: Team }) {
  return (
    <li className="person">
      <MediaImage media={member.photo} size="thumbnail" className="person__photo" alt="" />
      <div>
        <h3 className="person__name">{member.name}</h3>
        <p className="person__role">{member.role}</p>
        {member.bio ? <p className="person__bio">{member.bio}</p> : null}
      </div>
    </li>
  )
}

/**
 * The founder first, then management grouped by level: the Group itself,
 * then each company — so it is clear who works for which legal entity.
 */
export default async function LeadershipPage({ params }: PageProps) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale: Locale = raw

  const payload = await getPayloadClient()

  const [intros, companies, team] = await Promise.all([
    getGlobal('section-intros', locale, 0),
    getCompanies(locale),
    payload.find({ collection: 'team', locale, depth: 1, limit: 100, sort: 'order' }),
  ])

  const members = team.docs.filter((member) => member.role)
  const founders = members.filter((member) => member.isFounder)
  const others = members.filter((member) => !member.isFounder)

  const groups: { key: string; title: string; members: Team[] }[] = [
    {
      key: 'group',
      title: t('groupLevel', locale),
      members: others.filter((member) => companyId(member) === null),
    },
    ...companies.map((company: Company) => ({
      key: String(company.id),
      title: `${company.shortName} — ${company.name}`,
      members: others.filter((member) => companyId(member) === company.id),
    })),
  ].filter((group) => group.members.length > 0)

  return (
    <>
      <PageHeader
        eyebrow={t('aboutGroup', locale)}
        title={intros.leadership?.title || t('leadership', locale)}
        intro={intros.leadership?.intro}
      />

      <div className="container">
        {founders.map((founder) => (
          <section key={founder.id} className="founder" aria-label={t('founder', locale)}>
            <MediaImage media={founder.photo} className="founder__photo" sizes="320px" eager alt="" />
            <div>
              <p className="eyebrow eyebrow--light">{t('founder', locale)}</p>
              <h2 className="founder__name">{founder.name}</h2>
              <p className="founder__role">{founder.role}</p>
              {founder.bio ? <p className="founder__bio">{founder.bio}</p> : null}
            </div>
          </section>
        ))}

        {groups.map((group) => (
          <section key={group.key} className="team-group" aria-labelledby={`team-${group.key}`}>
            <h2 id={`team-${group.key}`} className="team-group__title">
              {t('management', locale)} · {group.title}
            </h2>
            <ul className="card-grid">
              {group.members.map((member) => (
                <Person key={member.id} member={member} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  )
}
