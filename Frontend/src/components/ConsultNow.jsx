import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; 

const ConsultNow = () => {
    const { userName,userId } = useUser() || {};
    const [specializations, setSpecializations] = useState([]);
    const [selectedSpecialization, setSelectedSpecialization] = useState('');
    const [doctors, setDoctors] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [selectedDoctorId, setSelectedDoctorId] = useState('');
    const navigate = useNavigate();

    // Fetch doctors and their specializations
    useEffect(() => {
        axios.get('http://localhost:3000/doctor')
            .then((response) => {
                setSpecializations(response.data.specializations);
                setDoctors(response.data.doctors);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            });
    }, []);

    const handleSpecializationChange = (e) => {
        const specialization = e.target.value;
        setSelectedSpecialization(specialization);

        const filtered = doctors.filter(doc => doc.specialization === specialization);
        setFilteredDoctors(filtered);
    };

    const handleConsultNow = async () => {
        try {
            const response = await axios.post('http://localhost:3000/consultation', {
                patientId:userId,
                patientName: userName,
                specialization: selectedSpecialization,
                doctor_id: selectedDoctorId,
            });
            
          
            toast.success(response.data.message, { position: 'top-center' });

           
            setTimeout(() => navigate('/'), 2000);
        } catch (error) {
            console.error('Error booking consultation:', error);

           
            toast.error('Failed to book consultation. Please try again.', { position: 'top-center' });
        }
    };

    return (
        <div className="w-full h-[89vh] bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-8">
            <div className="w-full max-w-4xl bg-white shadow-xl rounded-lg p-8 flex">
                <div className="w-1/2 pr-6 flex flex-col gap-6">
                    <h1 className="text-3xl font-bold text-gray-800">Consult with a Doctor</h1>

                    <div className="flex flex-col gap-2">
                        <label className="text-lg font-medium text-gray-700">Select Medical Field</label>
                        <select
                            onChange={handleSpecializationChange}
                            value={selectedSpecialization}
                            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#199FD9]"
                        >
                            <option value="">Choose a Specialization</option>
                            {specializations.map((spec, index) => (
                                <option key={index} value={spec}>{spec}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-lg font-medium text-gray-700">Select Doctor</label>
                        <select
                            onChange={(e) => setSelectedDoctorId(e.target.value)}
                            value={selectedDoctorId}
                            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#199FD9]"
                        >
                            <option value="">Choose a Doctor</option>
                            {filteredDoctors.map((doc) => (
                                <option key={doc._id} value={doc._id}>
                                    Dr. {doc.fullname}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleConsultNow}
                        className="bg-[#199FD9] hover:bg-[#3fa6d3] text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                    >
                        Consult Now
                    </button>
                </div>

                <div className="w-1/2 flex flex-col items-center justify-center gap-4">
                    <img
                        src="/images/qualified_doctors.webp"
                        alt="Qualified Doctors"
                        className="w-48 h-48 object-cover rounded-full shadow-lg"
                    />
                    <h1 className="text-xl font-medium text-gray-800">Verified Doctors</h1>
                </div>
            </div>
        </div>
    );
};

export default ConsultNow;
