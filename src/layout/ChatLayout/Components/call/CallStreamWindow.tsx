import React, { useEffect, useRef, useState } from "react";
import CallControls from "../CallControls";
import { optimizeUrl } from "../../../../utils/imageOptimize";
import { useAppSelector } from "../../../../store/hooks";
import { sfuState } from "../../../../hooks/call/sfu";

interface Props {
  setFullScreen: React.Dispatch<React.SetStateAction<boolean>>;
  fullScreen: boolean;
  setMaxScreen: React.Dispatch<React.SetStateAction<boolean>>;
  maxScreen: boolean;
}

const CallStreamWindow: React.FC<Props> = ({
  setFullScreen,
  fullScreen,
  setMaxScreen,
  maxScreen,
}) => {
  /* ================= REFS ================= */
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  /* ================= REDUX ================= */
  const { remoteUser, callType } = useAppSelector(
    (state) => state.activeCall
  );

  const isVideoCall = callType === "video";

  /* ================= LOCAL STREAM ================= */
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const syncLocal = () => {
      console.log("🔁 [LOCAL SYNC]", sfuState.localStream);
      setLocalStream(sfuState.localStream || null);
    };

    syncLocal();
    window.addEventListener("local-stream-ready", syncLocal);

    return () => window.removeEventListener("local-stream-ready", syncLocal);
  }, []);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      console.log(
        "📹 Attaching Local Video Tracks:",
        localStream.getVideoTracks().length
      );
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current
        .play()
        .then(() => console.log("▶️ Local video playing"))
        .catch((err) =>
          console.error("❌ Local video play failed:", err)
        );
    }
  }, [localStream]);

  /* ================= REMOTE STREAM ================= */
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const syncRemote = () => {
      let targetStream: MediaStream | null = null;

      if (sfuState.remotePeerId) {
        targetStream = sfuState.remoteStreams.get(sfuState.remotePeerId) || null;
      }
      if (!targetStream && sfuState.remoteStreams.size > 0) {
        targetStream = Array.from(sfuState.remoteStreams.values())[0];
      }

      if (targetStream) {
        console.log("✅ Remote Stream Found (Sync):", targetStream);
        setRemoteStream(targetStream);
      } else {
        console.log("❌ Remote Stream Not Found (Sync)");
        setRemoteStream(null);
      }
    };

    syncRemote();
    window.addEventListener("remote-stream-changed", syncRemote);

    return () => window.removeEventListener("remote-stream-changed", syncRemote);
  }, []);

  /* ================= ATTACH REMOTE STREAM ================= */
  useEffect(() => {
    if (!remoteStream) return;

    console.log(
      "🎯 Attaching remote stream:",
      remoteStream.id,
      "video:",
      remoteStream.getVideoTracks().length,
      "audio:",
      remoteStream.getAudioTracks().length
    );

    // VIDEO
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.muted = true; // prevent feedback
      remoteVideoRef.current.playsInline = true;

      remoteVideoRef.current
        .play()
        .then(() => console.log("▶️ Remote video playing"))
        .catch((err) => console.error("❌ Remote video play failed", err));
    }

    // AUDIO
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStream;

      remoteAudioRef.current
        .play()
        .then(() => console.log("▶️ Remote audio playing"))
        .catch((err) => console.error("❌ Remote audio play failed", err));
    }
  }, [remoteStream]);

  /* ================= HANDLE LATE VIDEO TRACK ================= */
  useEffect(() => {
    if (!remoteStream || !remoteVideoRef.current) return;

    const onAddTrack = (event: MediaStreamTrackEvent) => {
      console.log("🎬 Track arrived:", event.track.kind);

      if (event.track.kind === "video") {
        console.log("🎬 Video track arrived → force rebind");

        remoteVideoRef.current!.srcObject = remoteStream;
        remoteVideoRef.current!.load();
        remoteVideoRef.current!
          .play()
          .then(() => console.log("▶️ Remote video playing after track"))
          .catch((err) => console.error("❌ Video play failed:", err));
      }
    };

    remoteStream.addEventListener("addtrack", onAddTrack);
    return () => remoteStream.removeEventListener("addtrack", onAddTrack);
  }, [remoteStream]);

  /* ================= JSX ================= */
  return (
    <div
      className={`fixed inset-0 z-[500] bg-black flex items-center justify-center
      ${fullScreen && !maxScreen ? "p-4" : ""}
      ${maxScreen ? "p-0" : ""}`}
    >
      {/* REMOTE VIDEO */}
      {isVideoCall && (
        <video
          ref={remoteVideoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      )}

      {/* LOCAL VIDEO */}
      {isVideoCall && localStream && (
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="absolute bottom-6 right-6 w-36 h-48 rounded-xl border border-white/30 shadow-lg object-cover bg-black"
        />
      )}

      {/* AUDIO CALL UI */}
      {!isVideoCall && (
        <div className="flex flex-col items-center gap-6 text-white">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20">
            <img
              src={
                optimizeUrl(remoteUser?.avatar || "", 200) ||
                "/profile-dummy.png"
              }
              alt="user"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="text-center">
            <h2 className="text-xl font-semibold">{remoteUser?.name}</h2>
            <p className="text-sm text-white/60 tracking-widest mt-1">
              Audio call connected
            </p>
          </div>
        </div>
      )}

      {/* HIDDEN AUDIO */}
      <audio ref={remoteAudioRef} autoPlay playsInline />

      {/* CALL CONTROLS */}
      <div className="absolute bottom-6 w-full flex justify-center">
        <CallControls setfullScreen={setFullScreen} setlargeScreen={setMaxScreen} />
      </div>
    </div>
  );
};

export default CallStreamWindow;