import React, { useEffect, useRef, useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useUser } from '../../context/UserContext';
import { useFetchRecipientUser } from '../../hooks/useFetchRecipient';
import moment from 'moment';
import InputEmoji from 'react-input-emoji';
import { IoMdSend } from 'react-icons/io';
import { IoMdAttach } from "react-icons/io";

const ChatBox = () => {
  const { userId } = useUser() || {};
  const chatContext = useChat();
  const { currentChat, messages, ismessagesLoading, sendTextMessage } = chatContext || {};
  const { recipientUser } = useFetchRecipientUser(currentChat, userId);
  const [textMessage, setTextMessage] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null); 
  const chatBoxRef = useRef(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
  
    if (mediaFile) {
      const fileReader = new FileReader();
      fileReader.onloadend = () => {
        setMediaPreview(fileReader.result);
      };
      fileReader.readAsDataURL(mediaFile);
    } else {
      setMediaPreview(null); 
    }
  }, [mediaFile]);

  if (!recipientUser) {
    return (
      <p className='w-[60%] text-center h-full bg-gray-100 text-black flex items-center justify-center'>
        No conversation selected yet...
      </p>
    );
  }

  if (ismessagesLoading) {
    return (
      <p className='w-[60%] text-center h-full bg-gray-100 text-black flex items-center justify-center'>
        Loading Chat...
      </p>
    );
  }

  const handleFileChange = (e) => {
    console.log(e.target.files[0]);
    setMediaFile(e.target.files[0]);
  };

  const handleSendMessage = () => {
    if (textMessage.trim() === '' && !mediaFile) return; // Prevent sending empty messages

    const messageData = {
      text: textMessage,
      chatId: currentChat._id,
      senderId: userId,
      media: mediaFile ? mediaFile : null,
    };

    // Send message data including media if present
    sendTextMessage(messageData);

    // Reset input fields
    setTextMessage(''); // Clear text message input
    setMediaFile(null); // Reset file input after sending
  };

  return (
    <div className='w-[60%] h-full bg-gray-100 text-black transition-all ease-out duration-100 pr-1'>
      {/* Header */}
      <div className='w-full h-[13%] border-b-[1px] border-gray-600 flex items-center px-4'>
        <img className='w-[3vw]' src='/images/userAvatar.png' alt='' />
        <p className='ml-2 font-medium text-sm'>
          {recipientUser.privateMode === false ? recipientUser.fullname : 'Anonymous'}
        </p>
      </div>

      {/* Messages */}
      <div ref={chatBoxRef} className='w-full h-[76%] p-2 gap-2 overflow-y-auto chatBox relative'>
        {messages &&
          messages.map((message, index) => (
            <div
              key={index}
              className={`${message?.senderId === userId
                ? 'p-2 w-full text-white flex gap-2 justify-end'
                : 'p-2 w-full rounded-md text-white flex gap-2 justify-start'
                }`}
            >
              <p className='text-[0.7rem] text-black'>
                {message?.senderId === userId ? null : (recipientUser.privateMode ? 'Anonymous' : recipientUser.fullname.split(' ')[0])}
              </p>
              <div
                className={`${message?.senderId === userId
                  ? 'bg-[#199FD9] max-w-[50%] p-2 rounded-md flex gap-2'
                  : 'bg-gray-500 p-2 max-w-[50%] text-white rounded-md flex gap-2'
                  }`}
              >
                {message.text != "null"  && <p className='text-sm'>{message.text}</p>}
                {message.media && (
                  <div className="mt-1">
                    {message.media.type.startsWith('image') ? (
                      <img src={message.media.url} alt="media" className="max-w-[10vw] h-auto rounded-md" />
                    ) : (
                      <video controls  muted  className="max-w-full h-auto rounded-md"  onError={(e) => console.error('Video failed to load', e)}>
                       <source src={message.media.url} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                )}
                <p className='text-[0.6rem] mt-[5%]'>
                  {moment(message.createdAt).format('hh:mm A')}
                </p>
              </div>
              <p className='text-[0.7rem] text-black'>
                {message?.senderId === userId ? 'Me' : null}
              </p>
            </div>
          ))}
          {mediaPreview && (
                    <div className='mt-2 fixed bottom-28  bg-gray-300 max-w-[20vw] h-[20vh] rounded-md flex items-center justify-center'>
                        
                        {mediaPreview.startsWith('data:image/') ? (
                            <img src={mediaPreview} alt="media preview" className="w-[95%] h-[95%]" />
                        ) : (
                            <video controls  muted  className="w-full h-full rounded-md">
                                <source src={mediaPreview} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        )}
                    </div>
                )}

      </div>

      {/* Input Section */}
      <div className='w-full h-[11%] border-t-[1px] border-gray-400 flex items-center pr-3 gap-2 relative'>
        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          className='hidden'
          id='fileInput'
        />
        <label htmlFor="fileInput" className="cursor-pointer">
          <span className="text-[#199FD9] "><IoMdAttach className='text-xl ml-2' /></span>
        </label>
        <InputEmoji
          className='custom-emoji-picker'
          value={textMessage}
          onChange={setTextMessage}
          borderColor='rgb(243 244 246 / var(--tw-bg-opacity))'
          background='none'
          borderRadius='0'
        />
        <button
          onClick={handleSendMessage}
          className='w-[2vw] h-[2vw] bg-[#199FD9] rounded-full flex items-center justify-center'
        >
          <IoMdSend className='text-sm' />
        </button>
        
      </div>
    </div>
  );
};

export default ChatBox;
