'use client'

import { useActionState, useState } from 'react'

import { submitReview, type ReviewState } from '@/app/(frontend)/review-actions'
import { t, type Locale } from '@/lib/locale'

const initial: ReviewState = { status: 'idle' }

const MESSAGE = {
  ok: 'reviewThanks',
  invalid: 'reviewInvalid',
  error: 'subscribeError',
} as const

export function ReviewForm({ productId, locale }: { productId: number; locale: Locale }) {
  const [state, formAction, pending] = useActionState(submitReview, initial)
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)

  if (state.status === 'ok') {
    return (
      <p className="review-form__done" role="status">
        {t('reviewThanks', locale)}
      </p>
    )
  }

  const shown = hover || rating
  const message = state.status === 'idle' ? null : t(MESSAGE[state.status], locale)

  return (
    <form action={formAction} className="review-form">
      <h3 className="review-form__title">{t('writeReview', locale)}</h3>

      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="locale" value={locale} />

      {/* Hidden from people, tempting to bots. */}
      <div className="review-form__trap" aria-hidden="true">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <fieldset className="review-form__rating" onMouseLeave={() => setHover(0)}>
        <legend>{t('yourRating', locale)}</legend>
        {[1, 2, 3, 4, 5].map((value) => (
          <label
            key={value}
            className={value <= shown ? 'star-input is-on' : 'star-input'}
            onMouseEnter={() => setHover(value)}
          >
            <input
              type="radio"
              name="rating"
              value={value}
              checked={rating === value}
              onChange={() => setRating(value)}
              required
            />
            <span aria-hidden="true">★</span>
            <span className="skip-link">
              {value} / 5
            </span>
          </label>
        ))}
      </fieldset>

      <div className="field">
        <label htmlFor="review-name">{t('yourName', locale)}</label>
        <input
          id="review-name"
          className="input"
          name="name"
          required
          minLength={2}
          maxLength={60}
          autoComplete="given-name"
        />
      </div>

      <div className="field">
        <label htmlFor="review-comment">{t('yourComment', locale)}</label>
        <textarea
          id="review-comment"
          className="input review-form__comment"
          name="comment"
          required
          minLength={10}
          maxLength={1000}
          rows={4}
        />
      </div>

      <div className="review-form__footer">
        <button type="submit" className="btn-ink" disabled={pending}>
          {t('sendReview', locale)}
        </button>
        <p className="review-form__note">{t('reviewModeration', locale)}</p>
      </div>

      {message ? (
        <p className="review-form__error" role="alert">
          {message}
        </p>
      ) : null}
    </form>
  )
}
