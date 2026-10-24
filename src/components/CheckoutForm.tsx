'use client'

import { useMemo, useState, useTransition, type ChangeEvent, type FormEvent } from 'react'

import { placeMockOrder } from '@/app/(frontend)/cart-actions'
import { OrderSummary } from '@/components/OrderSummary'
import type { PaymentMethod, SummaryData } from '@/lib/cart'
import { fill, t, type Locale, type StringKey } from '@/lib/locale'

/**
 * Checkout with a simulated payment gateway.
 *
 * Everything that looks like talking to a bank happens here, in the browser,
 * with a delay. The card number is validated (Luhn, expiry, CVC) but never
 * sent anywhere: the inputs have no `name`, the form never submits, and the
 * server only receives a masked "Visa •••• 4242" once payment is "approved".
 */

const COUNTRIES = ['FR', 'MG', 'RE', 'BE', 'CH', 'LU', 'MU', 'CA', 'DE', 'GB', 'US']

const OPERATORS = [
  { id: 'mvola', label: 'MVola', placeholder: '034 12 345 67' },
  { id: 'orange', label: 'Orange Money', placeholder: '032 12 345 67' },
  { id: 'airtel', label: 'Airtel Money', placeholder: '033 12 345 67' },
] as const

/** The test card that the simulated bank always refuses. */
const DECLINED_CARD = '4000000000000002'

const METHODS: { id: PaymentMethod; label: StringKey }[] = [
  { id: 'card', label: 'methodCard' },
  { id: 'mobile', label: 'methodMobile' },
  { id: 'paypal', label: 'methodPaypal' },
]

type Phase = 'idle' | 'processing' | 'awaiting' | 'redirecting' | 'declined'

type Fields = {
  email: string
  phone: string
  name: string
  address: string
  postalCode: string
  city: string
  country: string
  cardNumber: string
  cardExpiry: string
  cardCvc: string
  cardName: string
  operator: (typeof OPERATORS)[number]['id']
  mobileNumber: string
}

type FieldKey = keyof Fields

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const digitsOf = (value: string): string => value.replace(/\D/g, '')

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

type Brand = 'visa' | 'mastercard' | 'amex'

const BRAND_LABEL: Record<Brand, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'American Express',
}

const cardBrand = (digits: string): Brand | null => {
  if (/^3[47]/.test(digits)) return 'amex'
  if (/^4/.test(digits)) return 'visa'
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'mastercard'
  return null
}

/** 4242 4242 4242 4242, or 3782 822463 10005 for American Express. */
const formatCardNumber = (value: string): string => {
  const digits = digitsOf(value)

  if (cardBrand(digits) === 'amex') {
    const d = digits.slice(0, 15)
    return [d.slice(0, 4), d.slice(4, 10), d.slice(10)].filter(Boolean).join(' ')
  }

  return (
    digits
      .slice(0, 16)
      .match(/.{1,4}/g)
      ?.join(' ') ?? ''
  )
}

/** Standard card checksum: catches most typing mistakes. */
const passesLuhn = (digits: string): boolean => {
  let sum = 0
  let double = false

  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i])
    if (double) {
      n *= 2
      if (n > 9) n -= 9
    }
    sum += n
    double = !double
  }

  return digits.length > 0 && sum % 10 === 0
}

const formatExpiry = (value: string): string => {
  const digits = digitsOf(value).slice(0, 4)
  return digits.length > 2 ? `${digits.slice(0, 2)} / ${digits.slice(2)}` : digits
}

const validExpiry = (value: string): boolean => {
  const digits = digitsOf(value)
  if (digits.length !== 4) return false

  const month = Number(digits.slice(0, 2))
  const year = 2000 + Number(digits.slice(2))
  if (month < 1 || month > 12) return false

  // A card is valid until the last day of its expiry month.
  return new Date(year, month, 1) > new Date()
}

/** Malagasy mobile number: 03X XX XXX XX, with or without +261. */
const localMobile = (value: string): string | null => {
  const digits = digitsOf(value).replace(/^261/, '')
  const local = digits.startsWith('0') ? digits : `0${digits}`
  return /^03[2-9]\d{7}$/.test(local) ? local : null
}

const maskMobile = (local: string): string => `${local.slice(0, 3)} •• ••• ${local.slice(-2)}`

const validate = (fields: Fields, method: PaymentMethod): Partial<Record<FieldKey, StringKey>> => {
  const errors: Partial<Record<FieldKey, StringKey>> = {}
  const required: FieldKey[] = ['email', 'phone', 'name', 'address', 'postalCode', 'city']

  for (const key of required) if (!fields[key].trim()) errors[key] = 'errRequired'

  if (!errors.email && !EMAIL.test(fields.email.trim())) errors.email = 'errEmail'
  if (!errors.phone && digitsOf(fields.phone).length < 8) errors.phone = 'errPhone'

  if (method === 'card') {
    const digits = digitsOf(fields.cardNumber)
    const brand = cardBrand(digits)
    const length = brand === 'amex' ? 15 : 16

    if (!digits) errors.cardNumber = 'errRequired'
    else if (digits.length !== length || !passesLuhn(digits)) errors.cardNumber = 'errCardNumber'

    if (!fields.cardExpiry) errors.cardExpiry = 'errRequired'
    else if (!validExpiry(fields.cardExpiry)) errors.cardExpiry = 'errExpiry'

    if (!fields.cardCvc) errors.cardCvc = 'errRequired'
    else if (fields.cardCvc.length !== (brand === 'amex' ? 4 : 3)) errors.cardCvc = 'errCvc'

    if (!fields.cardName.trim()) errors.cardName = 'errRequired'
  }

  if (method === 'mobile') {
    if (!fields.mobileNumber.trim()) errors.mobileNumber = 'errRequired'
    else if (!localMobile(fields.mobileNumber)) errors.mobileNumber = 'errPhone'
  }

  return errors
}

export function CheckoutForm({
  locale,
  summary,
  totalLabel,
}: {
  locale: Locale
  summary: SummaryData
  totalLabel: string
}) {
  const [method, setMethod] = useState<PaymentMethod>('card')
  const [phase, setPhase] = useState<Phase>('idle')
  const [submitted, setSubmitted] = useState(false)
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({})
  const [orderFailed, setOrderFailed] = useState<false | 'empty' | 'stock'>(false)
  const [, startTransition] = useTransition()

  const [fields, setFields] = useState<Fields>({
    email: '',
    phone: '',
    name: '',
    address: '',
    postalCode: '',
    city: '',
    country: locale === 'fr' ? 'FR' : 'GB',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    cardName: '',
    operator: 'mvola',
    mobileNumber: '',
  })

  const errors = useMemo(() => validate(fields, method), [fields, method])
  const busy = phase === 'processing' || phase === 'awaiting' || phase === 'redirecting'
  const brand = cardBrand(digitsOf(fields.cardNumber))
  const operator = OPERATORS.find((o) => o.id === fields.operator) ?? OPERATORS[0]

  const countryNames = useMemo(() => {
    const names = new Intl.DisplayNames([locale], { type: 'region' })
    return COUNTRIES.map((code) => ({ code, name: names.of(code) ?? code })).sort((a, b) =>
      a.name.localeCompare(b.name, locale),
    )
  }, [locale])

  const errorFor = (key: FieldKey): StringKey | undefined =>
    submitted || touched[key] ? errors[key] : undefined

  const update =
    (key: FieldKey, format?: (value: string) => string) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = format ? format(event.target.value) : event.target.value
      setFields((current) => ({ ...current, [key]: value }))
      if (phase === 'declined') setPhase('idle')
    }

  /** Shared props for a text input: value, change, blur and error wiring. */
  const inputProps = (key: FieldKey, format?: (value: string) => string) => {
    const error = errorFor(key)
    return {
      id: `co-${key}`,
      className: 'input',
      value: fields[key],
      onChange: update(key, format),
      onBlur: () => setTouched((current) => ({ ...current, [key]: true })),
      'aria-invalid': error ? true : undefined,
      'aria-describedby': error ? `co-${key}-error` : undefined,
      disabled: busy,
    }
  }

  const fieldError = (key: FieldKey) => {
    const error = errorFor(key)
    return error ? (
      <p id={`co-${key}-error`} className="field__error">
        {t(error, locale)}
      </p>
    ) : null
  }

  const placeOrder = (detail: string) =>
    startTransition(async () => {
      // On success the action redirects to the confirmation page.
      const result = await placeMockOrder(locale, {
        email: fields.email,
        payment: { method, detail },
        delivery: {
          name: fields.name,
          address: fields.address,
          postalCode: fields.postalCode,
          city: fields.city,
          country: fields.country,
        },
      })

      if (result?.error) {
        setPhase('idle')
        setOrderFailed(result.error)
      }
    })

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
    setOrderFailed(false)

    const firstInvalid = (Object.keys(errors) as FieldKey[])[0]
    if (firstInvalid) {
      document.getElementById(`co-${firstInvalid}`)?.focus()
      return
    }

    if (method === 'card') {
      const digits = digitsOf(fields.cardNumber)
      setPhase('processing')
      await wait(1800)

      if (digits === DECLINED_CARD) {
        setPhase('declined')
        return
      }

      placeOrder(`${brand ? BRAND_LABEL[brand] : t('methodCard', locale)} •••• ${digits.slice(-4)}`)
      return
    }

    if (method === 'mobile') {
      setPhase('awaiting')
      await wait(3500)
      placeOrder(`${operator.label} · ${maskMobile(localMobile(fields.mobileNumber) ?? '')}`)
      return
    }

    setPhase('redirecting')
    await wait(2200)
    placeOrder(`PayPal · ${fields.email.trim()}`)
  }

  const showFormError = submitted && Object.keys(errors).length > 0

  return (
    <div className="checkout">
      <form className="checkout__form" onSubmit={onSubmit} noValidate>
        <div className="test-banner" role="note">
          <strong>{t('testMode', locale)}</strong> {t('testModeText', locale)}
        </div>

        <fieldset className="checkout__section" disabled={busy}>
          <legend>{t('contact', locale)}</legend>

          <div className="field">
            <label htmlFor="co-email">{t('emailAddress', locale)}</label>
            <input {...inputProps('email')} type="email" autoComplete="email" />
            {fieldError('email')}
          </div>

          <div className="field">
            <label htmlFor="co-phone">{t('phone', locale)}</label>
            <input {...inputProps('phone')} type="tel" autoComplete="tel" />
            {fieldError('phone')}
          </div>
        </fieldset>

        <fieldset className="checkout__section" disabled={busy}>
          <legend>{t('deliveryAddress', locale)}</legend>

          <div className="field">
            <label htmlFor="co-name">{t('fullName', locale)}</label>
            <input {...inputProps('name')} autoComplete="name" />
            {fieldError('name')}
          </div>

          <div className="field">
            <label htmlFor="co-address">{t('address', locale)}</label>
            <input {...inputProps('address')} autoComplete="street-address" />
            {fieldError('address')}
          </div>

          <div className="field-row">
            <div className="field field--narrow">
              <label htmlFor="co-postalCode">{t('postalCode', locale)}</label>
              <input {...inputProps('postalCode')} autoComplete="postal-code" />
              {fieldError('postalCode')}
            </div>

            <div className="field">
              <label htmlFor="co-city">{t('city', locale)}</label>
              <input {...inputProps('city')} autoComplete="address-level2" />
              {fieldError('city')}
            </div>
          </div>

          <div className="field">
            <label htmlFor="co-country">{t('country', locale)}</label>
            <select
              id="co-country"
              className="input"
              value={fields.country}
              onChange={update('country')}
              autoComplete="country"
            >
              {countryNames.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
        </fieldset>

        <fieldset className="checkout__section" disabled={busy}>
          <legend>{t('paymentMethod', locale)}</legend>

          <div className="pay-methods">
            {METHODS.map((option) => (
              <label
                key={option.id}
                className={method === option.id ? 'pay-method is-selected' : 'pay-method'}
              >
                <input
                  type="radio"
                  name="method"
                  value={option.id}
                  checked={method === option.id}
                  onChange={() => {
                    setMethod(option.id)
                    setPhase('idle')
                  }}
                />
                <span>{t(option.label, locale)}</span>
              </label>
            ))}
          </div>

          {method === 'card' ? (
            <div className="pay-panel">
              <div className="field">
                <label htmlFor="co-cardNumber">{t('cardNumber', locale)}</label>
                <div className="input-with-badge">
                  {/* No name and no card autocomplete: this is a mock, so the
                      browser should not offer to fill in a real card. */}
                  <input
                    {...inputProps('cardNumber', formatCardNumber)}
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="1234 1234 1234 1234"
                  />
                  {brand ? <span className="card-badge">{BRAND_LABEL[brand]}</span> : null}
                </div>
                {fieldError('cardNumber')}
              </div>

              <div className="field-row">
                <div className="field">
                  <label htmlFor="co-cardExpiry">{t('cardExpiry', locale)}</label>
                  <input
                    {...inputProps('cardExpiry', formatExpiry)}
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder={locale === 'fr' ? 'MM / AA' : 'MM / YY'}
                  />
                  {fieldError('cardExpiry')}
                </div>

                <div className="field field--narrow">
                  <label htmlFor="co-cardCvc">{t('cardCvc', locale)}</label>
                  <input
                    {...inputProps('cardCvc', (value) =>
                      digitsOf(value).slice(0, brand === 'amex' ? 4 : 3),
                    )}
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder={brand === 'amex' ? '1234' : '123'}
                  />
                  {fieldError('cardCvc')}
                </div>
              </div>

              <div className="field">
                <label htmlFor="co-cardName">{t('cardName', locale)}</label>
                <input {...inputProps('cardName')} autoComplete="off" />
                {fieldError('cardName')}
              </div>
            </div>
          ) : null}

          {method === 'mobile' ? (
            <div className="pay-panel">
              <div className="field">
                <span className="field__label">{t('operator', locale)}</span>
                <div className="operators">
                  {OPERATORS.map((option) => (
                    <label
                      key={option.id}
                      className={fields.operator === option.id ? 'pill is-active' : 'pill'}
                    >
                      <input
                        type="radio"
                        name="operator"
                        value={option.id}
                        checked={fields.operator === option.id}
                        onChange={update('operator')}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="field">
                <label htmlFor="co-mobileNumber">{t('mobileNumber', locale)}</label>
                <input
                  {...inputProps('mobileNumber')}
                  type="tel"
                  autoComplete="off"
                  placeholder={operator.placeholder}
                />
                {fieldError('mobileNumber')}
                <p className="field__hint">{t('mobileHint', locale)}</p>
              </div>
            </div>
          ) : null}

          {method === 'paypal' ? (
            <div className="pay-panel">
              <p className="field__hint">{t('paypalHint', locale)}</p>
            </div>
          ) : null}

          <p className="secure-note">
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              <path
                d="M4.5 7V5a3.5 3.5 0 0 1 7 0v2M3.5 7h9v7h-9z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </svg>
            {t('securePayment', locale)}
          </p>
        </fieldset>

        {phase === 'declined' ? (
          <p className="alert" role="alert">
            {t('declined', locale)}
          </p>
        ) : null}

        {showFormError ? (
          <p className="alert" role="alert">
            {t('errFixForm', locale)}
          </p>
        ) : null}

        {orderFailed ? (
          <p className="alert" role="alert">
            {t(orderFailed === 'stock' ? 'orderStockError' : 'cartError', locale)}
          </p>
        ) : null}

        <button type="submit" className="btn-accent btn-pay" disabled={busy}>
          {busy ? t('processing', locale) : fill(t('payAmount', locale), { amount: totalLabel })}
        </button>
      </form>

      <aside className="checkout__summary">
        <OrderSummary data={summary} locale={locale} />
      </aside>

      {busy ? (
        <div className="pay-overlay">
          <div className="pay-overlay__card" role="status" aria-live="assertive">
            <span className="spinner" aria-hidden="true" />
            <p className="pay-overlay__title">
              {phase === 'awaiting'
                ? operator.label
                : phase === 'redirecting'
                  ? t('redirectPaypal', locale)
                  : t('processing', locale)}
            </p>
            <p className="pay-overlay__text">
              {phase === 'awaiting'
                ? fill(t('awaitingMobile', locale), {
                    phone: maskMobile(localMobile(fields.mobileNumber) ?? ''),
                  })
                : t('processingHint', locale)}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  )
}
