import React, { useEffect, useState } from "react";
import { MdCallEnd } from "react-icons/md";
import { getSocket } from "../../../../api/config/socketClient";
import { optimizeUrl } from "../../../../utils/imageOptimize";
import type { StartCallPayload } from "../ChatHeader";
import { useCallSignaling } from "../../../../hooks/call/useCallSignaling";
import TypingIndicator from "../../../../utils/TypingWave";

interface OutgoingCallModalProps {
  data: StartCallPayload;
  onCancel: () => void;
}

const OutgoingCallModal: React.FC<OutgoingCallModalProps> = ({
  data,
  onCancel,
}) => {
  const socket = getSocket();

  const [callStatus, setCallStatus] = useState<
    "connecting" | "busy"
  >("connecting");

  /* =========================
     BUSY LISTENER
  ========================= */
  useEffect(() => {
    if (!socket) return;

    const handleBusy = (payload: any) => {
      if (payload.roomId !== data.roomId) return;

      setCallStatus("busy");

      // optional: auto close after 2s
      setTimeout(() => {
        onCancel();
      }, 2000);
    };

    socket.on("call:busy", handleBusy);

    return () => {
      socket.off("call:busy", handleBusy);
    };
  }, [socket, data.roomId, onCancel]);

  const { cancelCall } = useCallSignaling()

  const handleCancel = () => {
    cancelCall(data.roomId, data.roomType, data.receiver.id)
    onCancel();
  };
useEffect(() => {
    // Timer start karo
    const timer = setTimeout(() => {
      console.log("Call timeout: No answer for 20s");
      handleCancel();
    }, 20000);

    return () => clearTimeout(timer);
  }, [data.roomId]);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div className="w-[320px] rounded-[40px] bg-[#1a1a1a] border border-white/10 shadow-2xl p-8 flex flex-col items-center gap-8">

        {/* AVATAR */}
        <div className="text-center">
          <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-blue-500 mx-auto mb-6">
            <img
              src={
                optimizeUrl(data.receiver.avatar || "", 200) ||
                "/profile-dummy.png"
              }
              alt="receiver"
              className="w-full h-full object-cover"
            />
          </div>

          <h2 className="text-2xl font-bold text-white">
            {data.receiver.name}
          </h2>

          {/* 🔹 STATUS TEXT */}
          <p className="text-sm text-zinc-400 mt-2 tracking-widest uppercase">
            {callStatus === "busy"
              ? "Busy on another call"
              : `Connecting (${data.callType})`}
          </p>
        </div>

        {/* 🔹 RINGING DOTS (ONLY WHEN CONNECTING) */}
        {callStatus === "connecting" && (
          <TypingIndicator />
        )}

        {/* CANCEL */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={handleCancel}
            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg shadow-red-500/30 active:scale-95"
          >
            <MdCallEnd size={32} className="text-white" />
          </button>
          <span className="text-[10px] text-zinc-500 font-semibold uppercase">
            Cancel
          </span>
        </div>
      </div>
    </div>
  );
};

export default OutgoingCallModal;
