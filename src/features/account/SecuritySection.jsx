import { useState } from "react";
import Card from "../../components/ui/Card";
import { Field, Input } from "../../components/ui/FormField";
import Button from "../../components/ui/Button";
import * as userApi from "../../api/user";
import { setTokens } from "../../utils/tokenService";
import { useToast } from "../../components/ui/Toast";

const PASSWORD_PATTERN = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\S+$).{8,30}$/;

const PasswordCard = () => {
  const [form, setForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (!PASSWORD_PATTERN.test(form.newPassword)) {
      setError("Password needs 8-30 characters with an uppercase letter, lowercase letter, digit, and symbol.");
      return;
    }
    setLoading(true);
    try {
      const data = await userApi.updateMyPassword({ oldPassword: form.oldPassword, newPassword: form.newPassword });
      if (data?.accessToken) setTokens(data.accessToken, data.refreshToken);
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      showToast("Password updated.", "success");
    } catch (err) {
      setError(err?.response?.data?.message || "Could not update your password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h3 className="text-[13.5px] font-semibold text-ink">Password</h3>
      <p className="mt-1 text-[12.5px] text-ink-muted">Use a strong password you don&apos;t use elsewhere.</p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        {error && <p className="rounded-md border border-danger/20 bg-danger-subtle px-3.5 py-2.5 text-[13px] text-danger">{error}</p>}
        <Field label="Current password" htmlFor="oldPassword">
          <Input id="oldPassword" type="password" required value={form.oldPassword} onChange={(e) => setForm((f) => ({ ...f, oldPassword: e.target.value }))} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="New password" htmlFor="newPassword">
            <Input id="newPassword" type="password" required value={form.newPassword} onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))} />
          </Field>
          <Field label="Confirm new password" htmlFor="confirmPassword">
            <Input id="confirmPassword" type="password" required value={form.confirmPassword} onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))} />
          </Field>
        </div>
        <div className="flex justify-end">
          <Button type="submit" size="sm" loading={loading}>
            Update password
          </Button>
        </div>
      </form>
    </Card>
  );
};

const EmailCard = () => {
  const [step, setStep] = useState("idle"); // idle | requested
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { showToast } = useToast();

  const requestChange = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await userApi.changeMyEmail({ email });
      setStep("requested");
    } catch (err) {
      setError(err?.response?.data?.message || "Could not start the email change.");
    } finally {
      setLoading(false);
    }
  };

  const verify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await userApi.verifyMyEmail({ email, code });
      if (data?.accessToken) setTokens(data.accessToken, data.refreshToken);
      setStep("idle");
      setEmail("");
      setCode("");
      showToast("Email address updated.", "success");
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h3 className="text-[13.5px] font-semibold text-ink">Email address</h3>
      <p className="mt-1 text-[12.5px] text-ink-muted">Changing your email requires verifying the new address.</p>

      {error && <p className="mt-3 rounded-md border border-danger/20 bg-danger-subtle px-3.5 py-2.5 text-[13px] text-danger">{error}</p>}

      {step === "idle" ? (
        <form onSubmit={requestChange} className="mt-4 flex items-end gap-3">
          <div className="flex-1">
            <Field label="New email address" htmlFor="newEmail">
              <Input id="newEmail" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="new@example.com" />
            </Field>
          </div>
          <Button type="submit" size="sm" loading={loading}>
            Send code
          </Button>
        </form>
      ) : (
        <form onSubmit={verify} className="mt-4 flex items-end gap-3">
          <div className="flex-1">
            <Field label={`Enter the code sent to ${email}`} htmlFor="emailCode">
              <Input id="emailCode" required maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} placeholder="123456" />
            </Field>
          </div>
          <Button type="submit" size="sm" loading={loading}>
            Verify
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setStep("idle")}>
            Cancel
          </Button>
        </form>
      )}
    </Card>
  );
};

const SecuritySection = () => (
  <div className="space-y-6">
    <PasswordCard />
    <EmailCard />
  </div>
);

export default SecuritySection;
