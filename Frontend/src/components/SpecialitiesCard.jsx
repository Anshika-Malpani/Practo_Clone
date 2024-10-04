import React from 'react'
import { MdKeyboardArrowRight } from "react-icons/md";

const SpecialitiesCard = ({image,title,price}) => {
    return (
        <>
            <div className='specialitiesCard w-[167px]  px-4 py-4 flex items-center flex-col gap-2 '>
                <div className='w-full flex items-center justify-center'>
                    <img className='w-[85%]' src={`/images/${image}`} alt="" />
                </div>
                <div className='h-[4vh] mt-1'><h1 className='font-medium text-sm text-center leading-none'>{title}</h1></div>
                <div className='flex flex-col items-center gap-1'>
                    <p className='text-sm text-[#787887]'>₹{price}</p>
                    <div className='flex items-center justify-center'><span className='text-sm text-[#199fd9] font-semibold'>Consult now</span><MdKeyboardArrowRight className='text-[#199fd9] mt-1'/></div>
                </div>
                <div></div>
            </div>
        </>
    )
}

export default SpecialitiesCard