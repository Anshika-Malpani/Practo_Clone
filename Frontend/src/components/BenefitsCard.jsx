import React from 'react'
import { MdOutlineDone } from "react-icons/md";

const BenefitsCard = ({title,para}) => {
  return (
    <>
   <div className='m-[30px] w-[27%] flex flex-col gap-4'>
   <div className='flex items-center gap-1'><MdOutlineDone className='text-xl font-semibold mt-1' /> <h1 className='text-lg font-semibold'>{title}</h1></div>
   <div><p className='text-[#787887] leading-tight text-[0.9rem]'>{para}</p></div>
   </div>
    </>
  )
}

export default BenefitsCard