import React, { createContext, useContext, useState, useEffect } from 'react';

const DoctorContext = createContext();

export const DoctorProvider = ({ children }) => {
  const [doctor, setDoctor] = useState(() => localStorage.getItem('doctor') || '');
  const [isDoctorLoggedIn, setisDoctorLoggedIn] = useState(false);
  const [doctorId, setDoctorId] = useState(() => localStorage.getItem('doctorId') || '');
  

  useEffect(() => {
    if (doctor) {
      localStorage.setItem('doctor', doctor);
      localStorage.setItem('doctorId', doctorId);
      setisDoctorLoggedIn(true);
    } else {
      localStorage.removeItem('doctor');
      localStorage.removeItem('doctorId');
    }
  }, [doctor]);

  return (
    <DoctorContext.Provider value={{ doctor, setDoctor, isDoctorLoggedIn,setisDoctorLoggedIn,doctorId,setDoctorId }}>
      {children}
    </DoctorContext.Provider>
  );
};

export const useDoctor = () => useContext(DoctorContext);