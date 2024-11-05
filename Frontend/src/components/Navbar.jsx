import React, { useEffect, useState } from 'react'
import { SlArrowDown } from "react-icons/sl";
import { NavLink, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useDoctor } from '../context/DoctorContext';
import axios from 'axios';
import { RiMessage2Fill } from "react-icons/ri";
import { IoMdNotifications } from "react-icons/io";

const Navbar = () => {
    const { doctor, isDoctorLoggedIn, setisDoctorLoggedIn, doctorId } = useDoctor() || {};
    const [userInfo, setUserInfo] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)
    const [isChecked, setIsChecked] = useState(false);
    const [consultations, setConsultations] = useState([]);
    const {
        userId,
        userName,
        isPrivateMode,
        setIsPrivateMode,
        isLoggedIn,
        setisLoggedIn
    } = useUser() || {};
    const [meetings, setMeetings] = useState([]);
    const navigate = useNavigate();

    // console.log(isPrivateMode);

    // console.log(consultations);
    const filteredConsultations = consultations.filter(consultation => consultation.status !== 'scheduled');
    const scheduledMeetings = meetings.filter(meeting => meeting.date && meeting.time);
    
    


    useEffect(() => {
        const storedPrivateMode = JSON.parse(localStorage.getItem('privateMode'));
        if (storedPrivateMode !== null) {
            setIsChecked(storedPrivateMode);
            setIsPrivateMode(storedPrivateMode);
        }
    }, [setIsPrivateMode]);

    useEffect(() => {
        const fetchConsultations = async () => {
            try {
                if (isDoctorLoggedIn) {
                    const response = await axios.get(`http://localhost:3000/doctor/${doctorId}/consultations`);
                    // console.log(response);

                    setConsultations(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch consultations:', error);
            }
        };
        fetchConsultations();
    }, [isDoctorLoggedIn, doctor]);

    useEffect(() => {
        const fetchUserMeetings = async () => {
            if (isLoggedIn && userId) {
                try {
                    const response = await axios.get(`http://localhost:3000/users/${userId}/meetings`);
                    setMeetings(response.data);
                } catch (error) {
                    console.error('Error fetching meetings:', error);
                }
            }
        };
        fetchUserMeetings();
    }, [isLoggedIn, userId]);

    const handleCheckboxChange = async () => {
        try {
            const newCheckedState = !isChecked;

           
            setIsChecked(newCheckedState);
            setIsPrivateMode(newCheckedState);
            localStorage.setItem('privateMode', JSON.stringify(newCheckedState));

           
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

                    {isLoggedIn && (
                <div className="relative cursor-pointer">
                    <IoMdNotifications onClick={() => setIsNotificationOpen(!isNotificationOpen)} className="text-2xl text-gray-700 hover:text-[#199FD9] transition duration-300" />
                    
                    {scheduledMeetings.length > 0 && (
                        <div className="absolute w-[0.8rem] h-[0.8rem] bg-red-500 text-white text-[0.75rem] rounded-full flex items-center justify-center right-0 bottom-0 animate-bounce">
                            {scheduledMeetings.length}
                        </div>
                    )}

                    {isNotificationOpen && (
                        <div className="absolute w-[22vw] max-w-xs top-8 -right-4 bg-white shadow-lg rounded-lg p-4">
                            <h2 className="text-lg font-semibold mb-3 text-gray-800">Scheduled Meetings</h2>
                            {scheduledMeetings.length > 0 ? (
                                scheduledMeetings.map(meeting => (
                                    <div key={meeting._id} className="p-3 border-[2px] border-gray-200 rounded-lg mb-3">
                                        <h3 className="text-sm font-medium text-gray-900">
                                            Meeting with Dr. {meeting.doctor} scheduled on {meeting.date} at {meeting.time}.
                                        </h3>
                                        <p className="text-gray-600">{meeting.description}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-600">No scheduled meetings.</p>
                            )}
                        </div>
                    )}
                </div>
            )}



                    {isDoctorLoggedIn && (
                        <div
                            className="relative cursor-pointer"
                        >
                            <IoMdNotifications onClick={() => setIsNotificationOpen(!isNotificationOpen)} className="text-2xl text-gray-700 hover:text-[#199FD9] transition duration-300" />

                            {filteredConsultations.length > 0 && (
                                <div
                                    className="absolute w-[0.8rem] h-[0.8rem] bg-red-500 text-white text-[0.75rem] 
                rounded-full flex items-center justify-center right-0 bottom-0 animate-bounce"
                                >
                                    {filteredConsultations.length}
                                </div>
                            )}

                            {isNotificationOpen && (
                                <div
                                    className="absolute w-[22vw] max-w-xs top-8 -right-4 bg-white shadow-lg rounded-lg 
                p-4 transition-transform transform origin-top-right scale-100"
                                >
                                    <h2 className="text-lg font-semibold mb-3 text-gray-800">
                                        Notifications
                                    </h2>

                                    {filteredConsultations.length > 0 ? (
                                        
                                        filteredConsultations.map((consultation) => (
                                            
                                            <div
                                                key={consultation._id}
                                                className="p-3 border-[2px] border-gray-200 rounded-lg mb-3 
                            hover:shadow-md transition duration-300"
                                            >
                                                <h3 className="text-sm font-medium text-gray-900">
                                                    <span className="text-gray-500">You have a consultation request from </span>
                                                    {consultation.patientName} <span className='font-medium text-gray-500'>for</span>
                                                    <span className="font-semibold"> {consultation.specialization}</span>.
                                                </h3>
                                                <div className="mt-2 flex gap-2">
                                                    <button
                                                        className="w-full px-2 py-1 border border-gray-300 
                                    rounded-md text-sm text-gray-600 hover:bg-gray-100 transition tracking-tighter font-medium"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <NavLink onClick={() => setIsNotificationOpen(!isNotificationOpen)} to={`/schedulemeet?consultationId=${consultation._id}`}
                                                        className="w-full px-2 py-1 bg-[#199FD9] rounded-md 
                                    text-sm tracking-tighter font-medium text-white hover:bg-[#1078B5] transition"
                                                    >
                                                        Schedule Meeting
                                                    </NavLink>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-600">No new notifications.</p>
                                    )}
                                </div>
                            )}

                        </div>
                    )}




                    {
                        isLoggedIn && <NavLink to="/chat"><RiMessage2Fill className='text-xl' /></NavLink>
                    }
                    {isLoggedIn ? (
                        <div className='flex gap-2 items-center relative cursor-pointer select-none'>

                            <div onClick={() => setUserInfo(!userInfo)} className='flex items-center justify-center gap-2'>
                                <p className='text-[0.8rem] font-semibold'>
                                    {isPrivateMode === true ? "Anonym..." : userName}
                                </p>
                                <span><SlArrowDown className='text-[0.6rem] font-bold mt-[0.2rem]' /></span>
                            </div>

                            {userInfo && <div style={{ boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.11)' }} className='absolute w-[15vw]   top-7 right-0 bg-white shadow-xl  rounded-md p-4 flex flex-col gap-3'>
                                <div className='flex gap-3 px-2'><img className='w-[3vw] ' src="/images/thumbnail.png" alt="" /><h1 className='text-[0.8rem] font-semibold'>{isPrivateMode === true ? "Anonym..." : userName}</h1></div>
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