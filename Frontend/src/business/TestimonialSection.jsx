import React, { useEffect, useState } from 'react'; 
import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";
import TestimonialCard from './TestimonialCard';


const TestimonialSection = () => {


    return (
        <>
            <div className='w-full h-[130vh] pt-[15rem] flex flex-col items-center justify-center gap-12 '>
                <div className='flex gap-10 pt-20 items-center justify-center flex-shrink-0 overflow-hidden '>
                    <div ><IoIosArrowBack className='text-[#397a4a] font-semibold text-5xl' /></div>
                    <div className='flex testimonial-container'>
                        <div className='flex gap-5 items-center'>
                            <TestimonialCard des="Working with Candace has been fantastic - she's honest and authentic while still providing an empathetic space to process all of life's many curveballs. She isn't afraid to speak hard truths & was a strong advocate for self-love and self-care. It's clear that she wants her clients to get the most out of therapy. Working with her from" title="Noom Employee" />,
                            <TestimonialCard des="Kira is so bright and wonderful. She brings joy (but not superficial joy!) to hard conversations, and I always feel heard around her. She truly takes the time to listen, ask questions, and deduce what is important to her patients." title="Fortune 500 Employee" />,
                            <TestimonialCard des="She truly lives her profession and is always happy to provide additional information and resources. Working with Shawnean has been a great." title="Fortune 50 Employee" />
                        </div>
                    </div>
                    <div ><IoIosArrowForward className='text-[#397a4a] font-semibold text-5xl' /></div>
                </div>

                <div className='flex gap-5 items-center justify-center'>
                    <div className='w-[1.1vw] h-[1.1vw] rounded-full border-[1px] bg-[#397A4A] border-gray-500'></div>
                    <div className='w-[1.1vw] h-[1.1vw] rounded-full border-[1px] bg-slate-300 border-gray-500'></div>
                    <div className='w-[1.1vw] h-[1.1vw] rounded-full border-[1px] bg-slate-300 border-gray-500'></div>
                    <div className='w-[1.1vw] h-[1.1vw] rounded-full border-[1px] bg-slate-300 border-gray-500'></div>
                    <div className='w-[1.1vw] h-[1.1vw] rounded-full border-[1px] bg-slate-300 border-gray-500'></div>
                    <div className='w-[1.1vw] h-[1.1vw] rounded-full border-[1px] bg-slate-300 border-gray-500'></div>
                </div>
            </div>
        </>
    )
}

export default TestimonialSection