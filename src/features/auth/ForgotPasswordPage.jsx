import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { Field, Input } from "../../components/ui/FormField";
import Button from "../../components/ui/Button";
import * as authApi from "../../api/auth";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      setSent(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not send the reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout title="Check your email" subtitle={`We sent a password reset link to ${email}.`}>
        <p className="text-[13px] text-ink-secondary">The link expires in 15 minutes. Check your spam folder if you don&apos;t see it.</p>
        <Link to="/signin">
          <Button fullWidth className="mt-5">
            Back to sign in
          </Button>
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset link."
      footer={
        <>
          Remembered it?{" "}
          <Link to="/signin" className="font-medium text-ink hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="rounded-md border border-danger/20 bg-danger-subtle px-3.5 py-2.5 text-[13px] text-danger">{error}</p>}
        <Field label="Email address" htmlFor="email">
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" disabled={loading} />
        </Field>
        <Button type="submit" fullWidth loading={loading}>
          Send reset link
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
