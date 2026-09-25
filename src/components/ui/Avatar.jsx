import clsx from "clsx";
import { toImageSrc } from "../../utils/image";

const SIZES = { sm: "h-8 w-8 text-[11px]", md: "h-10 w-10 text-[13px]", lg: "h-16 w-16 text-xl" };

const initialsOf = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "?";

const Avatar = ({ src, name, size = "md", className = "" }) => {
  const imgSrc = toImageSrc(src);
  return (
    <div
      className={clsx(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-sunken font-semibold text-ink-secondary",
        SIZES[size],
        className,
      )}
    >
      {imgSrc ? <img src={imgSrc} alt={name || "avatar"} className="h-full w-full object-cover" /> : initialsOf(name)}
    </div>
  );
};

export default Avatar;
