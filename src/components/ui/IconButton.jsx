import clsx from "clsx";

const SIZES = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-11 w-11",
};

const IconButton = ({ as: As = "button", size = "md", variant = "outline", className = "", children, ...rest }) => (
  <As
    className={clsx(
      "relative inline-flex items-center justify-center rounded-md border transition-colors duration-150 focus-ring",
      variant === "outline" && "border-border bg-surface text-ink hover:bg-surface-sunken",
      variant === "ghost" && "border-transparent text-ink-secondary hover:bg-surface-sunken",
      variant === "dark" && "border-ink bg-ink text-ink-inverse hover:bg-ink/90",
      SIZES[size],
      className,
    )}
    {...rest}
  >
    {children}
  </As>
);

export default IconButton;
