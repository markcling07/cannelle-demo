'use client'

import Link from 'next/link'
import { useActionState } from 'react'

import { submitEnquiry, type EnquiryField, type EnquiryState } from '@/app/(frontend)/enquiry-actions'
import { t, type Locale, type StringKey } from '@/lib/locale'

const initial: EnquiryState = { status: 'idle' }

const TYPES: { value: string; label: StringKey }[] = [
  { value: 'quote', label: 'typeQuote' },
  { value: 'commercial', label: 'typeCommercial' },
  { value: 'partnership', label: 'typePartnership' },
  { value: 'other', label: 'typeOther' },
]

const ERROR_TEXT = {
  required: 'errRequired',
  email: 'errEmail',
  consent: 'errConsent',
} as const

export type ProductOption = { id: number; title: string }

/**
 * The enquiry form on the contact page. "Request a quotation" on a product
 * opens it with the type and the product already chosen.
 */
export function EnquiryForm({
  locale,
  products,
  defaultType,
  defaultProduct,
}: {
  locale: Locale
  products: ProductOption[]
  defaultType: string
  defaultProduct: number | null
}) {
  const [state, formAction, pending] = useActionState(submitEnquiry, initial)

  if (state.status === 'ok') {
    return (
      <div className="enquiry-form__done" role="status">
        <p>{t('enquiryThanks', locale)}</p>
        <p>{t('enquiryDemoNote', locale)}</p>
      </div>
    )
  }

  const values = state.values ?? {}
  const error = (field: EnquiryField) => state.errors?.[field]

  /** Label, input and its error message, wired together for screen readers. */
  const describe = (field: EnquiryField) =>
    error(field) ? { 'aria-invalid': true, 'aria-describedby': `enquiry-${field}-error` } : {}

  const errorText = (field: EnquiryField) => {
    const code = error(field)
    return code ? (
      <p id={`enquiry-${field}-error`} className="field__error">
        {t(ERROR_TEXT[code], locale)}
      </p>
    ) : null
  }

  const optional = <span className="field__optional"> ({t('optional', locale)})</span>

  return (
    <form action={formAction} className="enquiry-form" noValidate>
      <h2 className="enquiry-form__title">{t('writeToUs', locale)}</h2>

      <input type="hidden" name="locale" value={locale} />

      <div className="form-trap" aria-hidden="true">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="enquiry-type">{t('enquiryType', locale)}</label>
          <select id="enquiry-type" name="type" className="input" defaultValue={values.type || defaultType}>
            {TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {t(type.label, locale)}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="enquiry-product">
            {t('product', locale)}
            {optional}
          </label>
          <select
            id="enquiry-product"
            name="product"
            className="input"
            defaultValue={values.product || (defaultProduct ? String(defaultProduct) : '')}
          >
            <option value="">{t('productNone', locale)}</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="enquiry-name">{t('fullName', locale)}</label>
          <input
            id="enquiry-name"
            name="name"
            className="input"
            autoComplete="name"
            required
            defaultValue={values.name}
            {...describe('name')}
          />
          {errorText('name')}
        </div>

        <div className="field">
          <label htmlFor="enquiry-company">
            {t('companyName', locale)}
            {optional}
          </label>
          <input
            id="enquiry-company"
            name="company"
            className="input"
            autoComplete="organization"
            defaultValue={values.company}
          />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="enquiry-email">{t('emailAddress', locale)}</label>
          <input
            id="enquiry-email"
            name="email"
            type="email"
            className="input"
            autoComplete="email"
            required
            defaultValue={values.email}
            {...describe('email')}
          />
          {errorText('email')}
        </div>

        <div className="field">
          <label htmlFor="enquiry-phone">
            {t('phone', locale)}
            {optional}
          </label>
          <input
            id="enquiry-phone"
            name="phone"
            type="tel"
            className="input"
            autoComplete="tel"
            defaultValue={values.phone}
          />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="enquiry-country">
            {t('country', locale)}
            {optional}
          </label>
          <input
            id="enquiry-country"
            name="country"
            className="input"
            autoComplete="country-name"
            defaultValue={values.country}
          />
        </div>

        <div className="field">
          <label htmlFor="enquiry-volume">
            {t('volume', locale)}
            {optional}
          </label>
          <input
            id="enquiry-volume"
            name="volume"
            className="input"
            placeholder={t('volumeHint', locale)}
            defaultValue={values.volume}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="enquiry-message">{t('message', locale)}</label>
        <textarea
          id="enquiry-message"
          name="message"
          className="input"
          rows={6}
          required
          defaultValue={values.message}
          {...describe('message')}
        />
        {errorText('message')}
      </div>

      <div className="check">
        <input id="enquiry-consent" name="consent" type="checkbox" required {...describe('consent')} />
        <div>
          <label htmlFor="enquiry-consent">{t('consent', locale)}</label>{' '}
          <Link href={`/${locale}/privacy`}>{t('readPrivacy', locale)}</Link>
          {errorText('consent')}
        </div>
      </div>

      <button type="submit" className="btn btn--primary" disabled={pending}>
        {t('sendEnquiry', locale)}
      </button>

      {state.status === 'invalid' ? (
        <p className="form-error" role="alert">
          {t('errFixForm', locale)}
        </p>
      ) : null}
      {state.status === 'error' ? (
        <p className="form-error" role="alert">
          {t('subscribeError', locale)}
        </p>
      ) : null}
    </form>
  )
}
