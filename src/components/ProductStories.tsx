import Link from 'next/link'

import type { Category, Company, Product } from '@/payload-types'
import { Arrow } from '@/components/Arrow'
import { MediaImage } from '@/components/MediaImage'
import { t, type Locale } from '@/lib/locale'

const asDoc = <T extends object>(value: number | T | null | undefined): T | null =>
  value && typeof value === 'object' ? value : null

/**
 * The catalogue is laid out like a magazine rather than a shop grid: the
 * products are dealt out into blocks of different shapes, in this order,
 * then the order starts again.
 *
 *   lead   one product, large photograph, the text panel overlapping it
 *   pair   two products side by side, the second set lower
 *   split  one product on a cream panel
 *   trio   three compact products
 *   band   one product on the green band, with a quotation button
 */
const RHYTHM = ['lead', 'pair', 'split', 'trio', 'band', 'pair', 'split', 'trio'] as const

type BlockKind = (typeof RHYTHM)[number]

const SIZE: Record<BlockKind, number> = { lead: 1, pair: 2, split: 1, trio: 3, band: 1 }

type Block = { kind: BlockKind; products: Product[]; flip: boolean }

/**
 * Deals the products into blocks. A block the remaining products cannot fill
 * takes a smaller shape, chosen so it never repeats the block just before it
 * (a filtered list of five would otherwise end on two cream panels).
 */
const deal = (products: Product[]): Block[] => {
  const blocks: Block[] = []
  let next = 0
  let step = 0

  while (next < products.length) {
    const left = products.length - next
    const previous = blocks.at(-1)?.kind
    let kind: BlockKind = RHYTHM[step % RHYTHM.length]
    if (SIZE[kind] > left) {
      if (left >= 2) kind = 'pair'
      else kind = previous === 'band' ? 'split' : 'band'
    }

    const count = Math.min(SIZE[kind], left)
    // Splits alternate sides, so two of them never look the same.
    const flip = kind === 'split' && blocks.filter((block) => block.kind === 'split').length % 2 === 1

    blocks.push({ kind, products: products.slice(next, next + count), flip })
    next += count
    step += 1
  }

  return blocks
}

/** What every block shows about a product, whatever its shape. */
const describe = (product: Product, locale: Locale) => {
  const category = asDoc<Category>(product.category)
  const company = asDoc<Company>(product.company)

  return {
    href: `/${locale}/products/${product.slug}`,
    quoteHref: `/${locale}/contact?type=quote&product=${encodeURIComponent(product.slug ?? '')}`,
    eyebrow: [
      category?.title,
      company ? [company.shortName, company.country].filter(Boolean).join(' — ') : null,
    ]
      .filter(Boolean)
      .join(' · '),
  }
}

function Facts({ product, count }: { product: Product; count: number }) {
  const facts = (product.features ?? []).filter((feature) => feature.value).slice(0, count)
  if (facts.length === 0) return null

  return (
    <dl className="story__facts">
      {facts.map((fact) => (
        <div key={fact.id ?? fact.label}>
          <dt>{fact.label}</dt>
          <dd>{fact.value}</dd>
        </div>
      ))}
    </dl>
  )
}

/**
 * The photograph links to the product too, as a shortcut for the mouse; the
 * title already does for keyboards and screen readers, so it is hidden from them.
 */
function Photo({
  product,
  href,
  className,
  sizes,
  eager = false,
}: {
  product: Product
  href: string
  className: string
  sizes: string
  eager?: boolean
}) {
  return (
    <Link href={href} className={className} tabIndex={-1} aria-hidden="true">
      <MediaImage media={product.image} sizes={sizes} eager={eager} alt="" />
    </Link>
  )
}

function Lead({ product, locale, eager }: { product: Product; locale: Locale; eager: boolean }) {
  const { href, eyebrow } = describe(product, locale)

  return (
    <article className="lead">
      <Photo product={product} href={href} className="lead__media" sizes="(max-width: 900px) 100vw, 680px" eager={eager} />
      <div className="lead__panel">
        {eyebrow ? <p className="story__eyebrow">{eyebrow}</p> : null}
        <h2 className="story__title story__title--xl">
          <Link href={href}>{product.title}</Link>
        </h2>
        {product.shortDescription ? <p className="story__text">{product.shortDescription}</p> : null}
        <Facts product={product} count={3} />
        <Link href={href} className="btn-arrow">
          {t('viewProduct', locale)}
          <Arrow />
        </Link>
      </div>
    </article>
  )
}

function Card({ product, locale, size }: { product: Product; locale: Locale; size: 'medium' | 'small' }) {
  const { href, eyebrow } = describe(product, locale)

  return (
    <article className={`tile tile--${size}`}>
      <Photo
        product={product}
        href={href}
        className="tile__media"
        sizes={size === 'medium' ? '(max-width: 700px) 100vw, 50vw' : '(max-width: 700px) 100vw, 33vw'}
      />
      {eyebrow ? <p className="story__eyebrow">{eyebrow}</p> : null}
      <h2 className={size === 'medium' ? 'story__title story__title--md' : 'story__title story__title--sm'}>
        <Link href={href}>{product.title}</Link>
      </h2>
      {size === 'medium' && product.shortDescription ? (
        <p className="story__text">{product.shortDescription}</p>
      ) : null}
      <Link href={href} className="section__link">
        {t('viewProduct', locale)}
      </Link>
    </article>
  )
}

function Split({ product, locale, flip }: { product: Product; locale: Locale; flip: boolean }) {
  const { href, eyebrow } = describe(product, locale)

  return (
    <article className={flip ? 'split-story split-story--flip' : 'split-story'}>
      <Photo product={product} href={href} className="split-story__media" sizes="(max-width: 900px) 100vw, 50vw" />
      <div className="split-story__body">
        {eyebrow ? <p className="story__eyebrow">{eyebrow}</p> : null}
        <h2 className="story__title">
          <Link href={href}>{product.title}</Link>
        </h2>
        {product.shortDescription ? <p className="story__text">{product.shortDescription}</p> : null}
        <Facts product={product} count={2} />
        <Link href={href} className="btn-arrow">
          {t('viewProduct', locale)}
          <Arrow />
        </Link>
      </div>
    </article>
  )
}

function Band({ product, locale }: { product: Product; locale: Locale }) {
  const { href, quoteHref, eyebrow } = describe(product, locale)

  return (
    <article className="band-story">
      <div className="band-story__body">
        {eyebrow ? <p className="story__eyebrow">{eyebrow}</p> : null}
        <h2 className="story__title">
          <Link href={href}>{product.title}</Link>
        </h2>
        {product.shortDescription ? <p className="story__text">{product.shortDescription}</p> : null}
        <Facts product={product} count={2} />
        <div className="btn-row">
          <Link href={quoteHref} className="btn btn--gold">
            {t('requestQuote', locale)}
          </Link>
          <Link href={href} className="btn btn--light">
            {t('viewProduct', locale)}
          </Link>
        </div>
      </div>
      <Photo product={product} href={href} className="band-story__media" sizes="(max-width: 900px) 100vw, 50vw" />
    </article>
  )
}

/** The whole catalogue, dealt into varied blocks. */
export function ProductStories({ products, locale }: { products: Product[]; locale: Locale }) {
  return (
    <div className="catalogue">
      {deal(products).map((block, index) => {
        const key = block.products.map((product) => product.id).join('-')
        const [first] = block.products

        switch (block.kind) {
          case 'lead':
            return <Lead key={key} product={first} locale={locale} eager={index === 0} />
          case 'split':
            return <Split key={key} product={first} locale={locale} flip={block.flip} />
          case 'band':
            return <Band key={key} product={first} locale={locale} />
          case 'pair':
          case 'trio':
            return (
              <div key={key} className={`tiles tiles--${block.kind}`}>
                {block.products.map((product) => (
                  <Card
                    key={product.id}
                    product={product}
                    locale={locale}
                    size={block.kind === 'pair' ? 'medium' : 'small'}
                  />
                ))}
              </div>
            )
        }
      })}
    </div>
  )
}
