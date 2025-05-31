import React from 'react'
import DefaultLink from '../default-link'

const Footer = () => {
  return (
    <div className='bg-bg border-t flex-col sm:flex-row gap-2 border-border px-8 py-2 flex items-center justify-between'>
      <p className='m-0 text-sm font-medium text-text'>Copyright © 2025 Diss-cuss</p>
      <div className='flex text-sm'>
        <DefaultLink className='hover:underline px-2 border-r border-gray-300' href={"/privacy policy"}>Github</DefaultLink>
        <DefaultLink className='hover:underline px-2 border-r border-gray-300' href={"/privacy-policy"}>Privacy Policy</DefaultLink>
        <DefaultLink className='hover:underline px-2' href={"/terms"}>Terms</DefaultLink>
      </div>
    </div>
  )
}

export default Footer