import React from 'react';
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { BsFillCameraVideoFill, BsFillCameraVideoOffFill, BsThreeDots } from "react-icons/bs";
import { MdCallEnd } from "react-icons/md";

const ControlPanel = ({ isAudioMuted, isVideoMuted, toggleAudio, toggleVideo, handleCallEnd, handleMoreOption }) => {
  return (
    <div className="w-full h-[12%] bg-[#199FD9] flex items-center justify-center gap-5">
      <div onClick={toggleAudio} className="w-[3.5vw] h-[3.5vw] rounded-full bg-white flex items-center justify-center cursor-pointer hover:bg-slate-200">
        {isAudioMuted ? <FaMicrophoneSlash className="text-lg" /> : <FaMicrophone className="text-lg" />}
      </div>
      <div onClick={toggleVideo} className="w-[3.5vw] h-[3.5vw] rounded-full bg-white flex items-center justify-center cursor-pointer hover:bg-slate-200">
        {isVideoMuted ? <BsFillCameraVideoOffFill className="text-lg" /> : <BsFillCameraVideoFill className="text-lg" />}
      </div>
      <div onClick={handleMoreOption} className="w-[3.5vw] h-[3.5vw] rounded-full bg-white flex items-center justify-center cursor-pointer hover:bg-slate-200">
        <BsThreeDots className="text-2xl" />
      </div>
      <div onClick={handleCallEnd} className="w-[3.5vw] h-[3.5vw] rounded-full bg-red-600 flex items-center justify-center cursor-pointer hover:bg-red-700">
        <MdCallEnd className="text-lg text-white" />
      </div>
    </div>
  );
};

export default ControlPanel;