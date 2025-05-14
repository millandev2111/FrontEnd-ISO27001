import React, { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'
import { setCookie } from 'cookies-next' // Necesitarás instalar este paquete

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
      const response = await axios.post('http://localhost:1337/api/auth/local', {
        identifier: email,
        password,
      })

      // Guardamos el token en una cookie que el middleware pueda leer
      // No usamos HttpOnly para que el middleware pueda acceder a ella
      setCookie('auth_token', response.data.jwt, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 semana
        sameSite: 'strict',
      })

      // También podemos guardar el usuario si es necesario
      setCookie('user_info', JSON.stringify(response.data.user), {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 semana
        sameSite: 'strict',
      })

      // Redirigir al welcome después de login exitoso
      router.push('/welcome')

      // Limpiar los campos y el error
      setEmail('')
      setPassword('')
      setError('')

    } catch (err: any) {
      setError('Invalid credentials. Please try again.')
      console.error('Error de autenticación:', err.response?.data?.error?.message || err.message || err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 h-screen bg-blue-50">
      {/* Hero Section - Fondo Sólido */}
      <div className="h-full w-full bg-blue-500 flex justify-center items-center">
        <div className="m-12 w-1/3 md:w-2/5">
          <h1 className="text-white text-3xl font-bold">MyApp</h1>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex flex-col justify-center items-center h-full p-10">
        <div className="max-w-xl w-full bg-white p-10 rounded-lg shadow-lg">
          {/* Form Title */}
          <div className="flex items-center gap-4 mb-6">
            <h3 className="text-xl md:text-2xl font-semibold">Bienvenid@</h3>
          </div>
          <p className="text-gray-500 mb-6">Por favor, inicie sesión aquí.</p>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6 mt-8">
            {/* Error Message */}
            {error && <p className="text-red-600 mb-4">{error}</p>}

            {/* Email Input */}
            <div className="mb-6">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
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

            {/* Password Input */}
            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
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

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Login'}
            </button>

            {/* Links */}
          {/*  <div className="flex justify-between w-full mt-4">
              <a href="/create-account" className="text-blue-500">
                Create an account
              </a>
              <a href="/recover-password" className="text-blue-500">
                Recover your password
              </a>
            </div> */}
          </form>
        </div>
      </div>
    </section>
  )
}

export default Login