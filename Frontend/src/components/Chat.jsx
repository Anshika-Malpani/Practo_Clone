import React from 'react'
import { useChat } from '../context/ChatContext';
import UserChat from './chat/UserChat';
import { useUser } from '../context/UserContext';
import PotentialChats from './chat/PotentialChats';
import ChatBox from './chat/ChatBox';

const Chat = () => {
  const { userId } = useUser() || {};
  const chatContext = useChat();
  const { userChats, isUserChatsLoading, updateCurrentChat } = chatContext || {};
  // console.log("UserChats",userChats);

  return (
    <>
      <div className='w-full h-[89vh] flex items-center justify-center'>
        {userChats?.length < 0 ? null : (
          <div className='flex gap- w-[60vw] h-[75vh] bg-[#199FD9] text-white rounded-md overflow-hidden chat'>
            <div className='flex flex-col w-[40%]'>
            <div className=' flex flex-col gap-2  h-[22vh] border-b-[1px] border-white'><PotentialChats /></div>
            <div className='w-full'>
              {isUserChatsLoading && <p>Loading chats...</p>}
              {userChats?.map((chat, index) => {
                console.log(chat);
                
                return (
                  <div key={index} onClick={()=>updateCurrentChat(chat)}>
                    
                    <UserChat chat={chat} userId={userId} />
                  </div>
                )
              })}
            </div>
            </div>
            <ChatBox/>
          </div>
        )}
      </div>
    </>
  )
}

export default Chat