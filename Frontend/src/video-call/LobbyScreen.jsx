import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";

const LobbyScreen = () => {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");

  const socket = useSocket();
  const navigate = useNavigate();

  const handleSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      socket.emit("room:join", { email, room });
    },
    [email, room, socket]
  );

  const handleJoinRoom = useCallback(
    (data) => {
      const { email, room } = data;
      navigate(`/room/${room}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("room:join", handleJoinRoom);
    return () => {
      socket.off("room:join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  return (
    <div className="flex items-center justify-center w-full h-[89vh] bg-gray-100">
  <div className="flex flex-col items-center p-8 bg-white border border-gray-200 rounded-lg shadow-lg w-96">
    <h1 className="text-3xl font-bold text-[#199FD9] mb-6">Join the Lobby</h1>
    <form onSubmit={handleSubmitForm} className="w-full">
      <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-2">Email ID</label>
      <input
        type="email"
        id="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:ring focus:ring-blue-200 outline-none"
        placeholder="Enter your email"
      />
      <label htmlFor="room" className="block text-sm font-medium text-gray-600 mb-2">Room Code</label>
      <input
        type="text"
        id="room"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:ring focus:ring-blue-200 outline-none"
        placeholder="Enter room Code"
      />
      <button className="w-full bg-[#199FD9] text-white font-bold py-3 rounded-lg hover:bg-blue-600 transition duration-200">
        Join Room
      </button>
    </form>
  </div>
</div>

  
  );
};

export default LobbyScreen;