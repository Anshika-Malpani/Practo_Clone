import React, { useEffect, useState } from 'react';
import { IoClose } from "react-icons/io5";
import { useSocket } from '../context/SocketProvider';
import { useUser } from '../context/UserContext';
import axios from 'axios';

const NewMessage = ({ onClose, onStartPrivateChat }) => { // Add onStartPrivateChat prop
  const socket = useSocket();
  const { userName } = useUser() || {};
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:3000/users/allUsers');
        setUsers(response.data);
        setFilteredUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    setFilteredUsers(
      users
        .filter(user => user.fullname.toLowerCase() !== userName.toLowerCase())
        .filter(user => user.fullname.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, users, userName]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleUserClick = (user) => {
    const roomName = [userName, user.fullname].sort().join('-');
    socket.emit('joinRoom', roomName);
    onStartPrivateChat(user, roomName); // Call the function to start private chat
  };

  return (
    <div className='h-[55vh] '>
      <div className='border-b-[1px] border-gray-400 p-4 flex justify-between items-center h-[15%]'>
        <h2 className='font-bold'>New Message</h2>
        <div className='cursor-pointer' onClick={onClose}>
          <IoClose className='text-gray-500' />
        </div>
      </div>
      <div className='h-[85%] flex flex-col'>
        <div className='flex items-center border-b-[1px] border-gray-400 p-2 gap-2'>
          <span>To:</span>
          <input
            className='outline-none'
            type="text"
            placeholder='Type a name'
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className='flex-1 overflow-y-auto'>
          {filteredUsers.map(user => (
            <div
              key={user._id}
              className='p-3 border-b-[1px] border-gray-300 flex gap-4 cursor-pointer transition-all ease-in-out duration-150 hover:bg-gray-300'
              onClick={() => handleUserClick(user)}
            >
              <div><img className='w-[2.5vw] rounded-full' src="/images/thumbnail.png" alt="" /></div>
              <div className='flex items-center'><h3 className='font-medium tracking-tight'>{user.fullname}</h3></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewMessage;