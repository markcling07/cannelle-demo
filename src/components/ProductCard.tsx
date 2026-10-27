import Link from 'next/link'

import type { Category, Company, Product } from '@/payload-types'
import { MediaImage } from '@/components/MediaImage'
import type { Locale } from '@/lib/locale'

const asDoc = <T extends object>(value: number | T | null | undefined): T | null =>
  value && typeof value === 'object' ? value : null

/** A product in a grid: photograph, category, name, one line, company. */
export function ProductCard({
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

  return (
    <li className="product-card">
      <Link href={`/${locale}/products/${product.slug}`}>
        <div className="product-card__media">
          <MediaImage
            media={product.image}
            sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
            eager={eager}
          />
        </div>

        {category?.title ? <p className="card__eyebrow">{category.title}</p> : null}
        <h3 className="product-card__title">{product.title}</h3>

        {product.shortDescription ? (
          <p className="product-card__text">{product.shortDescription}</p>
        ) : null}

        {company ? (
          <p className="product-card__company">
            <span className="badge">{company.shortName}</span>
          </p>
        ) : null}
      </Link>
    </li>
  )
}
