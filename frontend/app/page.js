'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '../lib/api'
import { setStoredSession } from '../lib/auth'

export default function Signin(){
  const router = useRouter()
  const [identifier,setIdentifier] = useState('')
  const [password,setPassword] = useState('')
  const [error,setError] = useState('')
  const [loading,setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if(!identifier || !password){
      setError('Please enter your name/email and password')
      return
    }

    const payload = { password }
    if(identifier.includes('@')){
      payload.email = identifier
    }else{
      payload.name = identifier
    }

    try{
      setLoading(true)
      const data = await api.signIn(payload)
      setStoredSession({
        token: data.idToken,
        refreshToken: data.refreshToken,
        uid: data.uid,
        user: data.user
      })
      router.replace('/home')
    }catch(err){
      setError(err.message)
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white rounded-2xl shadow-2xl">
      <h1 className="text-3xl font-bold mb-2 text-gray-800">Sign in to PalmPay</h1>
      <p className="text-sm text-gray-600 mb-6">Use your registered name or email with password to manage palm authentication.</p>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <input 
            placeholder="Name or Email" 
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition"
            value={identifier}
            onChange={(e)=>setIdentifier(e.target.value)}
            disabled={loading}
          />
        </div>
        <div>
          <input 
            placeholder="Password" 
            type="password" 
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            disabled={loading}
          />
        </div>
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        <button 
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition transform hover:scale-[1.01] disabled:opacity-60 disabled:hover:scale-100"
        >
          {loading ? 'Signing in...' : 'Sign in'}
          </button>
        <div className="text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-blue-600 font-semibold hover:underline">
            Create one
          </Link>
        </div>
      </form>
    </div>
  )
}
