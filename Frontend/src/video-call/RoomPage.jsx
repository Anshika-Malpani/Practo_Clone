import React, { useEffect, useCallback, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import { useNavigate, useParams } from 'react-router-dom';
import { IoChatboxEllipsesSharp, IoCloseSharp } from "react-icons/io5";
import RoomChat from "../components/RoomChat";
import VideoPlayer from './VideoPlayer';
import ControlPanel from './ContolPanel';
import { useVideoControls } from "../hooks/useVideoControls";
import { useAudioControls } from "../hooks/useAudioControls";
import peer from "../service/peer"

const RoomPage = () => {
  const socket = useSocket();
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [isStreamSent, setIsStreamSent] = useState(false);
  const [isCallInitiated, setIsCallInitiated] = useState(false);
  const [isCallReceived, setIsCallReceived] = useState(false);
  const [isAudioOnly, setIsAudioOnly] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");
  const [userCount, setUserCount] = useState(0);
  const [isVideoCallStarted, setIsVideoCallStarted] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [moreOption, setMoreOption] = useState(false);
  const [remoteVideoBlurred, setRemoteVideoBlurred] = useState(false); 
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const { isVideoBlurred, toggleVideoBlur, startRecording, stopRecording, isRecording } = useVideoControls(myStream, remoteStream, socket, remoteSocketId);
  const { isAudioMuted, toggleAudio } = useAudioControls(myStream);
  

  const toggleVideo = useCallback(() => {
    if (myStream) {
      myStream.getVideoTracks().forEach(track => {
        track.enabled = isVideoMuted;
      });
      setIsVideoMuted(prev => !prev);
    }
  }, [isVideoMuted, myStream]);

  useEffect(() => {
    if (myStream && remoteStream && !isRecording) {
      startRecording();
    }
  }, [myStream, remoteStream, isRecording, startRecording]);

  useEffect(() => {
    document.body.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prevMode => !prevMode);
  }, []);

  const handleUserJoined = useCallback(({ email, id }) => {
    setRemoteSocketId(id);
    const newUserCount = userCount + 1;
    setJoinMessage(`${email} ${newUserCount === 1 ? 'has joined' : 'is in'} the room.`);
    setUserCount(newUserCount);
  }, [userCount]);

  const handleCallUser = useCallback(async (videoCall) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: videoCall,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer, isAudioOnly: !videoCall });
    setMyStream(stream);
    setIsAudioOnly(!videoCall);

    if (videoCall) {
      socket.emit("video:call:started", { to: remoteSocketId });
      setIsVideoCallStarted(true);
    }
  }, [remoteSocketId, socket]);

  const handleIncommingCall = useCallback(
    async ({ from, offer, isAudioOnly }) => {
      setRemoteSocketId(from);
      setIsCallReceived(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: !isAudioOnly,
      });
      setMyStream(stream);
      setIsAudioOnly(isAudioOnly);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    myStream.getTracks().forEach(track => peer.peer.addTrack(track, myStream));
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      sendStreams();
      setIsCallReceived(false);
      setIsStreamSent(true);
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      setRemoteStream(remoteStream[0]);
      if (myStream && remoteStream) {
        setJoinMessage("");
      }
    });
  }, [myStream]);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incoming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);

    socket.on("chat:message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on("video:call:started", () => {
      setIsVideoCallStarted(true);
    });

    socket.on("video:blur:toggle", ({ from, isBlurred }) => {
      if (from !== socket.id) {
        setRemoteVideoBlurred(isBlurred);
      }
    });

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incoming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
      socket.off("chat:message");
      socket.off("video:call:started");
      socket.off("video:blur:toggle");
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);

  useEffect(() => {
    socket.on("call:ended", ({ from }) => {
      console.log(`Call ended by ${from}`);
      if (myStream) {
        myStream.getTracks().forEach(track => track.stop());
      }
      if (remoteStream) {
        remoteStream.getTracks().forEach(track => track.stop());
      }
      navigate('/');
    });

    return () => {
      socket.off("call:ended");
    };
  }, [socket, navigate, myStream, remoteStream]);

  const handleCallEnd = useCallback(() => {
    if (myStream) {
      myStream.getTracks().forEach(track => track.stop());
    }
    stopRecording();
    socket.emit("call:ended", { to: remoteSocketId });
    navigate('/');
  }, [myStream, stopRecording, socket, remoteSocketId, navigate]);

  const toggleChat = useCallback(() => {
    setIsChatOpen(prev => !prev);
  }, []);

  const handleMoreOption = useCallback(() => {
    setMoreOption(prev => !prev);
  }, []);

  return (
    <div className={`flex flex-col items-center ${isDarkMode ? 'bg-black' : 'bg-gray-100'} h-[89vh]`}>
      <div className="w-full h-[88%] flex items-center justify-center relative">
        <div className="flex items-center justify-center flex-col w-full h-full gap-2">
          {!isVideoCallStarted && (
            <div className={`w-[17vw] h-[17vw] rounded-full ${isDarkMode ? 'bg-gray-100' : 'bg-gray-800'}`}>
              <img className="w-full h-full rounded-full object-cover" src="/images/userAvatar.png" alt="" />
            </div>
          )}
          <div className="flex items-center justify-center flex-col">
            <h4 className={`text-lg mb-6 ${remoteSocketId ? "text-green-600" : "text-red-600"}`}>
              {remoteSocketId ? "" : "Waiting for connection..."}
            </h4>
            {joinMessage && <p className="text-lg text-gray-700 mb-4">{joinMessage}</p>}

            {myStream && !isStreamSent && !isCallReceived && remoteSocketId && !isCallInitiated && (
              <button
                onClick={() => {
                  sendStreams();
                  setIsStreamSent(true);
                }}
                className="bg-blue-500 text-white font-bold py-2 px-6 rounded mb-4 hover:bg-blue-600 transition duration-200"
              >
                Accept Incoming Call
              </button>
            )}

            <div className="flex gap-4">{remoteSocketId && !isCallInitiated && !isCallReceived && (
              <>
                <button
                  onClick={() => {
                    handleCallUser(true);
                    setIsCallInitiated(true);
                  }}
                  className="bg-green-500 text-white font-bold py-2 px-6 rounded mb-6 hover:bg-green-600 transition duration-200"
                >
                  Video Call
                </button>
                <button
                  onClick={() => {
                    handleCallUser(false);
                    setIsCallInitiated(true);
                  }}
                  className="bg-blue-500 text-white font-bold py-2 px-6 rounded mb-6 hover:bg-blue-600 transition duration-200"
                >
                  Audio Call
                </button>
              </>
            )}</div>

            {isCallReceived && !isStreamSent && (
              <button
                onClick={() => {
                  sendStreams();
                  setIsStreamSent(true);
                }}
                className="bg-blue-500 text-white font-bold py-2 px-6 rounded mb-4 hover:bg-blue-600 transition duration-200"
              >
                Accept Incoming Call
              </button>
            )}

            <div className="flex items-center justify-center gap-8 w-screen">
              <VideoPlayer stream={myStream} isAudioOnly={isAudioOnly} isBlurred={isVideoBlurred} />
              <VideoPlayer stream={remoteStream} isAudioOnly={isAudioOnly} isBlurred={remoteVideoBlurred} isRemote />
            </div>
          </div>
        </div>
      </div>

      <div className='fixed bottom-4 right-8'>
        <div
          className='w-[3.5vw] h-[3.5vw] rounded-full bg-[black] flex items-center justify-center cursor-pointer'
          onClick={toggleChat}
        >
          {!isChatOpen ? <IoChatboxEllipsesSharp className='text-xl text-white' />
            : <IoCloseSharp className='text-xl text-white' />}
        </div>
      </div>

      {isChatOpen && <RoomChat room={roomId} />}

      <div className="w-full h-[12%] bg-[#199FD9] flex items-center justify-center gap-5 ">
        <ControlPanel
          isAudioMuted={isAudioMuted}
          isVideoMuted={isVideoMuted}
          toggleAudio={toggleAudio}
          toggleVideo={toggleVideo}
          handleCallEnd={handleCallEnd}
          handleMoreOption={handleMoreOption}
        />

        <div className={`w-[15vw]  absolute bottom-[10.8%] right-[34.5%] rounded-xl bg-[#199FD9] shadow-xl ${moreOption ? 'block' : 'hidden'}`}>
          <div className="w-full h-full p-4 flex flex-col gap-3">
            <div className="flex gap-2"> <label className="flex cursor-pointer select-none items-center">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isDarkMode}
                  onChange={toggleDarkMode}
                  className="sr-only"
                />
                <div className="block h-[1.3rem] w-9 rounded-full border border-[#BFCEFF] bg-[#EAEEFB]"></div>
                <div
                  className={`dot bg-black absolute top-[2px] left-1 h-4 w-4 rounded-full transition-transform duration-300 ${isDarkMode ? 'translate-x-3' : 'translate-x-0'}`}
                ></div>
              </div>
            </label>
              <h1 className="text-white font-medium">Dark Mode</h1>
            </div>
            <div className="flex gap-2"> <label className="flex cursor-pointer select-none items-center">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isVideoBlurred}
                  onChange={toggleVideoBlur}
                  className="sr-only"
                />
                <div className="block h-[1.3rem] w-9 rounded-full border border-[#BFCEFF] bg-[#EAEEFB]"></div>
                <div
                  className={`dot bg-black absolute top-[2px] left-1 h-4 w-4 rounded-full transition-transform duration-300 ${isVideoBlurred ? 'translate-x-3' : 'translate-x-0'}`}
                ></div>
              </div>
            </label>
              <h1 className="text-white font-medium">Blur Video</h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomPage;