import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useUser } from '../../context/UserContext';
import { IoSearchSharp } from "react-icons/io5";

const PotentialChats = () => {
    const { userId } = useUser() || {};
    const chatContext = useChat();
    const { potentialChats, createChat, onlineUsers } = chatContext || {};
    
    const [searchQuery, setSearchQuery] = useState(''); 

    
    const filteredChats = potentialChats?.filter((u) =>
        u.fullname.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
         
            <div className='w-full flex justify-center'>
            <div className='w-[90%] flex items-center justify-center bg-white mt-4 rounded-md'>
            <IoSearchSharp className='text-black text-lg rotate-90' />
            <input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className=" p-2  w-[85%] focus:outline-none  text-black"
            /></div>
            </div>

            
           <div className='overflow-y-auto potentialChats'>
           {filteredChats?.length > 0 ? (
                filteredChats.map((u, index) => (
                    <div className="flex justify-between items-center px-4 py-2 " key={index}>
                        <div className="flex gap-1 items-center">
                            <h2 className="text-sm">
                                {u.privateMode === false ? u.fullname : 'Anonymous'}
                            </h2>
                            <div
                                className={
                                    onlineUsers?.some((user) => user?.userId === u?._id)
                                        ? 'w-[0.7vw] h-[0.7vw] bg-green-500 rounded-full'
                                        : ''
                                }
                            ></div>
                        </div>
                        <span
                            onClick={() => createChat(userId, u._id)}
                            className="py-1 px-2 text-sm bg-[#1E2E33] rounded-md text-white transition-all ease-in-out duration-150 cursor-pointer hover:scale-105"
                        >
                            Start Chat
                        </span>
                    </div>
                ))
            ) : (
                <p className="text-center text-gray-200 my-2">No user found</p>
            )}
           </div>
        </>
    );
};

export default PotentialChats;
