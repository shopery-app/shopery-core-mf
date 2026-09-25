import clsx from "clsx";

const Tabs = ({ items, value, onChange, className = "" }) => (
  <div className={clsx("flex items-center gap-1 border-b border-border", className)}>
    {items.map((item) => (
      <button
        key={item.value}
        onClick={() => onChange(item.value)}
        className={clsx(
          "relative flex items-center gap-1.5 px-3.5 py-2.5 text-[13.5px] font-medium transition-colors",
          value === item.value ? "text-ink" : "text-ink-muted hover:text-ink-secondary",
        )}
      >
        {item.icon && <item.icon size={15} />}
        {item.label}
        {value === item.value && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-ink" />}
      </button>
    ))}
  </div>
);

export default Tabs;
