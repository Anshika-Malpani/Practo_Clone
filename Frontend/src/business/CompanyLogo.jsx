import React from 'react'
import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";

const CompanyLogo = () => {
    return (
        <>
            <div className='w-full h-[40vh] bg-[#F5F5F5]'>
                <div className='w-full h-[80%] flex  flex-col items-center  gap-12'>
                    <div className='flex gap-10 pt-20'>
                        <div><IoIosArrowBack className='text-[#397a4a] font-semibold text-5xl' /></div>
                        <div>
                            <div className='flex gap-16 items-center'>
                                <img className='w-full max-h-12' src="/images/bpa-health.png" alt="" />
                                <img className='w-full max-h-12' src="/images/canopy.png" alt="" />
                                <img className='w-full max-h-12' src="/images/corpcare.png" alt="" />
                                <img className='w-full max-h-12' src="/images/lifematters.png" alt="" />
                                <img className='w-full max-h-12' src="/images/magellan.png" alt="" />
                                <img className='w-full max-h-12' src="/images/mines.png" alt="" />
                            </div>
                        </div>
                        <div><IoIosArrowForward className='text-[#397a4a] font-semibold text-5xl' /></div>
                    </div>
                    <div className='flex gap-5'>
                        <div className='w-[1.1vw] h-[1.1vw] rounded-full border-[1px] bg-[#397A4A] border-gray-500'></div>
                        <div className='w-[1.1vw] h-[1.1vw] rounded-full border-[1px] bg-slate-300 border-gray-500'></div>
                        <div className='w-[1.1vw] h-[1.1vw] rounded-full border-[1px] bg-slate-300 border-gray-500'></div>
                        <div className='w-[1.1vw] h-[1.1vw] rounded-full border-[1px] bg-slate-300 border-gray-500'></div>
                        <div className='w-[1.1vw] h-[1.1vw] rounded-full border-[1px] bg-slate-300 border-gray-500'></div>
                        <div className='w-[1.1vw] h-[1.1vw] rounded-full border-[1px] bg-slate-300 border-gray-500'></div>
                    </div>
                </div>
                <div className='relative w-full'>
                    <svg className="w-full h-28  scale-x-[-1]" preserveAspectRatio="none" viewBox="0 0 768 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path className="fill-[#7ec16a]" d="M338 46.9555C478.435 74.6894 652.859 79.7812 768 60.2693V7.84068C553 -17.2066 379.893 23.7381 338 46.9555Z"></path>
                        <path className="opacity-75" d="M338 46.9555C478.435 74.6894 652.859 79.7812 768 60.2693V7.84068C553 -17.2066 379.893 23.7381 338 46.9555Z" style={{ fill: 'url(#texture)' }}></path>
                        <path className="fill-[#fffcf6]" d="M0 11.7869C259.139 -15.9316 616.455 52.2374 764.575 49.187H768V72H0V11.7869Z"></path>
                    </svg>

                </div>
            </div>
        </>

    )
}

export default CompanyLogo