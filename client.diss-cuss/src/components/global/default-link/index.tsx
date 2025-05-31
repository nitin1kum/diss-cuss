"use client"
import { useLoader } from '@/contexts/LoaderStateProvider'
import Link from 'next/link'
import React from 'react'

type Props = {
  href : string,
  children : React.ReactNode
  className? : string
  title? : string
  onClick? : () => void
}

const DefaultLink = ({href ,children,className,title,onClick} : Props) => {
  const context = useLoader();
  const handleLinkClick = () => {
    if(onClick){
      onClick();
    }
    if(context){
      context.setShowLoader(true);
      context.setProgress(20);
    }
  }
  return (
    <Link href={href} title={title} className={className} onClick={handleLinkClick}>
      {children}
    </Link>
  )
}

export default DefaultLink