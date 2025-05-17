import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // Obtener el token de las cookies
  const token = request.cookies.get('auth_token')?.value

  // Si no hay token, redirigir al login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    // Opcionalmente, puedes validar el token con Strapi
    // Esto es más seguro que simplemente verificar si existe
    const validateResponse = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL || 'https://backend-iso27001.onrender.com'}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!validateResponse.ok) {
      // Si el token no es válido, limpia las cookies y redirige al login
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('auth_token')
      response.cookies.delete('user_info')
      return response
    }

    // Si el token es válido, permite el acceso
    return NextResponse.next()
  } catch (error) {
    // Si hay un error en la validación, también redirige al login
    console.error('Error validando token:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

// Configuración para proteger las rutas que requieren autenticación
export const config = {
  matcher: [
    '/welcome',
    '/dashboard',
    '/dashboard/:path*', // Protege todas las subrutas de dashboard
    // Agrega aquí más rutas que desees proteger
  ],
}