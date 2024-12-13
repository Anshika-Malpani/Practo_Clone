import React, { useState, useEffect, useRef } from 'react';
import { IoChatboxEllipsesSharp, IoCloseSharp, IoSend } from "react-icons/io5";
import { useSocket } from '../context/SocketProvider';
import { useUser } from '../context/UserContext';

const RoomChat = ({ room, socketId }) => {
  const socket = useSocket(); // Get the socket instance
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const messagesContainerRef = useRef(null);
  const { isLoggedIn, userName } = useUser() || {};

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const message = { text: inputValue, sender: socketId, room,userName };
      console.log("Sending message:", message);

      socket.emit('sendRoomMessage', message); // Emit the event to the server
      setInputValue('');
    }
  };

  // Listen for message confirmations
  useEffect(() => {
    const handleMessageSent = (confirmationMessage) => {
      console.log("Message sent confirmation:", confirmationMessage);
      setMessages((prevMessages) => [...prevMessages, confirmationMessage]);
    };

    socket.on('messageSent', handleMessageSent);

    return () => {
      socket.off('messageSent', handleMessageSent);
    };
  }, [socket]);

  useEffect(() => {
    if (socket) {
      const handleReceiveMessage = (message) => {
        console.log(`Received message:`, message);
        setMessages((prevMessages) => [...prevMessages, message]);
      };

      socket.on("receiveRoomMessage", handleReceiveMessage);

      return () => {
        socket.off("receiveRoomMessage", handleReceiveMessage);
      };
    }
  }, [socket]);




  // Ensure the chat scrolls to the latest message
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Debug connection
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Socket connected with ID:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [socket]);

  return (
    <>
      {isLoggedIn && (
        <div className='relative'>
          <div
            className='w-[3.5vw] h-[3.5vw]  flex items-center justify-center cursor-pointer'
            onClick={toggleChat}
          >
            {!isOpen ? (
              <IoChatboxEllipsesSharp className='text-2xl text-black' />
            ) : (
              <IoCloseSharp className='text-2xl text-black' />
            )}
          </div>
          {isOpen && (
            <div className='fixed bottom-[10%] right-[2%] w-[25vw] h-[55vh] bg-white border border-gray-300 shadow-lg rounded-xl overflow-hidden'>
              <div className='border-b-[1px] p-4'>
                <h2 className='font-bold'>Chat Window</h2>
              </div>
              <div className='w-full h-full'>
                <div
                  className='w-full h-[39vh] flex flex-col overflow-y-auto overflow-x-hidden px-2'
                  ref={messagesContainerRef}
                >
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex flex-col ${msg.sender === socketId
                          ? 'justify-start items-end'
                          : 'justify-end items-start'
                        }`}
                    >
                      <div
                        className={`p-2 m-2 max-w-[45%] rounded-lg text-sm ${msg.sender === socketId
                            ? 'bg-[#199FD9] text-white'
                            : 'bg-gray-300 text-black'
                          }`}
                      >
                        {msg.userName && ( // Display username below the message
                        <div className="text-[0.8rem] text-black font-medium">
                          {msg.userName}
                        </div>
                      )}
                        {msg.text}
                      </div>
                      
                    </div>
                  ))}
                </div>
                <div className='w-full border-t-[1px] h-[7vh] px-4 flex items-center justify-around'>
                  <input
                    className='w-[80%] h-full outline-none text-sm'
                    type='text'
                    placeholder='Type a message'
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyPress={(e) =>
                      e.key === 'Enter' ? handleSendMessage() : null
                    }
                  />
                  <div
                    className='w-[2vw] h-[2vw] bg-[#199FD9] rounded-full flex items-center justify-center cursor-pointer'
                    onClick={handleSendMessage}
                  >
                    <IoSend className='text-xs text-white' />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default RoomChat;
