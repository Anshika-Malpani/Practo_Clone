import React from 'react'
import SpecialitiesCard from './SpecialitiesCard'

const Specialities = () => {
    const Specialities=[
        {
        id: 1,
        image:"gynaecologist.svg",
        title:"Gynaecology",
        price:"499"
    },
        {
        id: 2,
        image:"sexology.svg",
        title:"Sexology",
        price:"499"
    },
        {
        id: 3,
        image:"gp.svg",
        title:"General physician",
        price:"399"
    },
        {
        id: 4,
        image:"dermatologist.svg",
        title:"Dermatology",
        price:"499"
    },
     {
        id: 5,
        image:"psychiatric.svg",
        title:"Psychiatry",
        price:"499"
    },
     {
        id: 6,
        image:"stomach.svg",
        title:"Stomach and digestion",
        price:"399"
    },
]
  return (
    <>
    <div className='w-full px-24 py-10 flex flex-col gap-5'>
        <div className='flex items-center justify-between'>
            <div>
                <h3 className='text-2xl font-semibold'>25+ Specialities</h3>
                <h6 className='text-gray-500'>Consult with top doctors across specialities</h6>
            </div>

            <div>
                <button className='border-[1px] border-[#cac9c9] px-4 py-1 rounded-md text-sm '><p className='font-semibold text-[#2d2d32]'>See all Specialities</p></button>
            </div>

        </div>
        <div className='flex gap-10'>
           {
            Specialities.map((currentElem)=>{
              return  <SpecialitiesCard key={currentElem.id} image={currentElem.image} title={currentElem.title} price={currentElem.price} />
            })
           }
        </div>
    </div>
    </>
  )
}

export default Specialities