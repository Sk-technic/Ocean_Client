import React from "react";
import { CiVideoOn, CiPhone } from "react-icons/ci";
import { MdCallEnd, MdCall } from "react-icons/md"; // Better call icons
import { getSocket } from "../../../../api/config/socketClient";
import { optimizeUrl } from "../../../../utils/imageOptimize";
import { useCallSignaling } from "../../../../hooks/call/useCallSignaling";
import { useNavigate } from "react-router-dom";

interface IncomingCallModalProps {
  data: {
    roomId: string;
    callType: "audio" | "video";
    type:"dm"|"group";
    caller: {
      id: string;
      name: string;
      avatar: string|null;
    };
  };
  onClose: () => void;
}

const IncomingCallModal: React.FC<IncomingCallModalProps> = ({ data, onClose }) => {
  const {rejectCall,acceptCall} = useCallSignaling()
console.log("incoming data : ",data);

  const handleAccept = () => {
    acceptCall(data.roomId,data?.caller,data.type)
    onClose();
  };

  const handleReject = () => {
    rejectCall(data.roomId,data?.caller?.id,data?.type)
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 backdrop-blur-md transition-all">
      <div className="w-[320px] rounded-[40px] bg-[#1a1a1a] border border-white/10 shadow-2xl p-8 flex flex-col items-center gap-6 animate-in zoom-in duration-300">

        {/* Animated Profile Pic */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full animate-ping duration-500 bg-green-500/20" />
          <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-green-500 relative z-10">
            <img
              src={optimizeUrl(data.caller?.avatar || "", 200) || "/profile-dummy.png"}
              alt="caller"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {data.caller?.name}
          </h2>
          <p className="text-sm text-zinc-400 mt-1 animate-pulse">
            Incoming {data.callType} call...
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-10 mt-4">
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleReject}
              className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg shadow-red-500/30 transition-transform active:scale-90"
            >
              <MdCallEnd size={32} className="text-white" />
            </button>
            <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Decline</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleAccept}
              className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center shadow-lg shadow-green-500/30 transition-transform active:scale-90"
            >
              <MdCall size={32} className="text-white" />
            </button>
            <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Accept</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;