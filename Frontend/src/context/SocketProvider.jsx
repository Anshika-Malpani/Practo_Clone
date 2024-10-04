import React, { createContext, useContext } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);


const socket = io("http://localhost:8000");

export const useSocket = () => {
  const contextSocket = useContext(SocketContext);
  return contextSocket;
};

export const SocketProvider = ({ children }) => {
  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
