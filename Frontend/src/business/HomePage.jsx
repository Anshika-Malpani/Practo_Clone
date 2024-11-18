import React from 'react'
import DemoButton from '../components/DemoButton'

const HomePage = () => {
  return (
    <div className='w-full'>
    <div style={{ backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url(/images/businessHero.png)' }} className='w-full h-[85vh] bg-top bg-cover '>
    <div className='w-[57%] py-32 pl-36 flex flex-col gap-8 text-white '>
        <div><h1 className='text-[3.3rem] leading-tight'>The #1 mental health benefit</h1></div>
        <div><p className='text-[1.3rem]'>BetterHelp is the largest provider in the space with 1000s of partners. We're the answer to avoiding employee burnout, improving productivity, and overall well-being in the workplace.</p></div>
        <div ><DemoButton/></div>
    </div>
    </div>
   </div>
  )
}

export default HomePage