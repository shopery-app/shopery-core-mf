import { Link } from "react-router-dom";
import Avatar from "../../components/ui/Avatar";
import { HeartIcon, ImageIcon } from "../../components/ui/icons";
import { toImageSrc } from "../../utils/image";
import { formatDate } from "../../utils/format";

const BlogCard = ({ blog, liked, onToggleLike }) => {
  const imageUrl = toImageSrc(blog.image);
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface transition-shadow hover:shadow-card">
      <Link to={`/blogs/${blog.id}`} state={{ blog }} className="aspect-[16/10] bg-surface-sunken">
        {imageUrl ? (
          <img src={imageUrl} alt={blog.blogTitle} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-muted">
            <ImageIcon size={26} />
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <Link to={`/blogs/${blog.id}`} state={{ blog }} className="line-clamp-2 text-[14.5px] font-semibold text-ink hover:underline">
          {blog.blogTitle}
        </Link>
        <p className="line-clamp-2 text-[13px] text-ink-secondary">{blog.content}</p>
        <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
          <div className="flex items-center gap-2">
            <Avatar src={blog.author?.profilePhoto} name={blog.author?.name} size="sm" />
            <div>
              <p className="text-[12px] font-medium text-ink">{blog.author?.name}</p>
              <p className="text-[11px] text-ink-muted">{formatDate(blog.createdAt)}</p>
            </div>
          </div>
          {onToggleLike && (
            <button onClick={() => onToggleLike(blog.id)} className="flex items-center gap-1 text-[12px] text-ink-secondary hover:text-danger">
              <HeartIcon size={14} filled={liked} className={liked ? "text-danger" : ""} />
              {blog.likeCount ?? 0}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
