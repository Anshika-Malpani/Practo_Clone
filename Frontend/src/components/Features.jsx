import React from 'react'

const Features = ({icon,feature}) => {
  return (
    <>
   <div className='flex items-center justify-center gap-1'>
    {icon}
    <p className='text-[0.8rem]'>{feature}</p>
   </div>
   </>
  )
}

export default Features