'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { clearStoredSession, getStoredSession } from '../lib/auth'

export default function Navbar(){
  const router = useRouter()
  const user = useMemo(()=>getStoredSession()?.user || null, [])

  const handleLogout = () => {
    clearStoredSession()
    router.replace('/')
  }

  return (
    <nav className="w-full bg-white/90 backdrop-blur-md sticky top-0 z-40 shadow-md border-b border-gray-200">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <div className="text-2xl font-bold text-gray-800">PalmPay</div>
          <Link href="/home" className="text-sm px-4 py-2 rounded-lg hover:bg-gray-100 transition font-medium text-gray-700">
            Home
          </Link>
          <Link href="/register" className="text-sm px-4 py-2 rounded-lg hover:bg-gray-100 transition font-medium text-gray-700">
            Register
          </Link>
          <Link href="/verify" className="text-sm px-4 py-2 rounded-lg hover:bg-gray-100 transition font-medium text-gray-700">
            Verify
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="px-5 py-2 rounded-lg bg-gray-800 text-white shadow-md hover:bg-gray-900 transition transform hover:scale-105"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
