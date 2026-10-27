/** Title and short introduction at the top of a page. */
export function PageHeader({
  eyebrow,
  title,
  intro,
}: {
  eyebrow?: string | null
  title: string
  intro?: string | null
}) {
  return (
    <header className="container page-header">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h1 className="page-header__title">{title}</h1>
      {intro ? <p className="page-header__intro">{intro}</p> : null}
    </header>
  )
}
