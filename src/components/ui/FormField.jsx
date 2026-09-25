import clsx from "clsx";

const fieldBase =
  "w-full rounded-md border border-border bg-surface px-3.5 text-[14px] text-ink placeholder:text-ink-muted transition-colors duration-150 focus-ring focus:border-ink-secondary disabled:bg-surface-sunken disabled:text-ink-muted";

export const Label = ({ htmlFor, children, required, className = "" }) => (
  <label htmlFor={htmlFor} className={clsx("mb-1.5 block text-[13px] font-medium text-ink-secondary", className)}>
    {children}
    {required && <span className="text-danger"> *</span>}
  </label>
);

export const HelperText = ({ error, children }) =>
  children ? (
    <p className={clsx("mt-1.5 text-xs", error ? "text-danger" : "text-ink-muted")}>{children}</p>
  ) : null;

export const Input = ({ error, className = "", ...rest }) => (
  <input
    className={clsx(fieldBase, "h-10", error && "border-danger focus:border-danger", className)}
    {...rest}
  />
);

export const Textarea = ({ error, className = "", rows = 4, ...rest }) => (
  <textarea
    rows={rows}
    className={clsx(fieldBase, "py-2.5 resize-y", error && "border-danger focus:border-danger", className)}
    {...rest}
  />
);

export const Select = ({ error, className = "", children, ...rest }) => (
  <select
    className={clsx(fieldBase, "h-10 appearance-none bg-no-repeat pr-9", error && "border-danger", className)}
    style={{
      backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2355534c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
      backgroundPosition: "right 10px center",
    }}
    {...rest}
  >
    {children}
  </select>
);

export const Field = ({ label, htmlFor, required, error, helper, children }) => (
  <div>
    {label && (
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
    )}
    {children}
    <HelperText error={!!error}>{error || helper}</HelperText>
  </div>
);

export const Checkbox = ({ label, className = "", ...rest }) => (
  <label className={clsx("inline-flex items-center gap-2 text-[13px] text-ink-secondary cursor-pointer", className)}>
    <input type="checkbox" className="h-4 w-4 rounded border-border-strong text-ink accent-ink" {...rest} />
    {label}
  </label>
);
