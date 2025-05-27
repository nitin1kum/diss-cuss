"use client"
import React, { useRef } from 'react'

const DropDown = ({children,close} : {children : React.ReactNode,close : () => void}) => {
  const dropDownRef = useRef<HTMLDivElement | null>(null)

  
  return (
    <div ref={dropDownRef}>
      {children}
    </div>
  )
}

export default DropDown