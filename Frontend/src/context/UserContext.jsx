import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userName, setUserName] = useState(() => localStorage.getItem('userName') || '');
  const [userId, setUserId] = useState(() => localStorage.getItem('userId') || '');
  const [isLoggedIn, setisLoggedIn] = useState(false);
  const [isPrivateMode, setIsPrivateMode]=useState(() => localStorage.getItem('privateMode') || '')
  

  useEffect(() => {
    if (userName && userId) {
      
      localStorage.setItem('userName', userName);
      localStorage.setItem('userId', userId);
      localStorage.setItem('privateMode', isPrivateMode);
      setisLoggedIn(true);
    } else {
      localStorage.removeItem('userName');
      localStorage.removeItem('userId');
      localStorage.removeItem('privateMode');
    }
  }, [userName]);

  return (
    <UserContext.Provider value={{ userName, setUserName, isLoggedIn,setisLoggedIn,isPrivateMode,setIsPrivateMode,userId,setUserId }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);