import React, { useEffect, useState } from 'react'
import { SlArrowDown } from "react-icons/sl";
import { NavLink, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useDoctor } from '../context/DoctorContext';
import axios from 'axios';
import { RiMessage2Fill } from "react-icons/ri";

const Navbar = () => {
    const { doctor, isDoctorLoggedIn, setisDoctorLoggedIn } = useDoctor() || {};
    const [userInfo, setUserInfo] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const { 
        userId, 
        userName, 
        isPrivateMode, 
        setIsPrivateMode, 
        isLoggedIn, 
        setisLoggedIn 
    } = useUser() || {};
    const navigate = useNavigate();
    
    // console.log(isPrivateMode);

    useEffect(() => {
        const storedPrivateMode = JSON.parse(localStorage.getItem('privateMode'));
        if (storedPrivateMode !== null) {
            setIsChecked(storedPrivateMode);
            setIsPrivateMode(storedPrivateMode);
        }
    }, [setIsPrivateMode]);

    const handleCheckboxChange = async () => {
        try {
            const newCheckedState = !isChecked;

            // Update state and local storage
            setIsChecked(newCheckedState);
            setIsPrivateMode(newCheckedState);
            localStorage.setItem('privateMode', JSON.stringify(newCheckedState));

            // Make API call to update private mode on backend
            await axios.put(`http://localhost:3000/users/${userId}/privateMode`, {
                privateMode: newCheckedState,
            });
        } catch (error) {
            console.error('Error updating private mode:', error);
        }
    };

    const handleLogout = async () => {
        try {

            const response = await axios.post('http://localhost:3000/users/logout');
            localStorage.clear();
            setisLoggedIn(false);
            setUserInfo(false);
            navigate('/');

        } catch (error) {
            console.error('Logout failed:', error);
        }
    };
    const handleDoctorLogout = async () => {
        try {

            const response = await axios.post('http://localhost:3000/doctor/logoutDoctor');
            localStorage.clear();
            setisDoctorLoggedIn(false);
            setUserInfo(false); 

        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    
    return (
        <>
            <div className='w-full h-[11vh]  flex items-center '>
                <div className='w-[15%] h-full flex items-center justify-center '>
                    <img className='w-[50%] h-[50%] object-contain mt-1' src="/images/practo-logo.svg" alt="practoLogo" />
                </div>
                <div className='w-[30%] h-full flex items-center gap-5'>
                    <div className=''>
                        <h1 className='font-semibold tracking-tight text-[0.9rem]'>Find Doctors</h1>
                    </div>
                    <NavLink to="/" className='py-[10px] flex items-center border-b-4 border-[#199FD9]'>
                        <h1 className='font-semibold tracking-tight text-[#28328c] text-[0.9rem] mt-1'>Video Consult</h1>
                    </NavLink >
                    <div className=''>
                        <h1 className='font-semibold tracking-tight text-[0.9rem]'>Surgeries</h1>
                    </div>
                </div>
                <div className='h-full w-[55%]  flex items-center  gap-4 pl-52'>
                    <div className='flex items-center justify-center gap-1'>
                        <span className='px-1 py-[0.1rem] bg-[#28328c] rounded-xl text-[0.5rem] text-white mt-[0.1rem]'>NEW</span>
                        <span className='text-[0.8rem]'>For Corporates</span>
                        <span><SlArrowDown className='text-[0.6rem] font-bold mt-[0.2rem]' /></span>
                    </div>
                    <div className='flex items-center gap-1'>

                        <span className='text-[0.8rem]'>For Providers</span>
                        <span><SlArrowDown className='text-[0.6rem] font-bold mt-[0.2rem]' /></span>
                    </div>
                    <div className='flex items-center gap-1'>

                        <span className='text-[0.8rem]'>Security&help</span>
                        <span><SlArrowDown className='text-[0.6rem] font-bold mt-[0.2rem]' /></span>
                    </div>

                    {
                        isLoggedIn && <NavLink to="/chat"><RiMessage2Fill className='text-lg' /></NavLink>
                    }
                    {isLoggedIn ? (
                        <div className='flex gap-2 items-center relative cursor-pointer select-none'>

                            <div onClick={() => setUserInfo(!userInfo)} className='flex items-center justify-center gap-2'>
                                <p className='text-[0.8rem] font-semibold'>
                                    {isPrivateMode === true ?"Anonym...":userName}
                                </p>
                                <span><SlArrowDown className='text-[0.6rem] font-bold mt-[0.2rem]' /></span>
                            </div>

                            {userInfo && <div style={{ boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.11)' }} className='absolute w-[15vw]   top-7 right-0 bg-white shadow-xl  rounded-md p-4 flex flex-col gap-3'>
                                <div className='flex gap-3 px-2'><img className='w-[3vw] ' src="/images/thumbnail.png" alt="" /><h1 className='text-[0.8rem] font-semibold'>{isPrivateMode === true ?"Anonym...":userName}</h1></div>
                                <div className='flex gap-2'>
                                    <div className="flex items-center">
                                        <label className="flex cursor-pointer select-none items-center">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={handleCheckboxChange}
                                                    className="sr-only" 
                                                />
                                                <div className="block h-[1.3rem] w-9 rounded-full border border-[#BFCEFF] bg-[#EAEEFB]"></div>
                                                <div
                                                    className={`dot bg-primary absolute top-[2px] left-0 h-4 w-4 rounded-full transition-transform duration-300 ${isPrivateMode === true ? 'translate-x-4' : 'translate-x-1'}`}

                                                ></div>
                                            </div>
                                        </label>
                                    </div>
                                    <h1 className='text-sm '>Private Mode</h1></div>
                                <div onClick={handleLogout} ><h1 className='text-sm'>Logout</h1></div>
                            </div>}
                        </div>

                    ) : isDoctorLoggedIn ? (
                        <div className='flex gap-2 items-center'>
                            <p className='text-[0.8rem] font-semibold'>
                                {doctor.length > 8 ? `Dr. ${doctor.substring(0, 5)}...` : doctor}
                            </p>
                            <button onClick={handleDoctorLogout} className='py-1 px-2 border-[1px] text-[0.7rem] rounded-md border-[#dadada] text-gray-800 transition-all ease-in-out duration-100 hover:text-[#199FD9] hover:border-[#88c1da]'>Logout</button>
                        </div>
                    ) : (
                        <NavLink to="/signup" className='flex items-center justify-center gap-1'>
                            <button className='py-1 px-2 border-[1px] text-[0.7rem] rounded-md border-[#dadada] text-gray-800 transition-all ease-in-out duration-100 hover:text-[#199FD9] hover:border-[#88c1da]'>Login / Signup</button>
                        </NavLink>
                    )}

                </div>
            </div>
        </>
    )
}

export default Navbar