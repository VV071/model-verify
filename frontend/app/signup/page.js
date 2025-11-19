'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '../../lib/api'

export default function SignupPage(){
  const router = useRouter()
  const [name,setName] = useState('')
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [confirm,setConfirm] = useState('')
  const [error,setError] = useState('')
  const [success,setSuccess] = useState('')
  const [loading,setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if(!name || !email || !password){
      setError('All fields are required')
      return
    }
    if(password !== confirm){
      setError('Passwords do not match')
      return
    }

    try{
      setLoading(true)
      await api.signUp({ name, email, password })
      setSuccess('Account created! You can now sign in.')
      setTimeout(()=>router.replace('/'), 1200)
    }catch(err){
      setError(err.message)
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white rounded-2xl shadow-2xl">
      <h1 className="text-3xl font-bold mb-2 text-gray-800">Create account</h1>
      <p className="text-sm text-gray-600 mb-6">Link your palm to secure payments after creating an account.</p>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <input 
          placeholder="Full name"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition"
          value={name}
          onChange={(e)=>setName(e.target.value)}
          disabled={loading}
        />
        <input 
          placeholder="Email"
          type="email"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          disabled={loading}
        />
        <input 
          placeholder="Password"
          type="password"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          disabled={loading}
        />
        <input 
          placeholder="Confirm password"
          type="password"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition"
          value={confirm}
          onChange={(e)=>setConfirm(e.target.value)}
          disabled={loading}
        />
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        {success && (
          <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            {success}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg shadow-md hover:bg-gray-800 transition transform hover:scale-[1.01] disabled:opacity-60 disabled:hover:scale-100"
        >
          {loading ? 'Creating...' : 'Create account'}
        </button>
        <div className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/" className="text-blue-600 font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </form>
    </div>
  )
}

