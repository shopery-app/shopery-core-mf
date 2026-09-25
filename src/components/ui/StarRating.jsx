import { StarIcon } from "./icons";

const StarRating = ({ value = 0, size = 14, onChange }) => {
  const interactive = typeof onChange === "function";
  return (
    <div className="flex items-center gap-0.5 text-warning">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(n)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
          aria-label={`${n} star`}
        >
          <StarIcon size={size} filled={n <= Math.round(value)} />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
