import { Link } from "react-router-dom";
import PageShell from "../../components/layout/PageShell";
import Button from "../../components/ui/Button";

const NotFoundPage = () => (
  <PageShell>
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="text-[13px] font-semibold uppercase tracking-wide text-ink-muted">Error 404</p>
      <h1 className="mt-2 text-2xl font-semibold text-ink">Page not found</h1>
      <p className="mt-2 text-[14px] text-ink-secondary">
        The page you&apos;re looking for doesn&apos;t exist, was moved, or the URL is mistyped.
      </p>
      <div className="mt-6 flex gap-2">
        <Link to="/">
          <Button>Back to home</Button>
        </Link>
        <Link to="/products">
          <Button variant="outline">Browse products</Button>
        </Link>
      </div>
    </div>
  </PageShell>
);

export default NotFoundPage;
