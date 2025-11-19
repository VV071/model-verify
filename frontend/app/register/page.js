'use client'
import { useEffect, useRef, useState } from 'react'
import useHands from '../../hooks/useHands'
import CameraCanvas from '../../components/CameraCanvas'
import { useRouter } from 'next/navigation'

export default function RegisterPage(){
  const {
    videoRef, canvasRef, embedding, isInside,
    captureEmbedding, saveToLocal
  } = useHands()
  const router = useRouter()
  const [status,setStatus] = useState('Position your palm inside the dotted box')
  const [registered, setRegistered] = useState(false)
  const stableCounterRef = useRef(0)
  const requiredStable = 15

  const handleCapture = ()=>{
    const emb = captureEmbedding()
    if(!emb){
      setStatus('No palm detected. Try again.')
      return
    }
    const payload = {embedding:emb, savedAt: new Date().toISOString()}
    saveToLocal(payload)
    setStatus('Palm Registered Successfully ✓')
    setRegistered(true)
  }

  useEffect(()=>{
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('palmData')
      if(saved){
        setStatus('Palm already registered. You may delete from Home to re-register.')
      }
    }
  },[])

  useEffect(()=>{
    if(registered) return
    
    if(isInside){
      stableCounterRef.current += 1
      setStatus(`Hold steady... (${stableCounterRef.current}/${requiredStable})`)
    }else{
      if(stableCounterRef.current>0) stableCounterRef.current = 0
      setStatus('Position your palm inside the dotted box')
    }
    if(stableCounterRef.current >= requiredStable){
      handleCapture()
      stableCounterRef.current = 0
    }
  },[isInside, embedding, registered, handleCapture])

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Register Palm</h1>
        <p className="text-sm text-gray-600 mb-6">
          Place your palm inside the dotted box and keep steady. Auto-capture occurs after holding steady for a few seconds.
        </p>
        <CameraCanvas videoRef={videoRef} canvasRef={canvasRef} caption={status}/>
        <div className="mt-6 flex gap-4 justify-center">
          {!registered ? (
            <>
              <button 
                onClick={handleCapture} 
                className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition transform hover:scale-105"
              >
                Capture Now
              </button>
              <button 
                onClick={()=>router.push('/home')} 
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Go to Home
              </button>
            </>
          ) : (
            <button 
              onClick={()=>router.push('/home')} 
              className="px-8 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition transform hover:scale-105"
            >
              Go to Home
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
