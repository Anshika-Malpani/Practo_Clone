import React from 'react'
import DemoButton from '../components/DemoButton'

const ClinicalMedia = () => {
    return (
        <>
            <div className='w-full h-[78vh] bg-[#FFFCF6] flex items-center pt-16 px-36'>
                <div className='w-[50%] p-3'>
                    <div className=' flex flex-col gap-8 '>
                        <div><h1 className='text-[2rem] leading-tight text-gray-600'>A clinical approach that works</h1></div>
                        <div><p className='text-[1.125rem] text-gray-600 '>Since 2013, BetterHelp has supported millions of clients and hundreds of organizations by providing clinically-proven and evidence-based results for companies seeking to improve employee wellbeing.</p></div>
                        <div ><DemoButton /></div>
                    </div>
                   
                </div>
                <div className='w-[50%] h-full relative py-3 px-5 '>
                <div><img className='absolute top-[20%] w-1/2' src="/images/org-chart-1.png" alt="" />
                <img className='absolute top-0 w-1/2 right-8' src="/images/org-chart-2.png" alt="" /></div>
                <div className='absolute bottom-16 left-[25%]'><h1 className='text-[#6d706c] text-[1.2rem]'>* After 6 weeks of therapy on BetterHelp.</h1></div>
                
                </div>

            </div>
            <div className=' relative clinical-curve overflow-hidden after:bg-[#F7F0E6]'>
                <div className=' absolute h-[3px] w-full bottom-0 bg-[#F7F0E6] -mb-px '></div>
            </div>
        </>
    )
}

export default ClinicalMedia