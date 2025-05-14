import { useRouter } from 'next/router'
import { deleteCookie } from 'cookies-next'

const Logout = () => {
  const router = useRouter()

  const handleLogout = () => {
    // Eliminar las cookies
    deleteCookie('auth_token')
    deleteCookie('user_info')
    
    // Redirigir al login
    router.push('/login')
  }

  return (
    <button 
      onClick={handleLogout}
      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
    >
      Cerrar Sesión
    </button>
  )
}

export default Logout