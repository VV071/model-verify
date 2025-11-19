'use client'
import {useEffect, useState} from 'react'
import { useRouter } from 'next/navigation'

export default function Home(){
  const router = useRouter()
  const [palmExists,setPalmExists] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('palmData')
    }
    return false
  })

  useEffect(()=>{
    const checkPalmData = () => {
      const data = localStorage.getItem('palmData')
      setPalmExists(!!data)
    }
    checkPalmData()
  },[])

  const handleDelete = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('palmData')
      setPalmExists(false)
      alert('Palm data deleted')
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-8">
        <div className="bg-white p-8 rounded-2xl shadow-lg flex flex-col items-center justify-center min-h-[300px]">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Register Palm</h2>
          <button
            onClick={()=>router.push('/register')}
            disabled={palmExists}
            className={`px-8 py-4 rounded-lg shadow-lg transition transform ${
              palmExists 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
            }`}
          >
            {palmExists ? 'Palm Registered' : 'Register Palm'}
          </button>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg flex flex-col items-center justify-center min-h-[300px]">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Verify Palm</h2>
          <button
            onClick={()=>router.push('/verify')}
            className="px-8 py-4 rounded-lg bg-gray-900 text-white shadow-lg hover:bg-gray-800 hover:scale-105 transition transform"
          >
            Verify Palm
          </button>
        </div>
      </div>

      {palmExists && (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex flex-col items-center gap-4">
            <div className="text-sm text-green-600 font-medium">✓ Saved palm data found in localStorage</div>
            <button 
              onClick={handleDelete} 
              className="px-6 py-3 rounded-lg bg-red-500 text-white shadow-md hover:bg-red-600 transition transform hover:scale-105"
            >
              Delete Palm Data
            </button>
          </div>
        </div>
      )}

      {!palmExists && (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="text-sm text-gray-500 text-center">No palm data saved yet. Register your palm to get started.</div>
        </div>
      )}

      <div className="mt-6 text-xs text-gray-400 text-center">
        Palm embeddings saved to localStorage only (key: &quot;palmData&quot;). Uses MediaPipe Hands for landmark extraction.
      </div>
    </div>
  )
}
