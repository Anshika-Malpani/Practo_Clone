import React from 'react'
import { MdKeyboardArrowRight } from "react-icons/md";

const OfferCard = ({heading1,heading2,image,backgroundColor}) => {
    return (
        <>
            <div style={{ backgroundColor }} className={'w-[50%] bg-[#96D3BF]  flex rounded-md'}>
                <div className='flex flex-col gap-3 w-[87%] py-4 px-4'>
                    <div className='px-[0.1rem] py-[0.1rem] bg-[#FFFFFF] w-[15%]'><h1 className='text-center text-[#35745F] font-semibold'>OFFER</h1></div>
                    <div>
                        <h1 className='text-2xl font-semibold'>{heading1}</h1>
                        <h1 className='text-2xl font-semibold'>{heading2}</h1>
                    </div>
                    <div className='flex items-center gap-2'>
                        <span className='text-xl font-semibold'>Download App</span>
                        <span className='w-[1.2vw] h-[1.2vw] bg-black rounded-full mt-1'><MdKeyboardArrowRight className='text-white'/></span></div>
                </div>
                <div className='w-[19%] flex items-end '>
                    <img className='' src={`/images/${image}`} alt="" />
                </div>
            </div>
        </>
    )
}

export default OfferCard