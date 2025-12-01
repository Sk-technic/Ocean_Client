import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import Input from "../../../Inputs/Input";
import PrimaryButton from "../../../Buttons/PrimaryButoon";
import type { ILogin } from "../../../../types";
import { useTheme } from "../../../../hooks/theme/usetheme";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { useLogin } from "../../../../hooks/auth/authHooks";
const LoginForm: React.FC = () => {
  const [credentials, setCredentials] = useState({
    identifier: "",
    password: "",
  });

  const { theme } = useTheme();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };
  const {mutate:login,isPending} = useLogin()
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const { identifier, password } = credentials;
    if (!identifier || !password) {
      toast.error("Please fill all required fields.");
      return;
    }
    
    const isEmail = identifier.includes("@");
    const payload: ILogin = {
      username: isEmail ? "" : identifier,
      email: isEmail ? identifier : "",
      password,
    };    
     login(payload)
   
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`
        relative overflow-hidden max-w-md w-full mx-auto
        px-8 py-10 rounded-xl backdrop-blur-2xl
        transition-all duration-700 ease-[cubic-bezier(0.77,0,0.175,1)]
        border border-transparent bg-clip-padding
        ${
          theme === "dark"
            ? "bg-[rgba(30,20,55,0.55)] border-[rgba(168,85,247,0.25)] shadow-[0_0_10px_rgba(147,51,234,0.15)]"
            : "bg-white/60 border-[rgba(0,0,0,0.05)] shadow-xl"
        }
      `}
    >
      {/* ✨ Static gradient depth layer */}
      <div
        className={`
          absolute inset-0 -z-10 rounded-xl transition-all duration-700
          ${
            theme === "dark"
              ? "bg-gradient-to-br from-[#241a36]/80 via-[#1b1230]/40 to-transparent"
              : "bg-gradient-to-br from-white/80 via-white/50 to-transparent"
          }
        `}
      />

      {/* 💎 Subtle glass shine */}
      <div
        className={`
          absolute inset-0 -z-5 rounded-xl opacity-70 pointer-events-none
          ${
            theme === "dark"
              ? "bg-[radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.08),transparent_70%)]"
              : "bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.25),transparent_70%)]"
          }
        `}
      />

      {/* Title */}
      <h2
        className="
          text-3xl font-semibold text-center 
          bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] 
          bg-clip-text text-transparent 
          tracking-tight drop-shadow-sm 
          p-1
        "
      >
        Login
      </h2>
      <p className="text-center text-sm mt-2 text-[var(--text-muted)]">
        Sign in to continue your journey with us
      </p>

      {/* Inputs */}
      <div className="flex flex-col gap-5 mt-6">
        <Input
          label="Username or Email"
          name="identifier"
          placeholder="Enter your username or email"
          value={credentials.identifier}
          onChange={handleChange}
          required
        />
        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="••••••••"
          value={credentials.password}
          onChange={handleChange}
          required
        />
      </div>

      {/* Login Button */}
      <div className="mt-4">
        <PrimaryButton
          type="submit"
          label="Login"
          loading={isPending}
          state="Loggin"
        />
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 my-4">
        <span className="h-px flex-1 bg-gray-300 dark:bg-zinc-700"></span>
        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest">
          or
        </span>
        <span className="h-px flex-1 bg-gray-300 dark:bg-zinc-700"></span>
      </div>

      {/* Google Sign-in */}
      <button
        type="button"
        onClick={() => console.log("Google Sign-In Clicked")}
        className={`
          w-full flex items-center justify-center gap-3 py-3 px-5
          font-medium tracking-wide text-[var(--text-primary)]
          bg-[var(--bg-secondary)] border border-[var(--border-secondary)]
          rounded-md shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]
          hover:bg-[var(--accent-secondary-hover)] hover:text-[var(--accent-primary)]
          active:scale-[0.98]
          transition-all duration-300 ease-[cubic-bezier(0.77,0,0.175,1)]
          backdrop-blur-sm
        `}
      >
        <FcGoogle size={22} />
        <span>Continue with Google</span>
      </button>

      {/* Footer */}
      <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-6">
        Don’t have an account?{" "}
        <Link
          to={"/signup"}
          className="font-medium text-indigo-500 dark:text-indigo-400 hover:underline"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;
