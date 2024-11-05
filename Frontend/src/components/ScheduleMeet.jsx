import React, { useState } from 'react';
import { useDoctor } from '../context/DoctorContext';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ScheduleMeet = () => {
    const [date, setDate] = useState(''); 
    const [time, setTime] = useState(''); // Separate state for time
    const [description, setDescription] = useState(''); 
    const { doctor } = useDoctor() || {};
    const query = new URLSearchParams(useLocation().search);
    const consultationId = query.get('consultationId'); 
    const navigate = useNavigate(); // Hook for navigation

    const handleScheduleMeeting = async () => {
        try {
            const response = await axios.post('http://localhost:3000/meeting/schedule-meeting', {
                consultationId,
                doctor: `Dr. ${doctor}`, // Assuming doctor is a string
                date,
                time,
                description,
            });

            await axios.patch(`http://localhost:3000/consultation/${consultationId}`, { status: 'scheduled' });
            // Navigate to another page or show success message
            navigate('/'); // Redirect to a success page (create this route)

        } catch (error) {
            console.error('Error scheduling meeting:', error);
            // Handle the error case here
            alert('Failed to schedule the meeting. Please try again.');
        }
    };

    return (
        <>
            <div className='w-full h-[89vh] flex items-center justify-center bg-gray-100'>
                <div className='w-[30vw] bg-white border border-gray-200 rounded-lg shadow-lg flex flex-col gap-4'>
                    <div className='px-5 pt-2'><h1 className='text-lg font-semibold'>Schedule the Meeting</h1></div>
                    <div className='flex flex-col gap-4 w-[90%] px-5 py-1'>
                        <div className='flex justify-between'>
                            <h3 className='text-sm font-medium w-[50%]'>Assignee</h3>
                            <p className='text-sm font-medium w-[50%]'>Dr. {doctor}</p>
                        </div>
                        <div className='flex justify-between'>
                            <h3 className='text-sm font-medium w-[50%]'>Meeting date*</h3>
                            <input type='date' className='text-sm font-medium text-[#199FD9] w-[50%] outline-none' required onChange={(e) => setDate(e.target.value)} />
                        </div>
                        <div className='flex justify-between'>
                            <h3 className='text-sm font-medium w-[50%]'>Meeting time*</h3>
                            <input type='time' className='text-sm font-medium text-[#199FD9] w-[50%] outline-none' required onChange={(e) => setTime(e.target.value)} />
                        </div>
                    </div>

                    <div className='flex flex-col gap-2 px-5 py-2'>
                        <h3 className='text-sm font-medium'>Description</h3>
                        <textarea className='w-full border-2 border-gray-200 rounded-md py-1 px-2 text-sm font-medium'
                            rows="3"
                            cols="2"
                            placeholder="Meeting description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            style={{ resize: 'none' }}
                        />
                    </div>
                    <div className='w-full py-3 border-t-[1px] border-gray-200 flex gap-4 justify-end px-4'>
                        <button className='py-1 px-2 border-[1px] border-[#199FD9] rounded-md text-[#199FD9] text-sm' onClick={() => navigate(-1)}>Cancel</button>
                        <button 
                            className='py-1 px-2 bg-[#199FD9] rounded-md text-white text-sm' 
                            onClick={handleScheduleMeeting}
                        >
                            Create Meeting
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ScheduleMeet;
