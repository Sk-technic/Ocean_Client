import React, { useState } from "react";
import Input from "../../../Inputs/Input";
import PrimaryButton from "../../../Buttons/PrimaryButoon";
import type { ILogin } from "../../../../types";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { useLogin, authHooks, useOTPVerify, useResetPassword, autoLogin } from "../../../../hooks/auth/authHooks";
import GoogleAuthButton from "../../../Buttons/GoogleAuthBtn";
import Loader from "../../../Loader/Loader";
import { useTheme } from "../../../../hooks/theme/usetheme";

type StepType = "login" | "forgot" | "otp" | "reset";

const LoginForm: React.FC = () => {
  const [step, setStep] = useState<StepType>("login");

  const [credentials, setCredentials] = useState({
    identifier: "",
    password: "",
  });

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [shake, setShake] = useState<string | null>(null);

  const { mutate: login, isPending } = useLogin();
  const { mutateAsync: sendOtp, isPending: sendOtpPending } = authHooks.useSendVerificationMail();
  const { mutateAsync: verifyOTP, isPending: verifyPending } = useOTPVerify();
  const { mutateAsync: resetPassword, isPending: resetPending } = useResetPassword();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const submitLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const { identifier, password } = credentials;
    if (!identifier || !password) {
      setShake("login");
      setTimeout(() => setShake(null), 400);
      return toast.error("Please fill all required fields.");
    }

    const isEmail = identifier.includes("@");
    const payload: ILogin = {
      username: isEmail ? "" : identifier,
      email: isEmail ? identifier : "",
      password,
    };

    login(payload);
  };

  const submitForgot = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setShake("email");
      setTimeout(() => setShake(null), 400);
      return;
    }

    sendOtp(email, {
      onSuccess: (data: any) => {
        const id = data?.data?.data?._id
        localStorage.setItem("id", id)
        toast.success("OTP sent successfully");
        setStep("otp");
        setEmail('')
      },
      onError: (err: any) => toast.error(err.response?.data?.message),
    });
  };

  const submitOTP = (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp.trim()) {
      setShake("otp");
      setTimeout(() => setShake(null), 400);
      return;
    }

    const id = localStorage.getItem("id")
    verifyOTP(
      { otp, userId: id! },
      {
        onSuccess: () => {
          toast.success("OTP verified");
          setStep("reset");
          setOtp('')
        },
        onError: (err: any) => toast.error(err.response?.data?.message),
      }
    );
  };

  const { mutateAsync: AutoLogin, isPending: autoLoginPending } = autoLogin()
  const submitReset = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPass.trim()) {
      setShake("newpass");
      setTimeout(() => setShake(null), 400);
      return;
    }

    if (newPass !== confirmPass) {
      setShake("confirm");
      setTimeout(() => setShake(null), 400);
      return toast.error("Passwords do not match");
    }
    const id = localStorage.getItem('id')
    resetPassword(
      { newpassword: newPass, userId: id! },
      {
        onSuccess: () => {
          toast.success("Password reset successfully");
          AutoLogin(id!,{
            onSuccess:()=>{
              localStorage.removeItem('id')
            }
          })
        },
        onError: (err: any) => toast.error(err.response?.data?.message),
      }
    );
  };

  const {theme} = useTheme()
  return (

     <main className={`w-full max-w-100 animate-fadeIn border theme-border shadow-md rounded-xl p-2 ${theme=="dark"?'bg-black/70':'bg-stone-200'}`}> 
      <div className="flex w-fit items-center select-none theme-text-primary">
        <img src="/Ocean_logo.png" alt="" className="w-5 h-5" />
        <span className="text-xl theme-text-primary font-mono">Ocean</span>
      </div>

      {/* -------- LOGIN STEP -------- */}
      {step === "login" && (
        <>
          <div className="flex items-center font-bold text-md justify-center  mt-3">Login</div>

          <form onSubmit={submitLogin} className="relative">
            <div className="flex flex-col gap-5 mt-3">
              <Input
                label="Username or Email"
                name="identifier"
                value={credentials.identifier}
                onChange={handleChange}
                placeholder="Enter your username or email"
                className={shake === "login" ? "shake-once" : ""}
              />

              <Input
                label="Password"
                name="password"
                type="password"
                value={credentials.password}
                onChange={handleChange}
                placeholder="● ● ● ● ● ● ● ●"
              />
            </div>

            <div className="mt-4 flex flex-col items-center justify-center">
              <div className="w-full flex">
                <span
                  className="text-[9px] text-sky-500 cursor-pointer"
                  onClick={() => setStep("forgot")}
                >
                  Forget password ?
                </span>
              </div>

              <PrimaryButton
                type="submit"
                label="Login"
                state="Logging"
                fullWidth={false}
                width="fit py-2 px-20"
                />
                {isPending && <Loader fullScreen message="logging.."/>}
            </div>
          </form>
        </>
      )}

      {/* -------- FORGOT EMAIL STEP -------- */}
      {step === "forgot" && (
        <form onSubmit={submitForgot} className="space-y-4 mt-3">
          <h2 className="text-center font-semibold">Forgot Password</h2>

          <Input
            label="Enter your email"
            name="email"
            type="email"
            placeholder="jhondoe@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={shake === "email" ? "shake-once" : ""}
          />

          <div className="w-full flex items-center justify-center">

            <PrimaryButton
              type="submit"
              label="Send OTP"
              fullWidth={false}
            />
          </div>

          <button
            type="button"
            className="text-[10px] text-blue-400"
            onClick={() => setStep("login")}
          >
            Back to Login
          {sendOtpPending && <Loader fullScreen message="verify email.." />}
          </button>

        </form>
      )}

      {/* -------- OTP STEP -------- */}
      {step === "otp" && (
        <form onSubmit={submitOTP} className="space-y-4 mt-3">
          <h2 className="text-center font-semibold">Verify OTP</h2>

          <Input
            label="Enter OTP"
            name="otp"
            value={otp}
            placeholder="● ● ● ● ● ●"
            onChange={(e) => {if(e.target.value?.length<7)setOtp(e.target.value)}}
            className={shake === "otp" ? "shake-once" : ""}
          />
          <div className="w-full flex items-center justify-center">

            <PrimaryButton
              type="submit"
              label="Verify OTP"
              fullWidth={false}

            />
          </div>
          <button
            type="button"
            className="text-[10px] text-blue-400"
            onClick={() => setStep("forgot")}
          >
            Back
          </button>
        </form>
      )}

      {/* -------- RESET PASSWORD STEP -------- */}
      {step === "reset" && (
        <form onSubmit={submitReset} className="space-y-4 mt-3">
          <h2 className="text-center font-semibold">Reset Password</h2>

          <Input
            label="New Password"
            name="newpass"
            type="password"
            placeholder="● ● ● ● ● ● ● ●"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            className={shake === "newpass" ? "shake-once" : ""}
          />

          <Input
            label="Confirm Password"
            name="confirm"
            type="password"
            value={confirmPass}
            placeholder="● ● ● ● ● ● ● ●"
            onChange={(e) => setConfirmPass(e.target.value)}
            className={shake === "confirm" ? "shake-once" : ""}
          />

          <PrimaryButton
            type="submit"
            label="Reset Password"
            loading={resetPending}
          />

          <button
            type="button"
            className="text-[10px] text-blue-400"
            onClick={() => setStep("otp")}
          >
            Back
          </button>

          {(resetPending || autoLoginPending) && <Loader fullScreen message={`${resetPending && "updating password.." || autoLoginPending && "login to your profile..."}`} />}
        </form>
      )}

      {/* GOOGLE LOGIN + FOOTER */}
      {step === "login" && (
        <>
          <div className="flex items-center gap-3 mx-2 my-3">
            <span className="h-px flex-1 bg-gray-300"></span>
            <span className="text-xs text-gray-500 uppercase tracking-widest">or</span>
            <span className="h-px flex-1 bg-gray-300"></span>
          </div>

          <div className="w-full flex flex-col items-center justify-center">
            <GoogleAuthButton mode="login" />
          </div>

          <p className="text-[10px] text-center text-gray-500 mt-6">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-indigo-500 hover:underline">
              Sign up
            </Link>
          </p>
        </>
      )}
    </main>
  );
};

export default LoginForm;
