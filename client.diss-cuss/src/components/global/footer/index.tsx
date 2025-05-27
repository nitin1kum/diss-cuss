import Link from 'next/link'
import React from 'react'

const Footer = () => {
  return (
    <div className='bg-bg border-t flex-col sm:flex-row gap-2 border-border px-8 py-2 flex items-center justify-between'>
      <p className='m-0 text-sm font-medium text-text'>Copyright © 2025 Diss-cuss</p>
      <div className='flex text-sm'>
        <Link className='hover:underline px-2 border-r border-gray-300' href={"/privacy policy"}>Github</Link>
        <Link className='hover:underline px-2 border-r border-gray-300' href={"/privacy-policy"}>Privacy Policy</Link>
        <Link className='hover:underline px-2' href={"/terms"}>Terms</Link>
      </div>
    </div>
  )
}

export default Footer