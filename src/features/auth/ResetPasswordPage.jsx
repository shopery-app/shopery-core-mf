import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { Field, Input } from "../../components/ui/FormField";
import Button from "../../components/ui/Button";
import * as authApi from "../../api/auth";

const PASSWORD_PATTERN = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\S+$).{8,30}$/;

const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = useMemo(() => new URLSearchParams(location.search).get("token"), [location.search]);

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(token ? "" : "This reset link is invalid. Request a new one.");

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => navigate("/signin"), 2500);
    return () => clearTimeout(t);
  }, [success, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    if (!PASSWORD_PATTERN.test(password)) {
      setError("Password needs 8-30 characters with an uppercase letter, lowercase letter, digit, and symbol.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await authApi.resetPassword({ token, password });
      setSuccess(true);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 404) setError("This reset link has expired. Request a new one.");
      else setError(err?.response?.data?.message || "Could not reset your password.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout title="Password updated" subtitle="You can now sign in with your new password.">
        <p className="text-[13px] text-ink-secondary">Redirecting to sign in…</p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create a new password"
      footer={
        <>
          <Link to="/signin" className="font-medium text-ink hover:underline">
            Back to sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="rounded-md border border-danger/20 bg-danger-subtle px-3.5 py-2.5 text-[13px] text-danger">{error}</p>}
        <Field label="New password" htmlFor="password">
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter a new password"
            disabled={loading || !token}
          />
        </Field>
        <Button type="submit" fullWidth loading={loading} disabled={!token}>
          Update password
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
