import React from 'react'
import BenefitsCard from './BenefitsCard'

const Benefits = () => {

    const Benefits=[
        {
        id: 1,
        title:"Consult Top Doctors 24x7",
        para:"Connect instantly with a 24x7 specialist or choose to video visit a particular doctor."
    },
        {
        id: 2,
            title:"Convenient and Easy",
        para:"Connect instantly with a 24x7 specialist or choose to video visit a particular doctor."
    },
        {
        id: 3,
           title:"100% Safe Consultations",
        para:"Be assured that your online consultation will be fully private and secured."
    },
        {
        id: 4,
           title:"Similar Clinic Experience",
        para:"Experience clinic-like consultation through a video call with the doctor. Video consultation is available only on the Practo app."
    },
        {
        id: 5,
           title:"Free Follow-up",
        para:"Get a valid digital prescription and a 7-day, free follow-up for further clarifications."
    }
    
]

  return (
    <>
   <div className='px-24'>
   <div className='py-6'><h1 className='text-2xl font-semibold'>Benefits of Online Consultation </h1></div>
   <div className=' border-[1px] border-[#f0f0f5] rounded-md flex flex-wrap mb-4'>
   {
            Benefits.map((currentBenefit)=>{
                return <BenefitsCard key={currentBenefit.id} title={currentBenefit.title} para={currentBenefit.para}/>
            })
           }
   </div>
   </div>
    </>
  )
}

export default Benefits