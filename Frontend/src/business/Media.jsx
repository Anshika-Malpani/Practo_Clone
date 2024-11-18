import React from 'react'
import MediaCard from './MediaCard'
import DemoButton from '../components/DemoButton'

const Media = () => {
  return (
    <>
      <div className='w-full h-[130vh] bg-[#F7F0E6] flex flex-col gap-10'>

        <div className='flex py-6 px-40  items-center'>
          <div className=' w-[40%]'><img className='w-[80%]' src="/images/zoomillustration.png" alt="" /></div>
          <div className='flex flex-col gap-8 w-[60%]'>
            <h1 className='text-4xl text-[#444444] opacity-90'>We set the standard for the industry</h1>
            <p className='text-[#4a4d4a] text-[1.2rem]'>As the gold standard of the online mental health industry, we proudly provide quality and clinically-proven results to our members. It is our goal to ensure total privacy, unparalleled security, and the highest-quality therapy for your employees.</p>
          </div>
        </div>

        <div className='flex px-20 items-center justify-evenly'>
          <MediaCard image='lock.png' title="Privacy" description="Our platform is secured by banking-grade 256-bit encryption." />
          <MediaCard image='security.png' title="Security" description="BetterHelp is HITRUST Risk-based, 2-year (r2) Certified." />
          <MediaCard image='checklist.png' title="Quality" description="Our platform is built on state-of-the-art technology, operations, and infrastructure." />
        </div>

        <div className='flex items-center justify-center mt-6'><DemoButton /></div>

        <div>
          <div className="relative w-full">
            <svg className="hidden w-full h-28 md:block" preserveAspectRatio="none" viewBox="0 0 768 72" fill="none" xmlns="http://www.w3.org/2000/svg"><path className="fill-[#7ec16a]" d="M338 46.9555C478.435 74.6894 652.859 79.7812 768 60.2693V7.84068C553 -17.2066 379.893 23.7381 338 46.9555Z"></path><path class="opacity-75" d="M338 46.9555C478.435 74.6894 652.859 79.7812 768 60.2693V7.84068C553 -17.2066 379.893 23.7381 338 46.9555Z" ></path><path className="fill-[#325343]" d="M0 11.7869C259.139 -15.9316 616.455 52.2374 764.575 49.187H768V72H0V11.7869Z"></path></svg>
            <div class="absolute h-[3px] w-full bottom-0 -mb-px" style={{backgroundColor: "rgb(50, 83, 67);"}}></div>
          </div>

          <div className='bg-[#325343]'>
            <div className='a  flex items-center justify-center px-10 gap-16 pb-[7rem]'>
              <span><img className='w-[6rem]' src="/images/hitrust.png" alt="" /></span>
              <div>
                <p className='text-[1.5rem] text-white'>Now more than ever it's crucially important to know who you can trust.</p>
                <p className='text-[1.5rem] text-white'>BetterHelp.com is now HITRUST certified.</p>
              </div>
            </div>
          </div>

          <div className='relative w-full -top-10'>
          <svg className="hidden w-full h-28 md:block scale-x-[-1]" preserveAspectRatio="none" viewBox="0 0 768 72" fill="none" xmlns="http://www.w3.org/2000/svg"><path className="fill-[#7ec16a]" d="M338 46.9555C478.435 74.6894 652.859 79.7812 768 60.2693V7.84068C553 -17.2066 379.893 23.7381 338 46.9555Z"></path><path className="opacity-75" d="M338 46.9555C478.435 74.6894 652.859 79.7812 768 60.2693V7.84068C553 -17.2066 379.893 23.7381 338 46.9555Z" ></path><path className="fill-white" d="M0 11.7869C259.139 -15.9316 616.455 52.2374 764.575 49.187H768V72H0V11.7869Z"></path></svg>
          </div>

        </div>


      </div>
    </>
  )
}

export default Media