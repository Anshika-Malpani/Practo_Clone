import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDoctor } from '../context/DoctorContext';

const DoctorSignup = () => {
  const [formData, setFormData] = useState({
    fullname: '',
    mobileNumber: '',
    password: '',
    specialization:'',
    experience:''
  });
  
  const [flashMessage, setFlashMessage] = useState('');
  const doctorContext = useDoctor();
  const { setDoctor } = doctorContext || {}; 
  const navigate = useNavigate();

  if (!doctorContext) {
    console.error('useUser is returning undefined. Ensure UserProvider is wrapping this component.');
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDoctor(''); 
    try {
      const response = await axios.post('http://localhost:3000/doctor/registerDoctor', formData);
      
      if (response.data.message === "Account created successfully.") {
        setDoctor(formData.fullname);
        navigate('/');
      }
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setFlashMessage(error.response.data.message);
        setFormData({ fullname: '', mobileNumber: '', password: '' ,specialization:'' , experience:''});
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
        <div className='w-[50%] h-[81vh] flex justify-end items-center'>
          <img className='w-[55%]' src="/images/illustration.webp" alt="Illustration" />
        </div>
        
        <div className='w-[50%] h-[81vh] flex justify-start items-center'>
          <div className='w-[30vw] border-[1px] border-[#f0f0f5]'>
            <div className='w-full  border-b-[1px] border-[#f0f0f5] flex items-center justify-between px-8 py-2'>
                <h1 className='text-sm'>Join 125,000+ doctors</h1>
              <NavLink to="/signup" className='font-semibold text-[#13BEF0] text-sm'>Not a doctor?</NavLink>
            </div>
            
            <div className='w-full'>
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col items-center justify-center lg:py-0">
                  <div className="w-full rounded-lg md:mt-0 sm:max-w-md xl:p-0">
                    <div className="space-y-3 md:space-y-2 sm:px-8 py-2">
                      
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Full Name
                        </label>
                        <input
                          placeholder="Full Name"
                          className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2"
                          name="fullname"
                          type="text"
                          value={formData.fullname}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Mobile Number
                        </label>
                        <input
                          className="bg-gray-50 border border-gray-300 text-gray-900  sm:text-sm rounded-lg block w-full p-2"
                          placeholder="Mobile Number"
                          name="mobileNumber"
                          type="number"
                          value={formData.mobileNumber}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                        Specialization
                        </label>
                        <input
                          className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2"
                          placeholder="Specialization"
                          name="specialization"
                          type="text"
                          value={formData.specialization}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Experience 
                        </label>
                        <input
                          className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2"
                          placeholder="Experience"
                          name="experience"
                          type="number"
                          value={formData.experience}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Create Password
                        </label>
                        <input
                          className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2"
                          placeholder="Password"
                          name="password"
                          type="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 focus:ring-primary-600"
                            type="checkbox"
                            id="terms"
                            required
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label className="font-light text-gray-500">
                            I accept the
                            <span className="font-medium text-primary-600 hover:underline text-primary-500">
                              Terms and Conditions
                            </span>
                          </label>
                        </div>
                      </div>

                      <button
                        className="w-full bg-[#199FD9] font-medium rounded-lg text-sm px-5 py-2.5 text-center text-white"
                        type="submit"
                      >
                        Create an account
                      </button>

                    </div>
                  </div>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default DoctorSignup;
