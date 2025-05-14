'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Welcome() {
  const router = useRouter()

  // Asegurarnos de que el usuario esté logueado
  useEffect(() => {
    const token = localStorage.getItem('auth_token') // O el método que utilices para guardar el token
    if (!token) {
      router.push('/login') // Si no está logueado, redirigir al login
    }
  }, [router])

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-blue-50">
      <div className="bg-white p-10 rounded-lg shadow-lg max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-blue-500 mb-6">¡Te has logueado!</h1>
        <p className="text-lg text-gray-600 mb-4">Bienvenido a tu cuenta. Haz clic en el botón para ir al dashboard.</p>
        <button
          onClick={() => router.push('/dashboard')} // Redirigir al dashboard
          className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
        >
          Abrir Dashboard
        </button>
      </div>
    </div>
  )
}
