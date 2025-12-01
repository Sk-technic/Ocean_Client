import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../../Inputs/Input";
import { UploadProfile } from "../../../Inputs/UploadProfile";
import { useMutation } from "@tanstack/react-query";
import { authAPI } from "../../../../api/services";
import type { IsignupData } from "../../../../types";
import PrimaryButton from "../../../../components/Buttons/PrimaryButoon"; // ✅ import the new button
import { useTheme } from "../../../../hooks/theme/usetheme";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
const SignupForm: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<IsignupData>({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
const {theme} = useTheme();
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileChange = (file: File | null) => {
    setProfilePicFile(file);
  };

  const signupMutation = useMutation({
    mutationFn: async (data: FormData) => await authAPI.signup(data),
    onSuccess: () => {

      setFormData({
        username: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
      });
      setProfilePicFile(null);

      navigate("/");
    },
    onError: (error:any) => {
      // console.log(error?.response?.data?.message);
      toast.error(error?.response?.data?.message)
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

  const { username, firstName, lastName, email, password } = formData;
  if (!username || !firstName || !lastName || !email || !password) {
    toast.error("Please fill all required fields.");
    return;
  }

  const submitData = new FormData();
  Object.entries(formData).forEach(([key, value]) => {
    if (value) submitData.append(key, value as string);
  });

  if (profilePicFile) submitData.append("profilePic", profilePicFile);
  signupMutation.mutate(submitData);
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
      <h2
        className="
          text-3xl font-semibold text-center 
          bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] 
          bg-clip-text text-transparent 
          tracking-tight drop-shadow-sm 
          p-1
        "
      >
        Create Account
      </h2>
      <p className="text-center text-sm mt-2 text-[var(--text-muted)]">
        Sign up to continue your journey with us
      </p>

            <UploadProfile
              label="Profile Picture"
              name="profilePic"
              value={profilePicFile}
              onChange={handleProfileChange}
              className="p-3"
            />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Input
          label="First Name"
          name="firstName"
          placeholder="John"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
          <Input
            label="Last Name"
            name="lastName"
            placeholder="Doe"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
        <Input
          label="Phone"
          name="phone"
          type="tel"
          placeholder="+91 9876543210"
          value={formData.phone ?? ""}
          onChange={handleChange}
        />
        <Input
          label="Username"
          name="username"
          placeholder="Enter your username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>


      {/* ✅ Reusable Primary Button with Loader */}
      <PrimaryButton
        type="submit"
        label="Sign Up"
        loading={signupMutation.isPending}
        state="signup"
      />

      <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-3">
        Already have an account?{" "}
        <Link
          to={"/"}
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Log in
        </Link>
      </p>
    </form>
  );
};

export default SignupForm;
