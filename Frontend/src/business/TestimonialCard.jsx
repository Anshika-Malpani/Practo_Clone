import React from 'react'

const TestimonialCard = ({des,title}) => {
  return (
    <>
    <div className='w-[23vw] h-[60vh] border-[1px] border-[#969a95] rounded-lg py-6 px-4'>
        <div className='h-[10%]'><img className='w-1/3' src="/images/Stars.png" alt="" /></div>
        <div className='h-[80%] text-[#6d706c] text-md'>{des}</div>
        <div className='h-[10%] text-xl text-[#397a4a]'><h1>{title}</h1></div>

    </div>
    </>
  )
}

export default TestimonialCard