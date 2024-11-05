import React, { useState } from 'react'
import axios from 'axios'

import { NavLink, useNavigate } from 'react-router-dom';
import { useDoctor } from '../context/DoctorContext';

const DoctorLogin = () => {
  const [formData, setFormData] = useState({ mobileNumber: '', password: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const [flashMessage, setFlashMessage] = useState('');
  const doctorContext = useDoctor();
  const { setDoctor,setDoctorId } = doctorContext || {}; 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDoctor(''); 
    setDoctorId(''); 
    try {
      const response = await axios.post('http://localhost:3000/doctor/loginDoctor', formData, { withCredentials: true });
      if (response.data.message === "Login successfully") {
        setDoctor(response.data.doctor.fullname);
        setDoctorId(response.data.doctor.id);
        
        navigate('/'); 
    }
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setFlashMessage(error.response.data.message); 
        setFormData({  mobileNumber: '', password: '' }); 
    } else {
        console.error(error);
    }
    }
  };

  return (
    <>
      {flashMessage && (
        <div className="bg-red-600 text-white p-2 text-center font-semibold">
          {flashMessage}
        </div>
      )}
      <div className='w-full flex justify-center gap-10 border-[1px] border-[#f0f0f5] h-[8vh]'>
        <NavLink to="/doctor_login" className={({ isActive }) => isActive ? 'border-b-[4px] border-[#199FD9] text-[#199FD9] py-[0.9rem]' : 'py-[0.9rem]'}><h1 className='text-sm'>Login</h1></NavLink>
        <NavLink to="/doctor_signup" className={({ isActive }) => isActive ? 'border-b-[4px] border-[#199FD9] text-[#199FD9] py-[0.9rem]' : 'py-[0.9rem]'}><h1 className='text-sm'>Register</h1></NavLink>
      </div>
      <div className='flex gap-5'>
        <div className='w-[50%] h-[81vh] flex justify-end items-center'><img className='w-[55%]' src="/images/illustration.webp" alt="" /></div>
        <div className='w-[50%] h-[81vh] flex justify-start items-center'>
          <div className='w-[30vw] border-[1px] border-[#f0f0f5]'>
            <div className='w-full'>
              <form method='POST' onSubmit={handleSubmit}>
                <div className="flex flex-col items-center justify-center lg:py-0">
                  <div className="w-full rounded-lg md:mt-0 sm:max-w-md xl:p-0">
                    <div className="space-y-4 md:space-y-4 sm:px-8 py-4">
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900">Mobile Number</label>
                        <input className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5" placeholder="Mobile Number" name="mobileNumber" type="number" value={formData.mobileNumber} onChange={handleChange} />
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900">Password</label>
                        <input className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5" placeholder="Password" name="password" type="password" value={formData.password} onChange={handleChange} />
                      </div>
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 focus:ring-primary-600 ring-offset-gray-800" type="checkbox" aria-describedby="terms" id="terms" />
                        </div>
                        <div className="ml-3 text-sm">
                          <label className="text-gray-500">Remember me for 30 days</label>
                        </div>
                      </div>
                      <button className="w-full bg-[#199FD9] font-medium rounded-lg text-sm px-5 py-2.5 text-center text-white" type="submit">Login</button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default DoctorLogin