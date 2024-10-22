import React, { useEffect, useState } from "react";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";

const AudioCall = ({ remoteSocketId, onEndCall }) => {
  const socket = useSocket();
  const [myStream, setMyStream] = useState();
  const [isStreamSent, setIsStreamSent] = useState(false);

  useEffect(() => {
    const startAudioCall = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      setMyStream(stream);
      const offer = await peer.getOffer();
      socket.emit("audioCall", { to: remoteSocketId, offer });
    };

    startAudioCall();

    socket.on("audioCall:accepted", ({ from, ans }) => {
      peer.setLocalDescription(ans);
      sendStreams();
      setIsStreamSent(true);
    });

    socket.on("audioCall:incoming", async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      setMyStream(stream);
      const ans = await peer.getAnswer(offer);
      socket.emit("audioCall:accepted", { to: from, ans });
    });

    return () => {
      socket.off("audioCall:accepted");
      socket.off("audioCall:incoming");
    };
  }, [remoteSocketId, socket]);

  const sendStreams = () => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  };

  return (
    <div>
      <h1>Audio Call</h1>
      <div>
        {myStream && (
          <div>
            <h2>My Audio Stream</h2>
            {/* No video element for audio call */}
          </div>
        )}
      </div>
      <button onClick={onEndCall}>End Call</button>
    </div>
  );
};

export default AudioCall;