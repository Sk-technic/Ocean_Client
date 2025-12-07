import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { autoLogin, useOTPVerify, useResendOtp } from "../../../../hooks/auth/authHooks";
import Loader from "../../../Loader/Loader";

const VerifyOtp: React.FC = () => {
    const isValidObjectId = (id: string) => /^[a-fA-F0-9]{24}$/.test(id);

    const { i } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (!i || !isValidObjectId(i)) {
            navigate(-1);
        }
        setUserID(i!)
    }, [i, navigate]);

    const [otp, setOtp] = useState<string>('')
    const [timer, setTimer] = useState(50); // 60 sec for resend
    const [message, setMessage] = useState<string>('')
    const [userId,setUserID] = useState<string>('')
    useEffect(() => {
        if (timer <= 0) return;
        const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        return () => clearInterval(interval);
    }, [timer]);

    const { mutateAsync: useVerify,isPending } = useOTPVerify()
    const {mutateAsync:useAutoLogin} = autoLogin()
    const {mutateAsync:resendOTP} = useResendOtp()
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp) {
            setMessage("OTP not provided.");
            return;
        }
        console.log("otp: ",otp);
        
        useVerify({otp,userId},{
            onSuccess:(data:any)=>{
                setTimer(0)
                setMessage('')
                useAutoLogin(data?.data)
            }
        })
    }
    const handleResendOtp = () => {
        if(!i)return;

        console.log(i);
        
        resendOTP(i,{
            onSuccess:(data)=>{
                setTimer(30)
            },
            onError:(data:any)=>{
                console.log(data);
                
            }
        })
    }

    function formatTime(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;

        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }

 return (
  <main className="min-h-screen flex items-center justify-center p-4 theme-bg-primary">
    <section className="theme-bg-card theme-border theme-shadow-lg w-full max-w-md rounded-2xl p-8 animate-fadeIn">

      {/* APP LOGO */}
      <div className="w-full flex flex-col items-center justify-center mb-4">
        <img
          src={'/Ocean_logo.png'}
          alt="App Logo"
          className="h-18 w-18 object-contain"
        />
      </div>

      {/* PAGE HEADING */}
      <h1 className="text-md font-bold text-center theme-text-primary mb-2">
        OTP Verification
      </h1>


      {/* OTP INPUTS */}
      <div className="flex justify-center gap-3 mb-4">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <input
            key={index}
            type="text"
            maxLength={1}
            value={otp[index] || ""}
            onChange={(e) => {
              let value = e.target.value.replace(/\D/, "");
              if (!value) value = "";
              const newOtp = otp.split("");

              newOtp[index] = value;
              setOtp(newOtp.join(""));
 
              // Auto move to next box
              if (value && index < 5) {
                const nextInput = document.getElementById(`otp-${index + 1}`);
                nextInput?.focus();
              }
            }}
            id={`otp-${index}`}
            className="w-12 h-12 rounded-xl text-center text-lg font-semibold 
            theme-bg-secondary border theme-border 
            focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
          />
        ))}
      </div>

      <div className="flex items-center justify-center">
            <p className="text-center theme-text-muted text-xs w-90">
              Please enter the 6-digit code sent to your registered email or phone number
              to complete verification.
            </p>
      </div>

      {/* TIMER + RESEND */}
      <div className="flex items-center justify-between text-sm theme-text-secondary my-3">
        {timer !== 0 ? (
          <span>
            Remaining time:{" "}
            <span className="text-purple-600 font-medium">
              {formatTime(timer)}
            </span>
          </span>
        ) : (
          <span></span>
        )}

        <button
          onClick={handleResendOtp}
          disabled={timer !== 0}
          className={`font-medium ${
            timer !== 0
              ? "theme-text-muted cursor-not-allowed"
              : "text-purple-600 hover:underline"
          }`}
        >
          Resend
        </button>
      </div>

      {/* BUTTONS */}
      <div className="flex flex-col gap-3">

        <button
        type="submit" 
          onClick={handleSubmit}
          disabled={otp.length !== 6}
          className={`w-full p-3 rounded-xl text-white ${otp.length===6 && 'hover:cursor-pointer'} flex items-center justify-center gap-2 font-semibold text-sm transition-all
            ${
              otp.length === 6
                ? "active-theme-button"
                : "bg-purple-300 cursor-not-allowed"
            }`}
        >
          Verify
        </button>

        <button
        type="submit"
          onClick={() => navigate(-1)}
          className="w-full p-3 rounded-xl text-purple-600 hover:cursor-pointer border border-purple-300
          font-medium text-sm hover:bg-purple-50 transition"
        >
          Cancel
        </button>
      </div>
    </section>
    {isPending &&
      <>
      <Loader fullScreen/>
      <span className="absolute top-1/2 mt-5 text-xs  z-100">verifying . . .</span>
      </>
    }
  </main>
);

};

export default VerifyOtp;
