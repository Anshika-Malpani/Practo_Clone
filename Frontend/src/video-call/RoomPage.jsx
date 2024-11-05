import React, { useEffect, useCallback, useState, useRef } from "react";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";
import { FaMicrophone } from "react-icons/fa";
import { BsFillCameraVideoFill } from "react-icons/bs";
import { NavLink, useNavigate } from 'react-router-dom';
import { MdCallEnd } from "react-icons/md";
import { IoChatboxEllipsesSharp, IoCloseSharp } from "react-icons/io5"; // Import chat icons
import Chat from '../components/Chat'; // Import the Chat component
import RoomChat from "../components/RoomChat";
import { BsRecordCircle } from "react-icons/bs";
import { PiRecordFill } from "react-icons/pi";

const RoomPage = () => {
  const socket = useSocket();
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
  const [newMessage, setNewMessage] = useState("");
  const [recordingChunks, setRecordingChunks] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef(null); // Ref for MediaRecorder
  const recordedChunks = useRef([]); // Store video chunks

  
  useEffect(() => {
    return () => {
      if (mediaRecorder) {
        mediaRecorder.stop();
      }
    };
  }, [mediaRecorder]);


  const startRecording = () => {
    recordedChunks.current = []; // Clear old chunks
    const combinedStream = new MediaStream([
      ...myStream.getTracks(),
      ...(remoteStream ? remoteStream.getTracks() : []),
    ]);

    mediaRecorder.current = new MediaRecorder(combinedStream);

    mediaRecorder.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.current.push(event.data);
      }
    };

    mediaRecorder.current.onstop = () => {
      downloadRecording();
    };

    mediaRecorder.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorder.current.stop();
    setIsRecording(false);
  };

  const downloadRecording = () => {
    const blob = new Blob(recordedChunks.current, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recording_${new Date().toISOString()}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  };


  // const stopRecording = useCallback(() => {
  //   if (mediaRecorder) {
  //     mediaRecorder.stop();
  //     setIsRecording(false);
  //   }
  // }, [mediaRecorder]);



  const handleUserJoined = useCallback(({ email, id }) => {
    setRemoteSocketId(id);
    const newUserCount = userCount + 1;
    if (newUserCount === 1) {
      setJoinMessage(`${email} has joined the room.`);
    } else {
      setJoinMessage(`${email} is in the room.`);
    }
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
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
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

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incoming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
      socket.off("chat:message");
      socket.off("video:call:started");
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = { text: newMessage, from: "me" };
      setMessages((prevMessages) => [...prevMessages, message]);
      socket.emit("chat:message", { text: newMessage, to: remoteSocketId });
      setNewMessage("");
    }
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div className="flex flex-col items-center bg-gray-100 h-[89vh]">
      <div className="w-full h-[88%] flex items-center justify-center ">
        <div className="flex items-center justify-center flex-col w-full h-full">
          {!isVideoCallStarted && (
            <div className="w-[17vw] h-[17vw] rounded-full">
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
              {myStream && !isAudioOnly && (
                <div className="flex flex-col items-center">
                  <video
                    autoPlay
                    width="500px"
                    height="400px"
                    ref={(video) => { if (video) video.srcObject = myStream; }}
                    className="shadow-md"
                  />
                </div>
              )}

              {myStream && isAudioOnly && (
                <div className="flex flex-col items-center">
                  <audio
                    autoPlay
                    ref={(audio) => { if (audio) audio.srcObject = myStream; }}
                    className="border border-gray-300 rounded-lg shadow-md"
                  />
                </div>
              )}

              {remoteStream && !isAudioOnly && (
                <div className="flex flex-col items-center">
                  <video
                    autoPlay
                    width="500px"
                    height="400px"
                    ref={(video) => { if (video) video.srcObject = remoteStream; }}
                    className="border border-gray-300 shadow-md"
                  />
                </div>
              )}

              {remoteStream && isAudioOnly && (
                <div className="flex flex-col items-center">
                  <audio
                    autoPlay
                    ref={(audio) => { if (audio) audio.srcObject = remoteStream; }}
                    className="rounded-lg shadow-md"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>


      <div className='fixed bottom-8 right-8'>
        <div
          className='w-[4vw] h-[4vw] rounded-full bg-[black] flex items-center justify-center cursor-pointer'
          onClick={toggleChat}
        >
          {!isChatOpen ? <IoChatboxEllipsesSharp className='text-xl text-white' />
            : <IoCloseSharp className='text-xl text-white' />}
        </div>
      </div>


      {isChatOpen && <RoomChat />}

      <div className="w-full h-[12%] bg-[#199FD9] flex items-center justify-center gap-5">
        <div className="w-[3.5vw] h-[3.5vw] rounded-full bg-white flex items-center justify-center">
          <FaMicrophone className="text-lg" />
        </div>
        <div className="w-[3.5vw] h-[3.5vw] rounded-full bg-white flex items-center justify-center">
          <BsFillCameraVideoFill className="text-lg" />
        </div>
        <div className="w-[3.5vw] h-[3.5vw] rounded-full bg-red-600 flex items-center justify-center">
          <MdCallEnd className="text-lg text-white" /> 
        </div>
        <div className="flex gap-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="w-[3.5vw] h-[3.5vw] rounded-full bg-white flex items-center justify-center"
            >
             <PiRecordFill className="text-xl"  />
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="w-[3.5vw] h-[3.5vw] rounded-full bg-white flex items-center justify-center"
            >
              <PiRecordFill className="text-xl text-red-500"  />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomPage;