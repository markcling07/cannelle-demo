import type { SummaryData } from '@/lib/cart'
import { t, type Locale } from '@/lib/locale'

/** The items and totals panel beside the checkout form and on the confirmation. */
export function OrderSummary({ data, locale }: { data: SummaryData; locale: Locale }) {
  return (
    <section className="summary" aria-labelledby="summary-heading">
      <h2 id="summary-heading" className="summary__heading">
        {t('orderSummary', locale)}
      </h2>

      <ul className="summary__items">
        {data.items.map((item) => (
          <li key={item.id} className="summary__item">
            <span className="summary__thumb">
              {item.imageUrl ? <img src={item.imageUrl} alt="" /> : null}
              <span className="summary__qty">{item.qty}</span>
            </span>
            <span className="summary__title">{item.title}</span>
            <span className="summary__price">{item.lineTotal}</span>
          </li>
        ))}
      </ul>

      <dl className="totals">
        <div className="totals__row">
          <dt>{t('subtotal', locale)}</dt>
          <dd>{data.subtotal}</dd>
        </div>
        <div className="totals__row">
          <dt>{t('shipping', locale)}</dt>
          <dd>{data.shipping}</dd>
        </div>
        <div className="totals__row totals__row--grand">
          <dt>{t('total', locale)}</dt>
          <dd>{data.total}</dd>
        </div>
      </dl>
    </section>
  )
}
