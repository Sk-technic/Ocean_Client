import React, { useState } from "react";
import { useTheme } from "../../hooks/theme/usetheme";
import Input from "../Inputs/Input";
import PrimaryButton from "../Buttons/PrimaryButoon";
import TextArea from "../Inputs/Textarea";
import SocialLinksInput from "../Inputs/SocialLinksInput";
import type { IEditProfile, User } from "../../types";
import { userHooks } from "../../hooks";
import { toast } from "react-toastify";

interface EditProfileFormProps {
  onClose?: () => void;
  user: User | null;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({ onClose, user }) => {
  const [formData, setFormData] = useState<IEditProfile>({
    username: user?.username || "",
    firstName: user?.fullName ? user.fullName.split(" ")[0] : "",
    lastName: user?.fullName ? user.fullName.split(" ")[1] || "" : "",
    bio: user?.bio || "",
    phone: user?.phone || null,
    socialLinks: user?.socialLinks,
  });

  const [errors, setErrors] = useState<{ bio?: string; phone?: string }>({});
  const { theme } = useTheme();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors: { bio?: string; phone?: string } = {};

    if (formData.bio) {
      const wordCount = formData.bio.trim().split(/\s+/).length;
      if (wordCount > 150) newErrors.bio = "Bio cannot exceed 150 words.";
    }

    if (formData.phone) {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone =
          "Phone number must include country code and valid digits. Example: +919876543210";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const {mutate: updateProfile} = userHooks.useUpdateProfile();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    updateProfile(formData, {
      onSuccess: () => {
        if (onClose) onClose();
      },
    });

  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`w-full max-w-4xl mx-auto p-6 rounded-2xl
        backdrop-blur-md shadow-lg transition-all duration-500
        ${
          theme === "dark"
            ? "bg-[var(--bg-card)]/80 border-[var(--border-primary)] shadow-[0_0_20px_rgba(147,51,234,0.15)]"
            : "bg-white border border-gray-200 shadow-md"
        }`}
    >
      {/* Profile Info */}
      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-4 border-b border-[var(--border-primary)] pb-2">
          Profile Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Username"
            name="username"
            placeholder="Enter your username"
            value={formData.username || ""}
            onChange={handleChange}
          />
          <Input
            label="First Name"
            name="firstName"
            placeholder="John"
            value={formData.firstName || ""}
            onChange={handleChange}
          />
          <Input
            label="Last Name"
            name="lastName"
            placeholder="Doe"
            value={formData.lastName || ""}
            onChange={handleChange}
          />
          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            placeholder="+919876543210"
            value={formData.phone ?? ""}
            onChange={handleChange}
          />
          {errors.phone && (
            <p className="text-xs text-red-500 md:col-span-2">{errors.phone}</p>
          )}
          <TextArea
            label="Bio"
            name="bio"
            placeholder="Tell us about yourself..."
            value={formData.bio || ""}
            onChange={handleChange}
            rows={4}
            maxLength={150}
            className="md:col-span-2"
          />
          {errors.bio && (
            <p className="text-xs text-red-500 md:col-span-2">{errors.bio}</p>
          )}
        </div>
      </section>

      {/* Social Links */}
      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-4 border-b border-[var(--border-primary)] pb-2">
          Social Links
        </h3>
        <SocialLinksInput
          value={formData.socialLinks || {}}
          onChange={(updated) =>
            setFormData((prev) => ({ ...prev, socialLinks: updated }))
          }
        />
      </section>

      {/* Submit Button */}
      <div className="flex justify-center mt-6">
        <PrimaryButton type="submit" label="Update Profile" state="update" />
      </div>

      {/* Back Button */}
      <p className="text-sm text-center mt-4">
        <button
          type="button"
          onClick={onClose}
          className="text-[var(--accent-primary)] hover:underline transition"
        >
          ← Back to Profile
        </button>
      </p>
    </form>
  );
};

export default EditProfileForm;
