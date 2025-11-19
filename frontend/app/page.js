'use client'
import Link from 'next/link'

export default function Signin(){
  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white rounded-2xl shadow-2xl">
      <h1 className="text-3xl font-bold mb-2 text-gray-800">Welcome to PalmAuth</h1>
      <p className="text-sm text-gray-600 mb-6">This is a fake Signin/Signup UI — no authentication (front-end demo).</p>

      <div className="space-y-4">
        <div>
          <input 
            placeholder="Email" 
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition"
          />
        </div>
        <div>
          <input 
            placeholder="Password" 
            type="password" 
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition transform hover:scale-[1.02]">
            Sign in
          </button>
          <Link
            href="/home"
            className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Enter Demo
          </Link>
        </div>
        <div className="text-center text-xs text-gray-400 pt-2">
          Or try Register palm → Verify palm from navbar after entering demo.
        </div>
      </div>
    </div>
  )
}
