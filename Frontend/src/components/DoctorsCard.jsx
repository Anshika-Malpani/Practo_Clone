import React from 'react'

const DoctorsCard = ({image,name,expertise,experience,consults }) => {
  return (
    <>
    <div className='w-[18vw] border-[1px] border-[#f0f0f5] px-2 py-2 rounded-md flex gap-2'>
        <div className='w-[3.8vw] h-[3.8vw] rounded-full overflow-hidden'><img className='w-full h-full object-cover' src={`/images/${image}`} alt="" /></div>
        <div>
            <h1 className='text-[0.8rem] font-semibold'>{name}</h1>
            <h5 className='text-[0.7rem]'>{expertise}</h5>
            <p className='text-[0.7rem]'>{experience}years experience</p>
            <p className='text-[0.7rem]'>{consults} consults done</p>
        </div>
    </div>
    </>
  )
}

export default DoctorsCard