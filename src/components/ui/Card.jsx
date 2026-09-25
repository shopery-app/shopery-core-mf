import clsx from "clsx";

const Card = ({ as: As = "div", padding = "md", interactive = false, className = "", children, ...rest }) => (
  <As
    className={clsx(
      "rounded-lg border border-border bg-surface",
      padding === "md" && "p-5",
      padding === "lg" && "p-7",
      padding === "sm" && "p-3.5",
      padding === "none" && "",
      interactive && "transition-shadow duration-150 hover:shadow-card",
      className,
    )}
    {...rest}
  >
    {children}
  </As>
);

export default Card;
