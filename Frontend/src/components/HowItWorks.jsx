import React from 'react'
import { HiOutlineCursorClick } from "react-icons/hi";
import { BsChatRightDots } from "react-icons/bs";
import { FaPrescription } from "react-icons/fa";

const HowItWorks = () => {
  return (
   <div className='py-8 '>
    <h2 className='text-center text-2xl font-semibold'>How it works</h2>
    <div className='how-it-works-section flex  justify-around pt-8 relative mb-10  px-24'>
        <div className='flex flex-col w-[3333.3333%] relative z-10 items-center gap-5'>
            <div className='w-[4vw] h-[4vw] bg-[#F0EFF4] rounded-full flex items-center justify-center'>
            <HiOutlineCursorClick className='text-2xl text-[#787887] ' />
            </div>
            <div><p className='text-sm'>Select a speciality or symptom</p></div>
        </div>
        <div className='flex flex-col w-[3333.3333%] relative z-10 items-center gap-5'>
            <div className='w-[4vw] h-[4vw] bg-[#F0EFF4] rounded-full flex items-center justify-center'>
            <BsChatRightDots className='text-xl text-[#787887]' />
            </div>
            <div><p className='text-sm'>Audio/ video call with a verified doctor</p></div>
        </div>
        <div className='flex flex-col w-[3333.3333%] relative z-10 items-center gap-5'>
            <div className='w-[4vw] h-[4vw] bg-[#F0EFF4] rounded-full flex items-center justify-center'>
            <FaPrescription className='text-xl text-[#787887]' />
            </div>
            <div><p className='text-sm'>Get a digital prescription & a free follow-up</p></div>
        </div>
    </div>
   </div>
  )
}

export default HowItWorks