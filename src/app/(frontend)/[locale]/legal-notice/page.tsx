import type { Metadata } from 'next'

import { LegalPage, legalMetadata } from '@/components/LegalPage'

export const dynamic = 'force-dynamic'

type PageProps = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  return legalMetadata(locale, 'legalNotice')
}

export default async function LegalNoticePage({ params }: PageProps) {
  const { locale } = await params
  return <LegalPage locale={locale} page="legalNotice" />
}
