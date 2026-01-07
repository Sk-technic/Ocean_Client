import React, { useEffect, useRef, useState } from "react";
import CallControls from "../CallControls";
import { optimizeUrl } from "../../../../utils/imageOptimize";
// import { useCallSignaling } from "../../../../hooks/call/useCallSignaling";
import { useAppSelector } from "../../../../store/hooks";
// import { getSocket } from "../../../../api/config/socketClient";
// import { clearActiveCall } from "../../../../store/slices/activeCallSlice";
// import { useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";
// import { Fullscreen } from "lucide-react";
import Draggable from 'react-draggable'
import { sfuState } from "../../../../hooks/sfu";
const CallStreamWindow: React.FC<
  {
    setFullScreen: React.Dispatch<React.SetStateAction<boolean>>
    fullScreen: boolean
    setMaxScreen: React.Dispatch<React.SetStateAction<boolean>>
    maxScreen: boolean
  }
> = ({ setFullScreen, fullScreen, setMaxScreen, maxScreen }) => {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const remoteStream = sfuState.remoteStreams?.values()?.next()?.value || null;

  const isVideoCall = !!sfuState.localStream?.getVideoTracks().length;

  /* ================= LOCAL STREAM ================= */
  useEffect(() => {
    if (localVideoRef.current && sfuState.localStream) {
      localVideoRef.current.srcObject = sfuState.localStream;
    }
  }, [sfuState.localStream]);

  /* ================= REMOTE STREAM ================= */
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // const socket = getSocket()
  const { remoteUser } = useAppSelector(state => state.activeCall)
  // const dispatch = useAppDispatch()
  // const navigate = useNavigate()
  const nodeRef = useRef(null);
  // useEffect(() => {
  //     if (!socket) return
  //     const handleCallEnded = (payload:any) => {
  //       console.log("payload ==== call ended", payload);
  //       dispatch(clearActiveCall())
  //       toast('call end.')
  //       navigate(-1)
  //     }
  //     socket?.on("call:ended", handleCallEnded)

  //     return () => {
  //       socket?.off("call:ended", handleCallEnded)

  //     }
  //   }, [socket])
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Jab fullScreen toggle ho, position reset kar dein
  useEffect(() => {
    if (fullScreen || maxScreen) {
      setPosition({ x: 0, y: 0 });
    }
  }, [fullScreen, maxScreen]);

  const handleDrag = (e: any, data: any) => {
    setPosition({ x: data.x, y: data.y });
    console.log(e);
    
  };
  return (
    <Draggable
      nodeRef={nodeRef}
      bounds="parent"
      disabled={fullScreen || maxScreen}
      position={position} // 🔥 Controlled position
      onDrag={handleDrag}
    >
      {/* 🔴 Is DIV ka hona zaroori hai Draggable ke theek niche */}
      <div ref={nodeRef} className={`p-5 fixed z-[500] pointer-events-auto rounded-2xl dark:bg-zinc-800 bg-zinc-300 flex flex-col justify-bettween  ${(fullScreen && !maxScreen) ? 'w-[80%] h-[80vh]' : ''} ${maxScreen ? "w-full h-full rounded-xs" : ""}`}>
        {/* ================= VIDEO CALL UI ================= */}
        {isVideoCall && (
          <>
            {/* 🔵 Remote video (full screen) */}
            {remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white text-sm opacity-60">
                Connecting video...
              </div>
            )}

            {/* 🟢 Local preview */}
            {sfuState.localStream && (
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="absolute bottom-28 right-4 w-32 h-44 rounded-xl border border-white/30 shadow-lg object-cover bg-black"
              />
            )}
          </>
        )}

        {/* ================= AUDIO CALL UI ================= */}
        {!isVideoCall && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 text-white">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20">
              <img
                src={
                  optimizeUrl(
                    sfuState.remoteUser?.avatar || remoteUser?.avatar || "",
                    200
                  ) || "/profile-dummy.png"
                }
                alt="user"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="text-center">
              <h2 className="text-xl font-semibold">
                {sfuState.remoteUser?.name || remoteUser?.name}
              </h2>
              <p className="text-sm text-white/60 tracking-widest mt-1">
                Audio call connected
              </p>
            </div>
          </div>
        )}

        {/* ================= CONTROLS ================= */}
        <div className="pb-6">
          <CallControls setfullScreen={setFullScreen} setlargeScreen={setMaxScreen} />
        </div>
      </div>
    </Draggable>
  );
};

export default CallStreamWindow;
