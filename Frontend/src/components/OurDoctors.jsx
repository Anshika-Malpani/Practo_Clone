import React from 'react'
import DoctorsCard from './DoctorsCard'

const OurDoctors = () => {
    const Doctors = [
        {
            id: 1,
            image: "dr-murali.jpg",
            name: "Dr. Murali Reddy",
            expertise: "Dermatologist",
            experience: "7",
            consult: "49576"
        },
        {
            id: 2,
            image: "dr-hitesh.jpg",
            name: "Dr. Hitesh Viradiya",
            expertise: "Dermatologist,Cosmetlogist",
            experience: "8",
            consult: "44770"
        },
        {
            id: 3,
            image: "dr-kamal.jpg",
            name: "Dr. Kamal Kishore Verma",
            expertise: "Sexologist,Psychiatrist",
            experience: "16",
            consult: "92364"
        },
        {
            id: 4,
            image: "dr-priyanka.jpeg",
            name: "Dr. Priyanka Nawani",
            expertise: "Dermatologist",
            experience: "4",
            consult: "11248"
        }

    ]

    return (
        <>
            <div>
                <div className='px-24 py-6'><h1 className='text-2xl font-semibold'>Our Doctors</h1></div>
                <div className='px-24 flex gap-12 pb-4'>
                    {
                        Doctors.map((currentDr) => {
                            return <DoctorsCard key={currentDr.id} image={currentDr.image} name={currentDr.name} expertise={currentDr.expertise} experience={currentDr.experience} consults={currentDr.consult} />
                        })
                    }
                </div>
            </div>
        </>
    )
}

export default OurDoctors