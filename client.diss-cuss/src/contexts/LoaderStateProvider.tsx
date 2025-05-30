'use client'

import { createContext, useState, useContext } from 'react'

type LoaderContextType = {
  showLoader: boolean
  setShowLoader: React.Dispatch<React.SetStateAction<boolean>>
  progress: number
  setProgress: React.Dispatch<React.SetStateAction<number>>
}

const LoaderContext = createContext<LoaderContextType | null>(null)

export const useLoader = () => {
  const context = useContext(LoaderContext)
  if (!context) throw new Error('useLoader must be used within AuthProvider')
  return context
}

type Props = {
  children: React.ReactNode
}

export default function LoaderProvider({ children }: Props) {
  const [showLoader, setShowLoader] = useState(false)
  const [progress, setProgress] = useState(0)

  return (
    <LoaderContext.Provider value={{ showLoader, setShowLoader,progress,setProgress }}>
      {children}
    </LoaderContext.Provider>
  )
}
