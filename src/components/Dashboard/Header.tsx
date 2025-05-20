import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { deleteCookie, getCookie } from 'cookies-next'

// Definir el tipo de datos para el usuario
interface UserData {
  username: string;
  email?: string;  // 'email' es opcional
}

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const [userData, setUserData] = useState<UserData>({ username: 'Usuario' })
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Efecto para cerrar el dropdown cuando se hace clic fuera de él
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;

      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Obtener la información del usuario desde las cookies
  useEffect(() => {
    const userInfo = getCookie('user_info')

    if (userInfo) {
      const userParsed = JSON.parse(userInfo as string)  // Parsear el JSON
      setUserData(userParsed)  // Establecer los datos del usuario
    } else {
      console.log('No hay datos de usuario en las cookies.')
    }
  }, [])

  const handleLogout = () => {
    deleteCookie('auth_token')
    deleteCookie('user_info')

    router.push('/login')
  }

  // Decidir qué nombre mostrar
  const displayName = userData?.username || userData?.email?.split('@')[0] || 'Usuario'

  // Verificar si estamos en la ruta /dashboard
  const isDashboardPage = router.pathname === '/dashboard'

  return (
    <header className="bg-blue-500 shadow-sm z-10">
      <div className="flex justify-between items-center px-6 py-3">
        {isDashboardPage ? (
          <h2 className="text-xl text-white">
            Bienvenido a tú Dashboard, <span className="font-medium">{displayName}</span>!
          </h2>
        ) : (
          // Div vacío para mantener el espacio cuando no hay título
          <div></div>
        )}

        <div className="flex items-center">
         

          {/* Avatar de usuario con menú desplegable */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center space-x-2 focus:outline-none"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                {userData?.username ? (
                  <span className="text-sm font-medium">
                    {userData.username.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Menú desplegable */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md overflow-hidden shadow-lg z-20 border border-gray-100">
                <a
                  href="/home"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Salir de Dashboard
                </a>
              
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}