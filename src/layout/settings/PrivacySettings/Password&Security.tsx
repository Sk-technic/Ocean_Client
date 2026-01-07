import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { CgPassword } from "react-icons/cg";
import { LuShieldAlert } from "react-icons/lu";
import ChangePasswordFlow from "../components/ChangePasswordFlow";
import ToggleSwitch from "../../../components/Buttons/ToggleSwitch";
import { useAppSelector } from "../../../store/hooks";

const Password_Security = () => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const[phishing,setAlert] = useState<boolean>(false);
  const[TwoFA,setTowFA]=useState<boolean>(true)

  const {user:loggedInUser} = useAppSelector((state)=>state.auth)
  const handleTwoFactorAuth = ()=>{
    setTowFA((prev)=>!prev)
  }
  const setPhishingAlert = ()=>{
    setAlert((prev)=>!prev)
  }
    return (
        <>
            <div className="w-full space-y-5">

                <div>
                    <h1 className="text-xl font-bold">Password & Security</h1>
                    <p className="text-sm theme-text-muted mt-1">
                        Manage password, login verification, device sessions, and advanced account security.
                    </p>
                </div>

                <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Account Security</h2>

                    <div className="p-5 rounded-lg border theme-border shadow-md flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <CgPassword size={30} />
                            <div>
                                <h3 className="text-sm">Change Password</h3>
                                <p className="text-xs theme-text-muted">
                                    Keep your account secure by updating your password frequently.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => setOpenModal(true)}
                            className="px-2 py-2 text-xs shadow-md theme-bg-card rounded-lg border theme-border theme-hover-effect duration-300"
                        >
                            Change
                        </button>
                    </div>

                    <div className="p-5 rounded-lg border theme-border  shadow-md flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <FcGoogle size={30} />
                            <div>
                                <h3 className="text-sm">Two-factor authentication (2FA)</h3>
                                <p className="text-xs theme-text-muted">
                                    Add an extra layer of protection to prevent unauthorized access.
                                </p>
                                <span className={`text-[10px] ${TwoFA?'text-lime-500':"text-red-500"} mt-1 inline-block`}>
                                    {`${TwoFA?"● connected":"● Not connected"}`}
                                </span>
                            </div>
                        </div>

                        <ToggleSwitch value={TwoFA} onClick={handleTwoFactorAuth}/>
                    </div>

                    <div className="p-5 rounded-lg border theme-border shadow-md flex items-center opacity-40 justify-between">
                        <div className="flex items-center gap-4">
                            <LuShieldAlert size={30} />
                            <div>
                                <h3 className="text-sm">Anti-phishing Code</h3>
                                <p className="text-xs theme-text-muted">
                                    Prevent scams by adding a custom anti-phishing code.
                                </p>
                                <span className={`text-[10px] ${phishing?'text-lime-500':"text-red-500"} mt-1 inline-block`}>
                                    {`${phishing?"● connected":"● Not connected"}`}
                                </span>
                            </div>
                        </div>

                        <ToggleSwitch value={phishing} onclick={()=>setPhishingAlert()} />
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Devices & Active Sessions</h2>
                    <div className="grid grid-cols-3 gap-2">

                        <div className="p-2 rounded-md max-w-xs h-fit border theme-border shadow-lg">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold">Apple Mac 10.15.7</h3>
                                <span className="text-xs text-green-400">Online</span>
                            </div>
                            <p className="text-xs theme-text-muted">Switzerland · 201.136.24.108</p>
                        </div>

                        <div className="p-2 rounded-md max-w-xs h-fit border theme-border shadow-lg">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold">iPhone 14 Pro</h3>
                                <button className="text-xs text-red-400 hover:underline">Logout</button>
                            </div>
                            <p className="text-xs theme-text-muted">Mumbai · 176.38.19.14</p>
                        </div>

                    </div>
                </div>      
            </div>

            {openModal && (
        <ChangePasswordFlow onClose={() => setOpenModal(false)} />
      )}
        </>
    );
};

export default Password_Security;
