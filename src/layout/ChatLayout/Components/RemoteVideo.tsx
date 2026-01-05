import { useEffect, useRef } from "react";

interface Props {
  stream: MediaStream;
}

const RemoteVideo: React.FC<Props> = ({ stream }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      className="w-full h-full object-cover rounded-lg"
    />
  );
};

export default RemoteVideo;
