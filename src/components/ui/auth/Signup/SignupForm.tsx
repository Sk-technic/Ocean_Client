import React, { useState } from "react";
import Input from "../../../Inputs/Input";
import { UploadProfile } from "../../../Inputs/UploadProfile";
import type { IsignupData } from "../../../../types";
import PrimaryButton from "../../../../components/Buttons/PrimaryButoon"; // ✅ import the new button
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import GoogleAuthButton from "../../../Buttons/GoogleAuthBtn";
import { useSignup } from "../../../../hooks/auth/authHooks";
import MetaButoon from "../../../Buttons/MetaButoon";
import LinkedinAuthBtn from "../../../Buttons/LinkedinAuthBtn";

const SignupForm: React.FC = () => {

  const [formData, setFormData] = useState<IsignupData>({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileChange = (file: File | null) => {
    setProfilePicFile(file);
  };

  const { mutateAsync: registerUser, isPending } = useSignup()


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
    registerUser(submitData, {
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
      }
    })
  };

  return (
    <main className={`animate-fadeIn border border-purple-500/30 theme-bg-card rounded-2xl p-2`}>
      <div className="flex w-fit items-center select-none">
        <img src="/Ocean_logo.png" alt="" className="w-5 h-5 " />
        <span className="text-xl font-mono">Ocean</span>
      </div>
      <div className="flex items-center font-bold text-md justify-center mb-3">
        Sign up 
      </div>
      <form onSubmit={handleSubmit} className="">

      <UploadProfile
        label="Profile Picture"
        name="profilePic"
        value={profilePicFile}
        onChange={handleProfileChange}
        className=""
      />
      <div className="grid grid-cols-2 p-2 gap-5 w-120">
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
      <div className="w-full flex flex-col items-center justify-center px-2">

        <PrimaryButton
          type="submit"
          label="Sign Up"
          loading={isPending}
          state="signup"
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
      <div className="w-full gap-2 p-2 flex flex-col mt-2 items-center justify-center">
        <h2 className="text-xs theme-text-muted">Signup using</h2>
        <div className="w-full  flex items-center justify-center gap-3">
          <MetaButoon />
          <GoogleAuthButton mode="signup" />
          <LinkedinAuthBtn />
        </div>
      </div>

      <p className="text-[10px] mb-2 text-gray-500 dark:text-gray-400 text-center mt-3">
        Already have an account?{" "}
        <Link
          to={"/"}
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Log in
        </Link>
      </p>
    </main>
  );
};

export default SignupForm;
