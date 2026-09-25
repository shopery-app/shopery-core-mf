import clsx from "clsx";
import { SpinnerIcon } from "./icons";

const VARIANTS = {
  primary: "bg-ink text-ink-inverse hover:bg-ink/90 border border-ink",
  secondary: "bg-surface text-ink border border-border hover:bg-surface-sunken",
  accent: "bg-accent text-white border border-accent hover:bg-accent-hover",
  ghost: "bg-transparent text-ink-secondary hover:bg-surface-sunken border border-transparent",
  danger: "bg-danger text-white border border-danger hover:opacity-90",
  outline: "bg-transparent text-ink border border-border-strong hover:bg-surface-sunken",
};

const SIZES = {
  sm: "h-8 px-3 text-[13px] gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-11 px-5 text-[15px] gap-2",
};

const Button = ({
  as: As = "button",
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  className = "",
  children,
  ...rest
}) => {
  return (
    <As
      disabled={disabled || loading}
      className={clsx(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors duration-150 focus-ring",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        VARIANTS[variant],
        SIZES[size],
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {loading && <SpinnerIcon size={size === "sm" ? 14 : 16} />}
      {children}
    </As>
  );
};

export default Button;
