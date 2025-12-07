import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import Input from "../../../Inputs/Input";
import PrimaryButton from "../../../Buttons/PrimaryButoon";
import type { ILogin } from "../../../../types";
import { useTheme } from "../../../../hooks/theme/usetheme";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { useLogin } from "../../../../hooks/auth/authHooks";
import GoogleAuthButton from "../../../Buttons/GoogleAuthBtn";
import MetaButoon from "../../../Buttons/MetaButoon";
import LinkedinAuthBtn from "../../../Buttons/LinkedinAuthBtn";
const LoginForm: React.FC = () => {
  const [credentials, setCredentials] = useState({
    identifier: "",
    password: "",
  });


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };
  const { mutate: login, isPending } = useLogin()
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

    <main className={`w-80 animate-fadeIn border border-purple-500/30 shadow-md theme-bg-card  rounded-xl p-2`}>
      <div className="flex w-fit  items-center select-none">
        <img src="/Ocean_logo.png" alt="" className="w-5 h-5 " />
        <span className="text-xl font-mono">Ocean</span>
      </div>
      <div className="flex items-center font-bold text-md justify-center mt-3">
        Login
      </div>
    <form onSubmit={handleSubmit}  action="/dashboard">
      
      {/* Inputs */}
      <div className="flex flex-col gap-5 mt-3">
        <Input
          label="Username or Email"
          name="identifier"
          placeholder="Enter your username or email"
          value={credentials.identifier}
          onChange={handleChange}
          required
        />
        <div className="relative">
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={credentials.password}
            onChange={handleChange}
            required
          />
          <span className="absolute hover:cursor-pointer text-[9px] bottom-0 right-0 text-sky-500 underline">forget password ?</span>
        </div>
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
          </form>

      {/* Divider */}
      <div className="flex items-center gap-3 mx-2 my-3">
        <span className="h-px flex-1 bg-gray-300 dark:bg-gray-400"></span>
        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest">
          or
        </span>
        <span className="h-px flex-1 bg-gray-300 dark:bg-gray-400"></span>
      </div>

      {/* Google Sign-in */}
      <div className="w-full gap-2 p-2 flex flex-col mt-2 items-center justify-center">
        <h2 className="text-xs theme-text-muted">Login using</h2>
        <div className="w-full  flex items-center justify-center gap-3">
          <MetaButoon />
          <GoogleAuthButton mode="login" />
          <LinkedinAuthBtn />
        </div>
      </div>

      {/* Footer */}
      <p className="text-[10px] text-center text-gray-500 dark:text-gray-400 mt-6">
        Don’t have an account?{" "}
        <Link
          to={"/signup"}
          className="font-medium text-indigo-500 dark:text-indigo-400 hover:underline"
        >
          Sign up
        </Link>
      </p>
    </main>
  );
};

export default LoginForm;
