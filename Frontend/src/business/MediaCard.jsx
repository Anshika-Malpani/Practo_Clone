import React from 'react'

const MediaCard = ({image,title,description}) => {
  return (
    <>
    <div className='flex flex-col items-center gap-3 justify-center  w-[25vw]'>
        <img className='h-[12rem]' src={`/images/${image}`} alt="" />
        <h1 className='text-2xl opacity-70'>{title}</h1>
        <p className='text-center text-[1.025rem] text-[#4a4d4a]'>{description}</p>
    </div>
    </>
  )
}

export default MediaCard