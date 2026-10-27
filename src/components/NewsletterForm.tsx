'use client'

import { useActionState } from 'react'

import { subscribe, type SubscribeState } from '@/app/(frontend)/actions'
import { t, type Locale } from '@/lib/locale'

const initial: SubscribeState = { status: 'idle' }

const MESSAGE = {
  ok: 'subscribeOk',
  exists: 'subscribeExists',
  invalid: 'subscribeInvalid',
  error: 'subscribeError',
} as const

export function NewsletterForm({ locale }: { locale: Locale }) {
  const [state, formAction, pending] = useActionState(subscribe, initial)

  const message = state.status === 'idle' ? null : t(MESSAGE[state.status], locale)

  return (
    <form action={formAction} className="newsletter__form">
      <input type="hidden" name="locale" value={locale} />

      <label htmlFor="newsletter-email" className="skip-link">
        {t('emailPlaceholder', locale)}
      </label>

      <input
        id="newsletter-email"
        className="newsletter__input"
        type="email"
        name="email"
        required
        autoComplete="email"
        placeholder={t('emailPlaceholder', locale)}
      />

      <button type="submit" className="btn btn--primary" disabled={pending}>
        {t('send', locale)}
      </button>

      {message ? (
        <p
          className="newsletter__status"
          data-state={state.status === 'ok' ? 'ok' : 'error'}
          role="status"
        >
          {message}
        </p>
      ) : null}
    </form>
  )
}
