import React, { useEffect, useState } from 'react'
import { SlArrowDown } from "react-icons/sl";
import { NavLink, useNavigate  } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import axios from 'axios';

const Navbar = () => {
    const { userName } = useUser() || {};
    const [isLoggedIn, setIsLoggedIn] = useState(!!userName);

    console.log(userName);
    
    const handleLogout = async () => {
        try {
            
            const response = await axios.post('http://localhost:3000/users/logout');
            localStorage.clear();
            setIsLoggedIn(false);
          
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    useEffect(() => {
        setIsLoggedIn(!!userName); 
    }, [userName]);

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
                    {isLoggedIn ? (<div className='flex gap-2 items-center'>
                        <p className='text-[0.8rem] font-semibold'>
                            {userName.length > 8 ? `${userName.substring(0, 8)}...` : userName}
                        </p>
                        <button onClick={handleLogout} className='py-1 px-2 border-[1px] text-[0.7rem] rounded-md border-[#dadada] text-gray-800 transition-all ease-in-out duration-100 hover:text-[#199FD9] hover:border-[#88c1da]'>Logout</button></div>
                    ) : (
                        <NavLink to="/signup" className='flex items-center justify-center gap-1' >
                            <button  className='py-1 px-2 border-[1px] text-[0.7rem] rounded-md border-[#dadada] text-gray-800 transition-all ease-in-out duration-100 hover:text-[#199FD9] hover:border-[#88c1da]'>Login / Signup</button>
                        </NavLink>)}

                </div>
            </div>
        </>
    )
}

export default Navbar