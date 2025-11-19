'use client'
import { useEffect, useState } from 'react'
import useHands from '../../hooks/useHands'
import CameraCanvas from '../../components/CameraCanvas'
import { useRouter } from 'next/navigation'

function euclidean(a,b){
  if(!a||!b) return Infinity
  let s=0
  for(let i=0;i<a.length;i++){
    const d = (a[i]||0)-(b[i]||0)
    s += d*d
  }
  return Math.sqrt(s)
}

export default function VerifyPage(){
  const { videoRef, canvasRef, embedding, isInside, captureEmbedding } = useHands()
  const [result, setResult] = useState(null)
  const [distance,setDistance] = useState(null)
  const router = useRouter()
  const threshold = 0.15

  useEffect(()=>{
    const checkStored = () => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('palmData')
        if(!saved) setResult('nostored')
      }
    }
    checkStored()
  },[])

  const handleCheck = ()=>{
    if (typeof window === 'undefined') return
    
    const savedRaw = localStorage.getItem('palmData')
    if(!savedRaw){
      setResult('nostored')
      return
    }
    const saved = JSON.parse(savedRaw)
    const storedEmb = saved.embedding
    const current = captureEmbedding()
    if(!current){
      alert('No palm detected. Try again.')
      return
    }
    const d = euclidean(current, storedEmb)
    setDistance(d)
    if(d < threshold){
      setResult('match')
    } else {
      setResult('nomatch')
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Verify Palm</h1>
        <p className="text-sm text-gray-600 mb-6">
          Place palm in box and press &quot;Check&quot;. Threshold: {threshold}
        </p>
        <CameraCanvas videoRef={videoRef} canvasRef={canvasRef} caption={isInside? 'Hand inside box - Ready to verify' : 'Place hand inside box'}/>
        <div className="mt-6 flex gap-4 items-center justify-center flex-wrap">
          <button 
            onClick={handleCheck} 
            className="px-6 py-3 bg-gray-900 text-white rounded-lg shadow-md hover:bg-gray-800 transition transform hover:scale-105"
          >
            Check
          </button>
          <button 
            onClick={()=>router.push('/home')} 
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Go to Home
          </button>
          {distance !== null && (
            <div className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-mono text-gray-700">
              Distance: {distance.toFixed(4)}
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
          {result === 'nostored' && (
            <div className="p-6 rounded-xl border-4 border-yellow-400 bg-yellow-50 shadow-lg">
              <div className="text-center">
                <div className="text-xl font-bold text-yellow-800 mb-2">No Stored Data</div>
                <div className="text-sm text-yellow-700">No stored palm data found. Please register first.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
