import { MdCallEnd, MdMic, MdMicOff, MdVideocam, MdVideocamOff } from "react-icons/md";
import { useCallSignaling } from "../../../hooks/call/useCallSignaling";
import { useAppSelector } from "../../../store/hooks";
import React, { useState } from "react";
import { CgMaximize } from "react-icons/cg";
import { CgMinimize } from "react-icons/cg";
import { BsBoxArrowInUpLeft } from "react-icons/bs";
import { BsBoxArrowDownRight } from "react-icons/bs";

const CallControls: React.FC<{
  setfullScreen: React.Dispatch<React.SetStateAction<boolean>>
  setlargeScreen: React.Dispatch<React.SetStateAction<boolean>>
}> = ({ setfullScreen, setlargeScreen }) => {


  const { endCall } = useCallSignaling()
  const { roomType, roomId } = useAppSelector(state => state.activeCall)
  const [maxScreen, setMaxScreen] = useState<boolean>(true)
  const [xl, setxlScreen] = useState<boolean>(false)


  return (
    <div className="w-full flex justify-center gap-6">

      <button className="w-14 h-14 bg-zinc-700/60 rounded-full text-white flex items-center justify-center">
        <MdMic size={24} />
      </button>

      <button className="w-14 h-14 bg-zinc-700/60 rounded-full text-white flex items-center justify-center">
        <MdVideocam size={24} />
      </button>

      <button
        onClick={() => endCall(roomId!, roomType!)}
        className="w-14 h-14 bg-red-600 rounded-full text-white flex items-center justify-center"
      >
        <MdCallEnd size={28} />
      </button>
      <button onClick={() => { setMaxScreen(prev => !prev); setfullScreen(prev=>!prev) }} className="w-14 h-14 hover:bg-zinc-700/60 hover:border-0 border-2 theme-border rounded-full text-white flex items-center justify-center">
        {maxScreen ? <BsBoxArrowInUpLeft size={20} /> : <BsBoxArrowDownRight size={20} />}
      </button>
      <button onClick={() => { setxlScreen(prev => !prev); setlargeScreen(prev=>!prev) }} className="w-14 h-14 hover:bg-zinc-700/60 hover:border-0 border-2 theme-border rounded-full text-white flex items-center justify-center">
        {maxScreen ? <CgMaximize size={20} /> : <CgMinimize size={20} />}
      </button>
    </div>
  );
};

export default CallControls;
