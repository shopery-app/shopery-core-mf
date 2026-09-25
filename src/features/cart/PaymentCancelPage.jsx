import { Link } from "react-router-dom";
import PageShell from "../../components/layout/PageShell";
import Button from "../../components/ui/Button";
import { XCircleIcon } from "../../components/ui/icons";

const PaymentCancelPage = () => (
  <PageShell>
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-danger-subtle text-danger">
        <XCircleIcon size={28} />
      </div>
      <h1 className="text-2xl font-semibold text-ink">Payment cancelled</h1>
      <p className="mt-2 text-[14px] text-ink-secondary">Your payment was not completed. Your cart is still saved.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link to="/products">
          <Button variant="outline">Continue shopping</Button>
        </Link>
        <Link to="/cart">
          <Button>Back to cart</Button>
        </Link>
      </div>
    </div>
  </PageShell>
);

export default PaymentCancelPage;
