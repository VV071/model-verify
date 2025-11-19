'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import useHands from '../../hooks/useHands'
import CameraCanvas from '../../components/CameraCanvas'
import { api } from '../../lib/api'
import { clearStoredSession, getStoredSession } from '../../lib/auth'

export default function VerifyPage(){
  const { videoRef, canvasRef, isInside, captureEmbedding } = useHands()
  const router = useRouter()
  const [token,setToken] = useState(null)
  const [result,setResult] = useState(null)
  const [similarity,setSimilarity] = useState(null)
  const [threshold,setThreshold] = useState(null)
  const [error,setError] = useState('')
  const [loading,setLoading] = useState(false)

  useEffect(()=>{
    const session = getStoredSession()
    if(!session?.token){
      router.replace('/')
      return
    }
    setToken(session.token)
  },[router])

  const handleCheck = async ()=>{
    setError('')
    setResult(null)
    if(!token){
      router.replace('/')
      return
    }
    const current = captureEmbedding()
    if(!current){
      setError('No palm detected. Make sure your hand is inside the box.')
      return
    }
    try{
      setLoading(true)
      const data = await api.verifyPalm(token, current)
      setSimilarity(data.similarity)
      setThreshold(data.threshold)
      setResult(data.verified ? 'match' : 'nomatch')
    }catch(err){
      setError(err.message)
      if(err.message.toLowerCase().includes('unauthorized')){
        clearStoredSession()
        router.replace('/')
      }
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Verify Palm</h1>
        <p className="text-sm text-gray-600 mb-6">
          Hold your palm steady inside the capture box and press &quot;Check&quot; to verify against the registered template.
        </p>
        <CameraCanvas 
          videoRef={videoRef} 
          canvasRef={canvasRef} 
          caption={isInside ? 'Hand inside box - Ready to verify' : 'Place hand inside box'}
        />
        {error && (
          <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        <div className="mt-6 flex gap-4 items-center justify-center flex-wrap">
          <button 
            onClick={handleCheck} 
            disabled={loading}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg shadow-md hover:bg-gray-800 transition transform hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
          >
            {loading ? 'Verifying...' : 'Check'}
          </button>
          <button 
            onClick={()=>router.push('/home')} 
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Go to Home
          </button>
          {similarity !== null && (
            <div className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-mono text-gray-700">
              Similarity: {similarity.toFixed(3)} / Threshold: {(threshold ?? 0).toFixed(2)}
            </div>
          )}
        </div>

        <div className="mt-8">
          {result === 'match' && (
            <div className="p-6 rounded-xl border-4 border-green-500 bg-green-50 shadow-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700 mb-2">Match Found ✅</div>
                <div className="text-sm text-green-600">Palm verification successful!</div>
              </div>
            </div>
          )}
          {result === 'nomatch' && (
            <div className="p-6 rounded-xl border-4 border-red-500 bg-red-50 shadow-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-700 mb-2">Match Not Found ❌</div>
                <div className="text-sm text-red-600">Palm does not match the registered data.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
