import { useEffect, useCallback } from "react";
import { getSocket } from "../../api/config/socketClient";
import type { StartCallPayload } from "../../layout/ChatLayout/Components/ChatHeader";
import { useNavigate } from "react-router-dom";
import type { ICallingUser } from "../../layout/ChatLayout/ChatLayout";
import { useAppSelector } from "../../store/hooks";


interface AcceptedData {
    roomId:string;
    acceptedBy:ICallingUser
}
interface UseCallSignalingParams {
    onIncomingCall?: (payload: any) => void;
    onGroupCallNotify?: (payload: any) => void;
    onCallRejected?: () => void;
    onCallCancelled?: () => void;
    onhandleAccepted?: (payload:AcceptedData)=>void;
    onCallEnded?: (payload:any)=>void;
}


export const useCallSignaling = ({
    onIncomingCall,
    onGroupCallNotify,
    onCallRejected,
    onCallCancelled,
    onhandleAccepted,
    onCallEnded
}: UseCallSignalingParams = {}) => {
    const socket = getSocket();
    const startCall = useCallback(
        (payload: StartCallPayload) => {
            socket?.emit("call:start", payload);
        },
        [socket]
    );

    const acceptCall = useCallback(
        (roomId: string,caller:{name:string,avatar:string|null,id:string},roomType:"dm"|"group") => {
            console.log("-----------------accept call");
            
            socket?.emit("call:accept", { roomId ,caller,roomType});
        },
        [socket]
    );

    const rejectCall = useCallback(
        (roomId: string, callerId: string,type:"dm"|"group") => {
            socket?.emit("call:reject", { roomId, callerId,type });
        },
        [socket]
    );

    const cancelCall = useCallback(
        (roomId: string, roomType:"dm"|"group",receiverId?: string) => {
            socket?.emit("call:cancel", { roomId, receiverId,roomType });
        },
        [socket]
    );

    const endCall = useCallback(
        (roomId:string,roomType:string) => {
            socket?.emit("call:end",{roomId,roomType});
        },
        [socket]
    );

    /* ========================
       LISTENERS
    ======================== */

    useEffect(() => {
        if (!socket) return;

        if (onIncomingCall) {
            socket?.on("call:incoming", onIncomingCall);
        }

        if (onhandleAccepted) {
            socket?.on("call:accepted", onhandleAccepted);

        }
        if (onGroupCallNotify) {
            socket?.on("group:call:notify", onGroupCallNotify);
        }

        if (onCallRejected) {
            socket?.on("call:rejected", onCallRejected);
        }

        if (onCallCancelled) {
            socket?.on("call:cancelled", onCallCancelled);
        }

        if(onCallEnded){
            socket?.on("call:ended",onCallEnded)
        }



        return () => {
            if (onIncomingCall) {
                socket?.off("call:incoming", onIncomingCall);
            }
            if (onGroupCallNotify) {
                socket?.off("group:call:notify", onGroupCallNotify);
            }
            if (onCallRejected) {
                socket?.off("call:rejected", onCallRejected);
            }
            if (onCallCancelled) {
                socket?.off("call:cancelled", onCallCancelled);
            }
            if (onhandleAccepted) {
                socket?.off("call:accepted", onhandleAccepted);
            }
            if(onCallEnded){
            socket?.off("call:ended",onCallEnded)
        }
        };
    }, [
        socket,
        onIncomingCall,
        onGroupCallNotify,
        onCallRejected,
        onCallCancelled,
        onhandleAccepted,
        onCallEnded
    ]);

    /* ========================
       PUBLIC API
    ======================== */

    return {
        startCall,
        acceptCall,
        rejectCall,
        cancelCall,
        endCall,
    };
};
