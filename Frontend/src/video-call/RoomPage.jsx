import React, { useEffect, useCallback, useState } from "react";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";

const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [isStreamSent, setIsStreamSent] = useState(false);
  const [isCallInitiated, setIsCallInitiated] = useState(false);
  const [isCallReceived, setIsCallReceived] = useState(false); 

  const isConnected = myStream && remoteStream;

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      setIsCallReceived(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log(`Incoming Call`, from, offer);
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
      console.log("Call Accepted!");
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
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);

  return (
    <div className="flex flex-col items-center p-6 bg-gray-100 h-[89vh]">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Room Page</h1>
      <h4 className={`text-lg mb-6 ${remoteSocketId ? "text-green-600" : "text-red-600"}`}>
        {remoteSocketId ? "Connected" : "No one in room"}
      </h4>

      {myStream && !isStreamSent && !isCallReceived && (
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

      {remoteSocketId && !isCallInitiated && !isCallReceived && ( 
        <button
          onClick={() => {
            handleCallUser();
            setIsCallInitiated(true);
          }}
          className="bg-green-500 text-white font-bold py-2 px-6 rounded mb-6 hover:bg-green-600 transition duration-200"
        >
          CALL
        </button>
      )}

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

      <div className="flex items-center justify-center gap-8">
        {myStream && (
          <div className="flex flex-col items-center">
            <h1 className="text-xl font-semibold mb-2">My Stream</h1>
            <video
              autoPlay
              height="200"
              width="300"
              ref={(video) => { if (video) video.srcObject = myStream; }}
              className="border border-gray-300 rounded-lg shadow-md"
            />
          </div>
        )}

        {remoteStream && (
          <div className="flex flex-col items-center">
            <h1 className="text-xl font-semibold mb-2">Remote Stream</h1>
            <video
              autoPlay
              height="200"
              width="300"
              ref={(video) => { if (video) video.srcObject = remoteStream; }}
              className="border border-gray-300 rounded-lg shadow-md"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomPage;