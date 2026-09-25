import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Field, Input } from "../../components/ui/FormField";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import * as authApi from "../../api/auth";
import { parseJwt } from "../../utils/jwt";
import { isAdminAuthenticated } from "../../utils/auth";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAdminAuthenticated()) return <Navigate to="/admins/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await authApi.adminLogin(form);
      const decoded = parseJwt(data.accessToken);
      const authorities = decoded?.authorities || [];
      if (!authorities.includes("ADMIN")) {
        setError("Access denied. Admin privileges required.");
        return;
      }
      localStorage.setItem("adminAccessToken", data.accessToken);
      localStorage.setItem("adminRefreshToken", data.refreshToken);
      localStorage.setItem("adminUser", JSON.stringify({ email: decoded.sub, authorities }));
      navigate("/admins/dashboard", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Sign in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-md bg-ink text-sm font-bold text-ink-inverse">S</span>
          <h1 className="mt-3 text-[17px] font-semibold text-ink">Shopery Admin</h1>
          <Badge tone="neutral" className="mt-2">
            Restricted access
          </Badge>
        </div>

        <div className="rounded-lg border border-border bg-surface p-7 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="rounded-md border border-danger/20 bg-danger-subtle px-3.5 py-2.5 text-[13px] text-danger">{error}</p>}
            <Field label="Admin email" htmlFor="email">
              <Input id="email" type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="admin@shopery.com" />
            </Field>
            <Field label="Password" htmlFor="password">
              <Input id="password" type="password" required value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
            </Field>
            <Button type="submit" fullWidth loading={loading}>
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
