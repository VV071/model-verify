'use client'
import {useEffect, useState} from 'react'
import { useRouter } from 'next/navigation'
import { api } from '../../lib/api'
import { clearStoredSession, getStoredSession } from '../../lib/auth'

export default function Home(){
  const router = useRouter()
  const [loading,setLoading] = useState(true)
  const [profile,setProfile] = useState(null)
  const [error,setError] = useState('')

  useEffect(()=>{
    const session = getStoredSession()
    if(!session?.token){
      router.replace('/')
      return
    }

    const fetchProfile = async () => {
      try{
        setLoading(true)
        const data = await api.profile(session.token)
        setProfile(data)
      }catch(err){
        setError(err.message)
        clearStoredSession()
        router.replace('/')
      }finally{
        setLoading(false)
      }
    }
    fetchProfile()
  },[router])

  if(loading){
    return <div className="text-lg text-gray-600">Loading dashboard...</div>
  }

  if(error){
    return (
      <div className="text-center">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={()=>router.replace('/')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Return to sign in
        </button>
      </div>
    )
  }

  const palmExists = Boolean(profile?.palmRegistered)

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome back, {profile?.name}</h1>
        <p className="text-gray-600">Manage your palm identity and payment verification from one place.</p>
      </div>

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
            disabled={!palmExists}
            className={`px-8 py-4 rounded-lg shadow-lg transition transform ${
              palmExists
                ? 'bg-gray-900 text-white hover:bg-gray-800 hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Verify Palm
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg">
        {palmExists ? (
          <div className="text-sm text-green-600 font-medium">
            ✓ Palm data stored securely in backend for this account.
          </div>
        ) : (
          <div className="text-sm text-gray-500 text-center">
            No palm data registered yet. Complete registration to enable contactless verification.
          </div>
        )}
      </div>
    </div>
  )
}
