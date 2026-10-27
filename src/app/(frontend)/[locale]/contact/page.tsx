import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { EnquiryForm } from '@/components/EnquiryForm'
import { PageHeader } from '@/components/PageHeader'
import { getCompanies, getGlobal, getPayloadClient, publishedIn } from '@/lib/content'
import { isLocale, t, type Locale } from '@/lib/locale'

export const dynamic = 'force-dynamic'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

type PageProps = { params: Promise<{ locale: string }>; searchParams: SearchParams }

const first = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value

const TYPES = ['quote', 'commercial', 'partnership', 'other']

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}

  const intros = await getGlobal('section-intros', locale, 0)

  return {
    title: intros.contact?.title || t('contact', locale),
    description: intros.contact?.intro ?? undefined,
    alternates: { canonical: `/${locale}/contact` },
  }
}

/** One office block: the Group, or one of its companies. */
function Office({
  name,
  label,
  email,
  phone,
  address,
}: {
  name: string
  label?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
}) {
  return (
    <section className="office">
      <h3 className="office__name">{name}</h3>
      {label ? <p className="office__label">{label}</p> : null}
      <ul className="contact-lines">
        {email ? (
          <li>
            <a href={`mailto:${email}`}>{email}</a>
          </li>
        ) : null}
        {phone ? (
          <li>
            <a href={`tel:${phone.replace(/\s+/g, '')}`}>{phone}</a>
          </li>
        ) : null}
        {address ? <li className="address">{address}</li> : null}
      </ul>
    </section>
  )
}

export default async function ContactPage({ params, searchParams }: PageProps) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale: Locale = raw

  const query = await searchParams
  const requestedType = first(query.type) ?? ''
  const requestedProduct = first(query.product) ?? ''

  const payload = await getPayloadClient()

  const [intros, settings, companies, products] = await Promise.all([
    getGlobal('section-intros', locale, 0),
    getGlobal('site-settings', locale),
    getCompanies(locale),
    payload.find({
      collection: 'products',
      locale,
      depth: 0,
      limit: 200,
      sort: 'title',
      draft: false,
      select: { title: true, slug: true },
      where: { and: publishedIn() },
    }),
  ])

  const options = products.docs.map((product) => ({ id: product.id, title: product.title }))
  const preselected = products.docs.find((product) => product.slug === requestedProduct)?.id ?? null

  return (
    <>
      <PageHeader title={intros.contact?.title || t('contact', locale)} intro={intros.contact?.intro} />

      <div className="container contact-layout">
        <EnquiryForm
          locale={locale}
          products={options}
          defaultType={TYPES.includes(requestedType) ? requestedType : preselected ? 'quote' : 'commercial'}
          defaultProduct={preselected}
        />

        <aside aria-label={t('ourOffices', locale)}>
          <Office
            name={settings?.siteName ?? 'GROUPE JAOVAZAHA'}
            label={t('umbrellaBrand', locale)}
            email={settings?.contactEmail}
            phone={settings?.contactPhone}
            address={settings?.address}
          />

          {companies.map((company) => (
            <Office
              key={company.id}
              name={`${company.shortName} — ${company.name}`}
              label={[t('independentCompany', locale), company.country].filter(Boolean).join(' · ')}
              email={company.email}
              phone={company.phone}
              address={company.address}
            />
          ))}
        </aside>
      </div>
    </>
  )
}
