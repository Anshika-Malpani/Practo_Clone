import React, { useEffect, useCallback, useState } from "react";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";

const VideoCall = ({ remoteSocketId, onEndCall }) => {
  const socket = useSocket();
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [isStreamSent, setIsStreamSent] = useState(false);

  useEffect(() => {
    const startVideoCall = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      const offer = await peer.getOffer();
      socket.emit("user:call", { to: remoteSocketId, offer });
    };

    startVideoCall();

    socket.on("call:accepted", ({ from, ans }) => {
      peer.setLocalDescription(ans);
      sendStreams();
      setIsStreamSent(true);
    });

    socket.on("incomming:call", async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    });

    peer.peer.addEventListener("track", (ev) => {
      setRemoteStream(ev.streams[0]);
    });

    return () => {
      socket.off("call:accepted");
      socket.off("incomming:call");
    };
  }, [remoteSocketId, socket]);

  const sendStreams = () => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  };

  return (
    <div>
      <h1>Video Call</h1>
      <div>
        {myStream && (
          <div>
            <h2>My Stream</h2>
            <video autoPlay ref={(video) => { if (video) video.srcObject = myStream; }} />
          </div>
        )}
        {remoteStream && (
          <div>
            <h2>Remote Stream</h2>
            <video autoPlay ref={(video) => { if (video) video.srcObject = remoteStream; }} />
          </div>
        )}
      </div>
      <button onClick={onEndCall}>End Call</button>
    </div>
  );
};

export default VideoCall;