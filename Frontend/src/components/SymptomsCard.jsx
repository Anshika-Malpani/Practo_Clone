import React from 'react'
import { MdKeyboardArrowRight } from "react-icons/md";

const SymptomsCard = ({image,title,price}) => {
  return (
    <>
            <div className='specialitiesCard w-[271px]  flex  flex-col gap-4 rounded-md overflow-hidden'>
                <div className='w-full flex items-center justify-center'>
                    <img className='w-full' src={`/images/${image}`} alt="" />
                </div>
                <div className='  px-4'>
                    <h1 className='font-medium text-sm  '>{title}?</h1>
                    <p className='text-sm text-[#787887]'>₹{price}</p>
                    </div>
                <div className='flex flex-col  gap-1 px-4'>
                    <div className='flex  '><span className='text-sm text-[#199fd9] font-semibold'>Consult now</span><MdKeyboardArrowRight className='text-[#199fd9] mt-1'/></div>
                </div>
                <div></div>
            </div>
        </>
  )
}

export default SymptomsCard