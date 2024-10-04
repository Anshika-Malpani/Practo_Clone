import React from 'react'
import OfferCard from './OfferCard'

const Offers = () => {
  return (
    <>
    <div className='px-24 py-6'><h1 className='text-2xl font-semibold'>Offers</h1></div>
    <div className='px-24 py-4 flex gap-10'>
        <OfferCard heading1="Download the App & get" heading2="₹200 HealthCash" image="offer1.png" backgroundColor="#96D3BF"/>
        <OfferCard heading1="Consult with specialists at" heading2="just ₹199" image="offer2.png" backgroundColor="#FEBA7F"/>
    </div>
    </>
  )
}

export default Offers