import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { Field, Input, Checkbox } from "../../components/ui/FormField";
import Button from "../../components/ui/Button";
import { EyeIcon, EyeOffIcon } from "../../components/ui/icons";
import * as authApi from "../../api/auth";

const NAME_PATTERN = /^[A-Z][a-z]* [A-Z][a-z]*$/;
const PASSWORD_PATTERN = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_\-+=[\]{};:'",.<>?/\\|`~])(?=\S+$).{8,30}$/;

const strengthOf = (password) => {
  if (!password) return { score: 0, label: "" };
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  if (score <= 2) return { score, label: "Weak", tone: "bg-danger" };
  if (score <= 3) return { score, label: "Medium", tone: "bg-warning" };
  return { score, label: "Strong", tone: "bg-success" };
};

const RegisterPage = () => {
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirmPassword: "", terms: false });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const strength = useMemo(() => strengthOf(form.password), [form.password]);
  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!NAME_PATTERN.test(form.fullName.trim())) {
      setError("Enter your full name as \"Firstname Lastname\" (each part capitalized).");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!PASSWORD_PATTERN.test(form.password)) {
      setError("Password needs 8-30 characters with an uppercase letter, lowercase letter, digit, and symbol.");
      return;
    }

    setLoading(true);
    try {
      await authApi.register({ name: form.fullName.trim(), email: form.email, password: form.password });
      localStorage.setItem("pendingMail", form.email);
      localStorage.setItem("pendingUserName", form.fullName.trim());
      navigate("/confirm-email");
    } catch (err) {
      const data = err?.response?.data;
      if (data?.errors) setError(Object.values(data.errors).join(" "));
      else if (err?.response?.status === 409) setError("An account with this email already exists.");
      else setError(data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join Shopery to shop and sell in one place."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/signin" className="font-medium text-ink hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="rounded-md border border-danger/20 bg-danger-subtle px-3.5 py-2.5 text-[13px] text-danger">{error}</p>}

        <Field label="Full name" htmlFor="fullName" helper="e.g. Jahangir Alisoy">
          <Input id="fullName" required value={form.fullName} onChange={update("fullName")} placeholder="Firstname Lastname" disabled={loading} />
        </Field>

        <Field label="Email address" htmlFor="email">
          <Input id="email" type="email" required value={form.email} onChange={update("email")} placeholder="you@example.com" disabled={loading} />
        </Field>

        <Field label="Password" htmlFor="password">
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={form.password}
              onChange={update("password")}
              placeholder="Create a password"
              disabled={loading}
              className="pr-10"
            />
            <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-secondary">
              {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
            </button>
          </div>
          {form.password && (
            <div className="mt-2">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken">
                <div className={`h-full rounded-full transition-all ${strength.tone}`} style={{ width: `${(strength.score / 5) * 100}%` }} />
              </div>
              <p className="mt-1 text-xs text-ink-muted">{strength.label}</p>
            </div>
          )}
        </Field>

        <Field label="Confirm password" htmlFor="confirmPassword">
          <Input id="confirmPassword" type={showPassword ? "text" : "password"} required value={form.confirmPassword} onChange={update("confirmPassword")} placeholder="Repeat your password" disabled={loading} />
        </Field>

        <Checkbox
          label="I agree to the Terms of Service and Privacy Policy"
          checked={form.terms}
          onChange={(e) => setForm((f) => ({ ...f, terms: e.target.checked }))}
          required
        />

        <Button type="submit" fullWidth loading={loading}>
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
