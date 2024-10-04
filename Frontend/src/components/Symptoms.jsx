import React from 'react'
import SymptomsCard from './SymptomsCard'

const Symptoms = () => {
    const Symptoms=[
        {
        image:"cough-cold.jpg",
        title:"Cough & Cold",
        price:"399",
        id: 1
    },
        {
        image:"period-problems.jpg",
        title:"Period problems",
        price:"499",
        id: 2
    },
        {
        image:"performance-issues.jpg",
        title:"Performance issues in bed",
        price:"499",
        id: 3
    },
        {
        image:"skin-problems.jpg",
        title:"Skin problems",
        price:"449",
        id: 4
    }
    
]
  return (
    <div className='w-full px-24 py-6 flex flex-col gap-5'>
        <div className='flex items-center justify-between'>
            <div>
                <h3 className='text-2xl font-semibold'>Common Health Concerns</h3>
                <h6 className='text-gray-500'>Consult a doctor online for any health issue</h6>
            </div>

            <div>
                <button className='border-[1px] border-[#cac9c9] px-4 py-1 rounded-md text-sm '><p className='font-semibold text-[#2d2d32]'>See all Symptoms</p></button>
            </div>

        </div>
        <div className='flex gap-10'>
           {
            Symptoms.map((currentSymp)=>{
                return <SymptomsCard key={currentSymp.id} image={currentSymp.image} title={currentSymp.title} price={currentSymp.price} />
            })
           }
        </div>
    </div>
  )
}

export default Symptoms