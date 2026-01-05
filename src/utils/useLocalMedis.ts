import { useCallback, useRef, useState } from "react";

export type CallType = "video" | "audio";

export interface LocalMediaState {
  stream: MediaStream | null;
  isReady: boolean;
  error: string | null;
}

export const useLocalMedia = () => {
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<LocalMediaState>({
    stream: null,
    isReady: false,
    error: null
  });

  /**
   * Open camera / mic
   * Call ONLY after `call:accepted`
   */
  const openLocalMedia = useCallback(async (callType: CallType) => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: callType === "video"
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      streamRef.current = stream;
      setState({
        stream,
        isReady: true,
        error: null
      });

      return stream;
    } catch (err) {
      setState({
        stream: null,
        isReady: false,
        error: "MEDIA_PERMISSION_DENIED"
      });
      throw err;
    }
  }, []);

  /**
   * Stop & cleanup local media
   */
  const closeLocalMedia = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    setState({
      stream: null,
      isReady: false,
      error: null
    });
  }, []);

  return {
    ...state,
    openLocalMedia,
    closeLocalMedia
  };
};
