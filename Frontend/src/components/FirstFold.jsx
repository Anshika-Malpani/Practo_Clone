import React from 'react'
import Features from './Features'
import { LiaAwardSolid, LiaDigitalTachographSolid } from "react-icons/lia";
import { useNavigate } from "react-router-dom";
import { MdOutlineMessage } from "react-icons/md";
import { NavLink } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useDoctor } from '../context/DoctorContext';
import { useState } from 'react';
import { useSocket } from "../context/SocketProvider";
import { useEffect } from 'react';

const FirstFold = () => {
    const { isLoggedIn, setisLoggedIn } = useUser() || {};
    const { isDoctorLoggedIn, setisDoctorLoggedIn } = useDoctor() || {};
    const [roomCode, setRoomCode] = useState(null);
    const [isHost, setIsHost] = useState(false);
    const socket = useSocket();
    const navigate = useNavigate();
   

    const createRoom = () => {
        console.log("Emitting create-room event");
        socket.emit("create-roomCode", (code) => {
            console.log("Room code received:", code);
            setRoomCode(code);
            setIsHost(true);
        });
    };

    useEffect(() => {
        if (roomCode) {
            navigate(`/videoCall/${roomCode}`); // Navigate to videoCall page when roomCode is set
        }
    }, [roomCode, navigate]);
   

    return (
        <>
            <div className='w-full h-[58vh] bg-[#F8E9E6] flex items-center px-24 pt-12'>
                <div className='w-[45%] h-full  flex flex-col gap-5'>

                    <div >
                        <h1 className='text-[2.1rem] font-semibold tracking-tight leading-tight'>Skip the travel!</h1>
                        <h1 className='text-[2.1rem] font-semibold tracking-tight leading-tight'>Take Online Doctor Consultation</h1>
                        <div><p className='text-lg'>Private consultation + Audio call · Starts at just ₹199</p></div>
                    </div>


                    <div className='flex items-center gap-2'>
                        <div className='flex'>
                            <span className='rounded-full bg-white w-[3vw] h-[3vw] flex items-center justify-center relative z-10'>
                                <img className='w-[85%] h-[85%] rounded-full' src="/images/doctor1.jpeg" alt="" />
                            </span>
                            <span className='rounded-full bg-white w-[3vw] h-[3vw] flex items-center justify-center relative z-20 -translate-x-2'>
                                <img className='w-[85%] h-[85%] rounded-full' src="/images/doctor2.jpeg" alt="" />
                            </span>
                            <span className='rounded-full bg-white w-[3vw] h-[3vw] flex items-center justify-center relative z-30 -translate-x-4' >
                                <img className='w-[85%] h-[85%] rounded-full' src="/images/doctor3.jpeg" alt="" />
                            </span>
                        </div>
                        <span className='-ml-1'>+191 Doctors are online</span>
                        <div><span className='inline-block w-[8px] h-[8px] rounded-full bg-[#aae000] pulse'></span></div>
                    </div>

                    <div className='flex gap-5'>
                        {
                            isLoggedIn && !isDoctorLoggedIn ? (
                                <div className='flex gap-4'>
                                    {/* <NavLink to="/consultnow">
                <button className='bg-[#199FD9] px-5 py-2 text-white rounded-md text-lg font-semibold'>Consult Now</button>
            </NavLink> */}

                                    <button onClick={createRoom} className='bg-[#199FD9] px-5 py-2 text-white rounded-md text-lg font-semibold'>New Meeting</button>



                                    <NavLink to="/lobby">
                                        <button className='bg-[#199FD9] px-5 py-2 text-white rounded-md text-lg font-semibold'>Join Lobby</button>
                                    </NavLink>
                                </div>
                            ) : null
                        }
                        {
                            isDoctorLoggedIn ? (
                                <NavLink to="/schedulemeet">
                                    <button className='bg-[#199FD9] px-5 py-2 text-white rounded-md text-lg font-semibold'>Schedule Meeting</button>
                                </NavLink>
                            ) : (
                                !isLoggedIn && (
                                    <NavLink to="/signup">
                                        <button className='bg-[#199FD9] px-5 py-2 text-white rounded-md text-lg font-semibold'>Consult Now</button>
                                    </NavLink>
                                )
                            )
                        }

                    </div>

                    <div className='flex items-center gap-3 mt-6'>
                        <Features icon={<LiaAwardSolid className='text-[1.2rem] mt-[0.2rem]' />} feature="Verified Doctors" />
                        <Features icon={<LiaDigitalTachographSolid className='text-[1.2rem] mt-[0.2rem]' />} feature="Digital Prescription" />
                        <Features icon={<MdOutlineMessage className='text-[1rem] mt-[0.2rem]' />} feature="Free Followup" />
                    </div>

                </div>
                <div className='w-[55%] h-full '>

                    <img className='h-[90%] w-[98%] mt-8 ml-9' src="/images/homepage-hero-image-.png" alt="" />

                </div>
            </div>
        </>
    )
}

export default FirstFold