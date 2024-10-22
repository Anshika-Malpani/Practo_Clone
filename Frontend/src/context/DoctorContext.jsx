import React, { createContext, useContext, useState, useEffect } from 'react';

const DoctorContext = createContext();

export const DoctorProvider = ({ children }) => {
  const [doctor, setDoctor] = useState(() => localStorage.getItem('doctor') || '');
  const [isDoctorLoggedIn, setisDoctorLoggedIn] = useState(false);
  

  useEffect(() => {
    if (doctor) {
      localStorage.setItem('doctor', doctor);
      setisDoctorLoggedIn(true);
    } else {
      localStorage.removeItem('doctor');
    }
  }, [doctor]);

  return (
    <DoctorContext.Provider value={{ doctor, setDoctor, isDoctorLoggedIn,setisDoctorLoggedIn }}>
      {children}
    </DoctorContext.Provider>
  );
};

export const useDoctor = () => useContext(DoctorContext);