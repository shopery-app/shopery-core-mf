const PageHeader = ({ eyebrow, title, description, actions }) => (
  <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      {eyebrow && <p className="mb-1.5 text-[12px] font-semibold uppercase tracking-wide text-ink-muted">{eyebrow}</p>}
      <h1 className="text-2xl font-semibold text-ink sm:text-[28px]">{title}</h1>
      {description && <p className="mt-1.5 max-w-2xl text-[14px] text-ink-secondary">{description}</p>}
    </div>
    {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
  </div>
);

export default PageHeader;
