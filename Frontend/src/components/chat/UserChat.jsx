import React, { useState } from 'react';
import { useFetchRecipientUser } from '../../hooks/useFetchRecipient';
import { useChat } from '../../context/ChatContext';
import { IoSearchSharp } from "react-icons/io5";

const UserChat = ({ chat, userId }) => {
  const chatContext = useChat();
  const { recipientUser } = useFetchRecipientUser(chat, userId);
  const { onlineUsers } = chatContext || {};
  const [searchQuery, setSearchQuery] = useState(''); 

  const isOnline = onlineUsers?.some((user) => user?.userId === recipientUser?._id);

  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  
  const filteredUser = recipientUser?.fullname?.toLowerCase().includes(searchQuery.toLowerCase())
    ? recipientUser
    : null;

  return (
    <div className="">
      

      
      <div className='w-full flex justify-center'>
      {/* <div className='w-[90%] flex items-center justify-center bg-white mt-4 rounded-md'>
      <IoSearchSharp className='text-black text-lg rotate-90' />
      <input
        type="text"
        placeholder="Search recipient..."
        value={searchQuery}
        onChange={handleSearchChange}
        className="p-2  w-[85%] focus:outline-none  text-black"
      /></div> */}
      </div>
     <div className='overflow-y-auto userChats '>
     {filteredUser && (
        <div className="flex gap-2 items-center transition-all ease-in-out duration-150 hover:bg-[#0e587e] cursor-pointer px-4 py-2">
          <div className="w-[15%] relative">
            <img
              className="w-[2.5vw] rounded-full"
              src="/images/userAvatar.png"
              alt="Avatar"
            />
            <div
              className={
                isOnline
                  ? 'w-[0.7vw] h-[0.7vw] bg-green-400 rounded-full absolute right-[22%] top-[63%]'
                  : ''
              }
            ></div>
          </div>
          <div className="flex w-[85%] items-center justify-between">
            <div className="w-[70%]">
              <h3 className="text-sm">
                {filteredUser?.privateMode === false
                  ? filteredUser?.fullname
                  : 'Anonymous'}
              </h3>
            </div>
            <div className="flex flex-col items-end gap-1">
           
            </div>
          </div>
        </div>
      )}
     </div>

      {/* Display a message if no user matches the search */}
      {!filteredUser && searchQuery && (
        <p className="text-center text-gray-200 my-2">No recipient found.</p>
      )}
    </div>
  );
};

export default UserChat;
