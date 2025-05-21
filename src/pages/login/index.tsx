import React, { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'
import { setCookie } from 'cookies-next'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await axios.post(
        'https://backend-iso27001.onrender.com/api/auth/local',
        {
          identifier: email,
          password,
        },
        {
          withCredentials: true, // <<< Esto es clave para que funcione cookie cross-site
        }
      )

      // Guardamos el token en una cookie que el middleware pueda leer
      // Configuración para producción que soporta cross-site cookies
      setCookie('auth_token', response.data.jwt, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 semana
        sameSite: 'none',         // <<< Cambiado de 'strict' a 'none' para cross-site
        secure: process.env.NODE_ENV === 'production', // <<< Solo secure en producción HTTPS
      })

      setCookie('user_info', JSON.stringify(response.data.user), {
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'none',
        secure: process.env.NODE_ENV === 'production',
      })

      router.push('/welcome')

      setEmail('')
      setPassword('')
      setError('')
    } catch (err: any) {
      setError('Invalid credentials. Please try again.')
      console.error(
        'Error de autenticación:',
        err.response?.data?.error?.message || err.message || err
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 h-screen  bg-blue-50">
      <div
        className="w-full h-full bg-[url('/assets/imglogin.webp')]  bg-no-repeat bg-cover bg-center  flex justify-center items-center"
      ></div>

      <div className="flex flex-col justify-center items-center h-full p-10 w-full">
        <div className="max-w-xl w-full bg-white p-10 rounded-lg shadow-lg">
          <div className="flex items-center gap-4 mb-6">
            <h3 className="text-xl md:text-2xl font-semibold">Bienvenid@</h3>
          </div>
          <p className="text-gray-500 mb-6">Por favor, inicie sesión aquí.</p>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6 mt-8">
            {error && <p className="text-red-600 mb-4">{error}</p>}

            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="p-3 border border-gray-300 rounded-md w-full"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="p-3 border border-gray-300 rounded-md w-full"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default Login
