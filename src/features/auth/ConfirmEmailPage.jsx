import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import AuthLayout from "./AuthLayout";
import Button from "../../components/ui/Button";
import * as authApi from "../../api/auth";
import { setTokens } from "../../utils/tokenService";
import { fetchProfile } from "../../store/slices/authSlice";

const CODE_TTL = 300;

const ConfirmEmailPage = () => {
  const [code, setCode] = useState(Array(6).fill(""));
  const [timer, setTimer] = useState(CODE_TTL);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [email, setEmail] = useState("");
  const inputsRef = useRef([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const pendingEmail = localStorage.getItem("pendingMail");
    if (!pendingEmail) {
      navigate("/register");
      return;
    }
    setEmail(pendingEmail);
  }, [navigate]);

  useEffect(() => {
    if (timer <= 0) return;
    const t = setInterval(() => setTimer((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [timer]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const handleDigit = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    if (value.length === 6 && index === 0) {
      setCode(value.split("").slice(0, 6));
      inputsRef.current[5]?.focus();
      return;
    }
    const next = [...code];
    next[index] = value.slice(-1);
    setCode(next);
    if (value && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) inputsRef.current[index - 1]?.focus();
  };

  const handleVerify = async () => {
    const verificationCode = code.join("");
    if (verificationCode.length < 6) {
      setError("Enter the full 6-digit code.");
      return;
    }
    setVerifying(true);
    setError("");
    try {
      const data = await authApi.verifyAccount({ email, code: verificationCode });
      setTokens(data.accessToken, data.refreshToken);
      await dispatch(fetchProfile());
      localStorage.removeItem("pendingMail");
      localStorage.removeItem("pendingUserName");
      navigate("/", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid or expired code. Please try again.");
      setCode(Array(6).fill(""));
      inputsRef.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resending || resendCooldown > 0) return;
    setResending(true);
    setNotice("");
    try {
      await authApi.resendCode({ email });
      setNotice("A new code was sent to your email.");
      setTimer(CODE_TTL);
      setResendCooldown(60);
      setCode(Array(6).fill(""));
      inputsRef.current[0]?.focus();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not resend the code. Try again shortly.");
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout title="Verify your email" subtitle={email ? `Enter the 6-digit code sent to ${email}` : "Enter the 6-digit code sent to your email"}>
      <div className="space-y-5">
        {error && <p className="rounded-md border border-danger/20 bg-danger-subtle px-3.5 py-2.5 text-[13px] text-danger">{error}</p>}
        {notice && <p className="rounded-md border border-success/20 bg-success-subtle px-3.5 py-2.5 text-[13px] text-success">{notice}</p>}

        <div className="flex justify-center gap-2">
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              value={digit}
              onChange={(e) => handleDigit(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              inputMode="numeric"
              maxLength={1}
              className="h-12 w-11 rounded-md border border-border text-center text-lg font-semibold text-ink focus-ring focus:border-ink-secondary"
            />
          ))}
        </div>

        <p className="text-center text-[12.5px] text-ink-muted">
          {timer > 0 ? <>Code expires in <span className="font-medium text-ink">{formatTime(timer)}</span></> : "This code has expired."}
        </p>

        <Button fullWidth loading={verifying} disabled={code.some((d) => !d)} onClick={handleVerify}>
          Verify email
        </Button>

        <div className="text-center">
          <button
            onClick={handleResend}
            disabled={resending || resendCooldown > 0}
            className="text-[12.5px] font-medium text-ink-secondary hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            {resending ? "Sending…" : resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend code"}
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ConfirmEmailPage;
