'use client'
import './globals.css'
import { usePathname } from 'next/navigation'
import Navbar from '../components/Navbar'

export default function RootLayout({ children }) {
  const pathname = usePathname()
  const showNav = pathname !== '/' && pathname !== '/signup'

  return (
    <html lang="en">
      <body className="min-h-screen">
        {showNav && <Navbar/>}
        <main className="min-h-screen flex items-center justify-center p-6">
          {children}
        </main>
      </body>
    </html>
  )
}
