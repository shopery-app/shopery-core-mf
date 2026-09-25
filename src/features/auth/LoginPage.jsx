import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import AuthLayout from "./AuthLayout";
import { Field, Input } from "../../components/ui/FormField";
import Button from "../../components/ui/Button";
import { EyeIcon, EyeOffIcon } from "../../components/ui/icons";
import * as authApi from "../../api/auth";
import { setTokens } from "../../utils/tokenService";
import { fetchProfile } from "../../store/slices/authSlice";

const errorFor = (err) => {
  const status = err?.response?.status;
  const message = err?.response?.data?.message;
  if (status === 401) return "Invalid email or password.";
  if (status === 403) return "Please verify your email before signing in.";
  if (status === 404) return "Account not found. Check your email or register.";
  return message || "Sign in failed. Please try again.";
};

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await authApi.login(form);
      setTokens(data.accessToken, data.refreshToken);
      await dispatch(fetchProfile());
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (err) {
      setError(errorFor(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue to your account."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-medium text-ink hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="rounded-md border border-danger/20 bg-danger-subtle px-3.5 py-2.5 text-[13px] text-danger">{error}</p>}

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
              placeholder="Enter your password"
              disabled={loading}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-secondary"
            >
              {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
            </button>
          </div>
        </Field>

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-[12.5px] font-medium text-ink-secondary hover:text-ink">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" fullWidth loading={loading}>
          Sign in
        </Button>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
