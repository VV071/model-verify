'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import useHands from '../../hooks/useHands'
import CameraCanvas from '../../components/CameraCanvas'
import { api } from '../../lib/api'
import { clearStoredSession, getStoredSession } from '../../lib/auth'

export default function RegisterPage(){
  const { videoRef, canvasRef, isInside, captureEmbedding } = useHands()
  const router = useRouter()
  const [status,setStatus] = useState('Position your palm inside the dotted box')
  const [registered, setRegistered] = useState(false)
  const [error,setError] = useState('')
  const [loading,setLoading] = useState(false)
  const stableCounterRef = useRef(0)
  const requiredStable = 15
  const [token,setToken] = useState(null)

  useEffect(()=>{
    const session = getStoredSession()
    if(!session?.token){
      router.replace('/')
      return
    }
    setToken(session.token)
  },[router])

  const handleCapture = useCallback(async ()=>{
    setError('')
    if(registered || !token) return
    const emb = captureEmbedding()
    if(!emb){
      setStatus('No palm detected. Try again.')
      return
    }
    try{
      setLoading(true)
      await api.registerPalm(token, emb)
      setStatus('Palm registered successfully ✓')
      setRegistered(true)
      setTimeout(()=>router.push('/home'), 1200)
    }catch(err){
      setError(err.message)
      if(err.message.toLowerCase().includes('unauthorized')){
        clearStoredSession()
        router.replace('/')
      }
    }finally{
      setLoading(false)
    }
  },[captureEmbedding, token, registered, router])

  useEffect(()=>{
    if(registered || !token) return

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
  },[isInside, registered, handleCapture, token])

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Register Palm</h1>
        <p className="text-sm text-gray-600 mb-6">
          Place your palm inside the dotted box and keep steady. Auto-capture occurs after holding steady for a few seconds.
        </p>
        <CameraCanvas videoRef={videoRef} canvasRef={canvasRef} caption={status}/>
        {error && (
          <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        <div className="mt-6 flex gap-4 justify-center">
          {!registered ? (
            <>
              <button 
                onClick={handleCapture} 
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition transform hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
              >
                {loading ? 'Uploading...' : 'Capture Now'}
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
