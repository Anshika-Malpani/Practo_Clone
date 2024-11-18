import React, { useState, useEffect, useRef } from 'react';
import { IoChatboxEllipsesSharp } from "react-icons/io5";
import { IoCloseSharp } from "react-icons/io5";
import { IoSend } from "react-icons/io5";
import { useSocket } from '../context/SocketProvider'; 
import { useUser } from '../context/UserContext';

const RoomChat = ({room}) => {
  const socket = useSocket(); // Get the socket instance
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const messagesContainerRef = useRef(null);
  const [socketId, setSocketId] = useState(null); 
  const { isLoggedIn } = useUser() || {};
 

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const message = { text: inputValue, sender: socketId, room: room };
      socket.emit('sendRoomMessage', message); 
      setInputValue(''); 
    }
  };

  useEffect(() => {
   
    socket.on('messageSent', (confirmationMessage) => {
      setMessages(prevMessages => [...prevMessages, confirmationMessage]); 
    });

    return () => {
      socket.off('messageSent');
    };
  }, [socket]);

  
  useEffect(() => {
    
    socket.on("connect", () => {
      setSocketId(socket.id);
    });

    const handleReceiveMessage = (message) => {
     
      if (message.sender !== socketId) {
        setMessages(prevMessages => [...prevMessages, message]); 
      }
    };

    socket.on('receiveRoomMessage', handleReceiveMessage); 

    return () => {
      socket.off('receiveRoomMessage', handleReceiveMessage); 
    };
  }, [socket, socketId]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
    {
      (isLoggedIn) && <div className='relative'>
      <div
        className='w-[3.5vw] h-[3.5vw] rounded-full bg-[black]  fixed bottom-4 right-8 flex items-center justify-center cursor-pointer'
        onClick={toggleChat}
      >
       { !isOpen ? <IoChatboxEllipsesSharp className='text-xl  text-white' />
       : <IoCloseSharp className='text-xl  text-white' />}
      </div>
      {isOpen && (
        <div className='fixed bottom-[15%] right-[3%] w-[25vw] h-[55vh] bg-white border border-gray-300 shadow-lg rounded-xl overflow-hidden'>
          <div className='border-b-[1px] p-4'><h2 className='font-bold'>Chat Window</h2></div>
          <div className='w-full h-full '>
            <div className='w-full h-[39vh] flex flex-col overflow-y-auto overflow-x-hidden' ref={messagesContainerRef}>
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === socketId ? 'justify-end items-start ' : 'justify-start items-end'}`}>
                  <div className={`p-2 m-2 max-w-[45%] rounded-lg text-xs ${msg.sender === socketId ? 'bg-[#199FD9] text-white' : 'bg-gray-300 text-black'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div className='w-full border-t-[1px] h-[7vh] px-4 flex items-center justify-around'>
                <input
                  className='w-[80%] h-full outline-none text-sm'
                  type="text"
                  placeholder='Type a message'
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyPress={(e) => e.key === 'Enter' ? handleSendMessage() : null}
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
    }
    </>
  );
}

export default RoomChat;
