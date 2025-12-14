import React, { useState } from "react";
import { createPortal } from "react-dom";
import InputField from "../../../components/Inputs/Input";
import { checkPasswordStrength } from "../../../utils/checkPasswordStrength";
import { z } from "zod";
import {
    authHooks,
    useChangePassword,
    useOTPVerify,
    useResetPassword,
} from "../../../hooks/auth/authHooks";
import { toast } from "react-hot-toast";
import Loader from "../../../components/Loader/Loader";
import { useAppSelector } from "../../../store/hooks";
import { useTheme } from "../../../hooks/theme/usetheme";
import PrimaryButton from "../../../components/Buttons/PrimaryButoon";

const oldPasswordSchema = z.string().min(8, "Old password must be 8+ characters");
const newPasswordSchema = z.string().min(8, "Minimum 8 characters required");
const confirmPasswordSchema = z.string().min(8, "Minimum 8 characters required");

type StepType = "change" | "forgot" | "otp" | "new";

interface ErrorState {
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
}

type ShakeFieldType =
    | "oldPassword"
    | "newPassword"
    | "confirmPassword"
    | "email"
    | "otp"
    | null;

const ChangePasswordFlow: React.FC<{ onClose: () => void, state?: StepType }> = ({ onClose, state }) => {

    const [step, setStep] = useState<StepType>(state ?? "change");

    const [formdata, setFormData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [passwordStrength, setPasswordStrength] = useState("weak");
    const [shakeField, setShakeField] = useState<ShakeFieldType>(null);

    const { user: loggedInUser } = useAppSelector((state) => state.auth);

    const [errors, setErrors] = useState<ErrorState>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target as HTMLInputElement;
        let errorMsg = "";

        if (name === "confirmPassword") {
            const validNew = newPasswordSchema.safeParse(formdata.newPassword).success;
            if (!validNew) {
                setShakeField("newPassword");
                setTimeout(() => setShakeField(null), 400);
                return;
            }
        }

        if (step === "change") {
            if (name === "newPassword") {
                const valid = oldPasswordSchema.safeParse(formdata.oldPassword).success;
                if (!valid) {
                    setShakeField("oldPassword");
                    setTimeout(() => setShakeField(null), 400);
                    return;
                }
            }

            if (name === "confirmPassword") {
                const valid = newPasswordSchema.safeParse(formdata.newPassword).success;
                if (!valid) {
                    setShakeField("newPassword");
                    setTimeout(() => setShakeField(null), 400);
                    return;
                }
            }
        }

        if (name === "oldPassword") {
            if (value.length <= 6) {
                setErrors((p) => ({ ...p, oldPassword: "" }));
                setFormData((p) => ({ ...p, oldPassword: value }));
                return;
            }
            if (value.length === 7) {
                setErrors((p) => ({ ...p, oldPassword: "Old password must be 8+ chars" }));
                setFormData((p) => ({ ...p, oldPassword: value }));
                return;
            }

            const result = oldPasswordSchema.safeParse(value);
            const msg = result.success ? "" : result.error.issues[0].message;

            setErrors((p) => ({ ...p, oldPassword: msg }));
            setFormData((p) => ({ ...p, oldPassword: value }));
            return;
        }

        if (name === "newPassword") {
            const result = newPasswordSchema.safeParse(value);
            if (!result.success) errorMsg = result.error.issues[0].message;
            setErrors((p) => ({ ...p, newPassword: errorMsg }));

            const level = checkPasswordStrength(value);
            setPasswordStrength(level);
        }

        if (name === "confirmPassword") {
            const result = confirmPasswordSchema.safeParse(value);
            if (!result.success) errorMsg = result.error.issues[0].message;

            if (value !== formdata.newPassword && value.length >= 8) {
                errorMsg = "Passwords do not match";
            }

            setErrors((p) => ({ ...p, confirmPassword: errorMsg }));
        }

        setFormData((p) => ({ ...p, [name]: value }));
    };


    const getmessage = () => {
        switch (passwordStrength) {
            case "weak":
                return "you given password is week";
            case "medium":
                return "you password strenth is normal";
            case "strong":
                return "your password is strong";
            default:
                return "";
        }
    };

    const getcolor = () => {
        switch (passwordStrength) {
            case "weak":
                return "text-red-500";
            case "medium":
                return "text-yellow-300";
            case "strong":
                return "text-lime-400";
            default:
                return "";
        }
    };

    const { mutateAsync: changePassword, isPending: updatePending } = useChangePassword();

    const handleupdatePassword = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        changePassword(
            {
                newPassword: formdata.confirmPassword,
                oldPassword: formdata.oldPassword,
            },
            {
                onSuccess: () => {
                    toast.success("password updated");
                    onClose();
                },
                onError: (err: any) => toast.error(err.response.data.message),
            }
        );
    };

    const [email, setEmail] = useState("");

    const { mutateAsync: sendOtptoMail, isPending } =
        authHooks.useSendVerificationMail();

    const handleSendOtp = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!email.trim()) {
            setShakeField("email");
            setTimeout(() => setShakeField(null), 400);
            return;
        }

        sendOtptoMail(email, {
            onSuccess: () => {
                toast.success("otp sent to your registered email");
                setEmail("");
                setStep("otp");
            },
            onError: (err: any) => toast.error(err?.response?.data?.message),
        });
    };

    const [otp, setotp] = useState("");

    const { mutateAsync: verifyOTP, isPending: otpVerifyPending } =
        useOTPVerify();

    const handleVerifyOTP = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!otp.trim()) {
            setShakeField("otp");
            setTimeout(() => setShakeField(null), 400);
            return;
        }

        verifyOTP(
            { otp, userId: loggedInUser?._id! },
            {
                onSuccess: () => {
                    toast.success("otp verified.");
                    setotp("");
                    setStep("new");
                },
                onError: (err: any) => toast.error(err?.response?.data?.message),
            }
        );
    };

    const { mutateAsync: resetPassword, isPending: resetPasswordPending } =
        useResetPassword();

    const handleResetPassword = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formdata.newPassword.trim()) {
            setShakeField("newPassword");
            setTimeout(() => setShakeField(null), 400);
            return;
        }

        if (!formdata.confirmPassword.trim()) {
            setShakeField("confirmPassword");
            setTimeout(() => setShakeField(null), 400);
            return;
        }

        resetPassword(
            { newpassword: formdata.newPassword, userId: loggedInUser?._id! },
            {
                onSuccess: () => {
                    toast.success("password reset successfully.");
                    onClose();
                },
                onError: (err: any) => toast.error(err?.response?.data?.message),
            }
        );
    };

    const { theme } = useTheme()
    const modalContent = (
        <div className={`fixed inset-0 ${theme == "dark" ? 'bg-white/20' : "bg-black/60"}  backdrop-blur-sm z-[9999] flex items-center justify-center p-4`}>
            <div className={`${theme == "dark" ? 'theme-bg-card' : "bg-zinc-100/80"} backdrop-blur-md w-full border theme-border max-w-md p-6 rounded-xl shadow-lg space-y-5 animate-fadeIn`}>
                <h2 className="text-xl font-semibold theme-text-primary text-white">
                    {step === "change" && "Change Password"}
                    {step === "forgot" && "Forgot Password"}
                    {step === "otp" && "Verify OTP"}
                    {step === "new" && "Set New Password"}
                </h2>

                {/* ---------------- CHANGE PASSWORD ---------------- */}
                {step === "change" && (
                    <form onSubmit={handleupdatePassword} className="space-y-5">
                        <div
                            className={`flex flex-col h-18 ${shakeField === "oldPassword" ? "shake-once" : ""
                                }`}
                        >
                            <InputField
                                value={formdata.oldPassword}
                                type="password"
                                onChange={handleChange}
                                name="oldPassword"
                                placeholder="enter old password"
                                label="old password"
                                required
                            />
                            {errors?.oldPassword && (
                                <span className="text-[10px] text-rose-600">
                                    {errors.oldPassword}
                                </span>
                            )}
                        </div>

                        <div
                            className={`flex flex-col h-18 ${shakeField === "newPassword" ? "shake-once" : ""
                                }`}
                        >
                            <InputField
                                value={formdata.newPassword}
                                type="password"
                                onChange={handleChange}
                                name="newPassword"
                                placeholder="enter new password"
                                label="new password"
                                required
                            />
                            {errors?.newPassword && (
                                <span className="text-[10px] text-rose-600">
                                    {errors.newPassword}
                                </span>
                            )}
                            {formdata.newPassword.length > 8 && (
                                <p className={`text-[11px] ${getcolor()}`}>{getmessage()}</p>
                            )}
                        </div>

                        <div className="flex flex-col h-18">
                            <InputField
                                value={formdata.confirmPassword}
                                type="password"
                                onChange={handleChange}
                                name="confirmPassword"
                                placeholder="confirm password"
                                label="confirm password"
                                required
                            />
                            {errors?.confirmPassword && (
                                <span className="text-[10px] text-rose-600">
                                    {errors.confirmPassword}
                                </span>
                            )}
                        </div>

                        <div className="flex justify-between items-end">
                            <div className="flex items-start flex-col-reverse gap-1">
                                <PrimaryButton label="Cancel" fullWidth={false} onClick={onClose} width="fit py-2 px-10" />



                                <button
                                    type="button"
                                    className="text-[10px] px-2 text-blue-400 hover:underline mt-1"
                                    onClick={() => setStep("forgot")}
                                >
                                    Forgot Password?
                                </button>
                            </div>
                            <PrimaryButton label="change" fullWidth={false} width="fit py-2 px-10" />


                        </div>
                        {updatePending && <Loader fullScreen message="password updating..." />}
                    </form>
                )}

                {/* ---------------- FORGOT STEP ---------------- */}
                {step === "forgot" && (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <p className="text-xs theme-text-muted">
                            Enter your registered email or phone number to receive an OTP.
                        </p>

                        <div className={shakeField === "email" ? "shake-once" : ""}>
                            <InputField
                                name="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="abc@example.com"
                                label="email or phone"
                            />
                        </div>

                        <div className="flex justify-between gap-3">
                            <PrimaryButton label="cancel" onClick={() => onClose()} fullWidth={false} type="submit" width="fit py-2 px-10" />
                            <PrimaryButton disabled={isPending} label="Send OTP" fullWidth={false} width="fit py-2 px-10" />
                        </div>
                        {isPending && <Loader fullScreen message="verify email.." />}
                    </form>
                )}

                {/* ---------------- OTP VERIFY ---------------- */}
                {step === "otp" && (
                    <form onSubmit={handleVerifyOTP} className="space-y-4">
                        <p className="text-xs theme-text-muted">
                            We have sent a 6-digit OTP to your email/phone.
                        </p>

                        <div className={shakeField === "otp" ? "shake-once" : ""}>
                            <InputField
                                value={otp}
                                onChange={(e) => setotp(e.target.value)}
                                placeholder="••••••"
                                name="otp"
                                label="enter otp"
                            />
                        </div>

                        <div className="flex justify-between gap-3">
                            <PrimaryButton onClick={() => setStep('forgot')} label="Back" fullWidth={false} width="fit py-2 px-10" />
                            <PrimaryButton label="Verify OTP" fullWidth={false} width="fit py-2 px-10" />
                        </div>
                        {otpVerifyPending && <Loader fullScreen message="verify otp" />}
                    </form>
                )}

                {/* ---------------- RESET NEW PASSWORD ---------------- */}
                {step === "new" && (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className={shakeField === "newPassword" ? "shake-once" : ""}>
                            <InputField
                                name="newPassword"
                                value={formdata.newPassword}
                                onChange={handleChange}
                                placeholder="enter new password"
                                label="new password"
                                type="password"
                            />
                            {errors?.newPassword && (
                                <span className="text-[10px] text-rose-600">
                                    {errors.newPassword}
                                </span>
                            )}
                            {formdata.newPassword.length > 8 && (
                                <p className={`text-[11px] ${getcolor()}`}>{getmessage()}</p>
                            )}
                        </div>

                        <div
                            className={
                                shakeField === "confirmPassword" ? "shake-once" : ""
                            }
                        >
                            <InputField
                                name="confirmPassword"
                                value={formdata.confirmPassword}
                                onChange={handleChange}
                                placeholder="enter confirm password"
                                label="confirm password"
                                type="password"
                            />
                            {errors?.confirmPassword && (
                                <span className="text-[10px] text-rose-600">
                                    {errors.confirmPassword}
                                </span>
                            )}
                        </div>

                        <div className="flex justify-between gap-3">
                            <PrimaryButton label="Back" onClick={()=>setStep("otp")} fullWidth={false} width="fit py-2 px-10"/>
                            <PrimaryButton label="Reset Password" fullWidth={false} width="fit py-2 px-10"/>
                        </div>
                        {resetPasswordPending && <Loader fullScreen message="password updating.." />}
                    </form>
                )}
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default ChangePasswordFlow;
