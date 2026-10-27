import Link from 'next/link'

import type { Category, Company, Product } from '@/payload-types'
import { Arrow } from '@/components/Arrow'
import { MediaImage } from '@/components/MediaImage'
import { t, type Locale } from '@/lib/locale'

const asDoc = <T extends object>(value: number | T | null | undefined): T | null =>
  value && typeof value === 'object' ? value : null

/** How many rows of the technical information show in the list. */
const FACTS = 2

/**
 * A product in the catalogue, told like an article in a blog index: a large
 * photograph, the category and the company, the title, a short text and two
 * facts from its technical information — then an invitation to read on.
 */
export function ProductStory({
  product,
  locale,
  eager = false,
}: {
  product: Product
  locale: Locale
  eager?: boolean
}) {
  const category = asDoc<Category>(product.category)
  const company = asDoc<Company>(product.company)
  const href = `/${locale}/products/${product.slug}`
  const facts = (product.features ?? []).filter((feature) => feature.value).slice(0, FACTS)

  const eyebrow = [
    category?.title,
    company ? [company.shortName, company.country].filter(Boolean).join(' — ') : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <li className="story">
      {/* The title and the button already lead there; the photograph is a
          shortcut for the mouse, hidden from keyboards and screen readers. */}
      <Link href={href} className="story__media" tabIndex={-1} aria-hidden="true">
        <MediaImage media={product.image} sizes="(max-width: 900px) 100vw, 55vw" eager={eager} alt="" />
      </Link>

      <div className="story__body">
        {eyebrow ? <p className="story__eyebrow">{eyebrow}</p> : null}

        <h2 className="story__title">
          <Link href={href}>{product.title}</Link>
        </h2>

        {product.shortDescription ? <p className="story__text">{product.shortDescription}</p> : null}

        {facts.length > 0 ? (
          <dl className="story__facts">
            {facts.map((fact) => (
              <div key={fact.id ?? fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        <Link href={href} className="btn-arrow">
          {t('viewProduct', locale)}
          <Arrow />
        </Link>
      </div>
    </li>
  )
}
