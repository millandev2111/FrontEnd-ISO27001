'use client';
import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { User } from '@/icons/user';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Control de visibilidad basado en scroll
  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;

      // Si estamos al principio de la página, siempre mostramos la navbar
      if (currentScrollY < 100) {
        setIsVisible(true);
        setLastScrollY(currentScrollY);
        return;
      }

      // Si estamos scrolleando hacia abajo, ocultamos la navbar
      if (currentScrollY > lastScrollY) {
        setIsVisible(false);
      }
      // Si estamos scrolleando hacia arriba, mostramos la navbar
      else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', controlNavbar);

    // Limpieza del event listener
    return () => {
      window.removeEventListener('scroll', controlNavbar);
    };
  }, [lastScrollY]);

  return (
    <>
      {/* Este div actúa como espaciador para compensar la altura del navbar fixed */}
      <div className="h-16"></div>
      
      <nav
        style={{ transform: isVisible ? 'translateY(0)' : 'translateY(-100%)', transition: 'transform 0.3s' }}
        className="bg-gradient-to-l bg-white shadow-md fixed w-full z-50 top-0 left-0"
      >
        <div className="container px-4 mx-auto">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <div className="rounded flex items-center justify-center text-white font-bold">
                <Link href="/">
                  <Image src="/logoipsum-360.svg" alt="Logo" width={200} height={200} />
                </Link> 
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-8 font-open">
              <Link href="/home" className="text-black hover:text-gray-700 px-3 py-2 font-medium transition-colors">
                Inicio
              </Link>
              <Link href="/dashboard" className="text-black hover:text-gray-700 px-3 py-2 font-medium transition-colors">
                Dashboard
              </Link>
              <Link href="/about" className="text-black hover:text-gray-700 px-3 py-2 font-medium transition-colors">
                Sobre Nosotros
              </Link>

            </div>
              <div>
                <Link href="/login" className="text-white bg-[#5233DD] px-3 py-2 font-bold transition-colors flex gap-2 items-center rounded-md hover:bg-[#5233DD]/80">
                Iniciar Sesión
                <User/>
              </Link>
              </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-orange-600 focus:outline-none"
              >
                {isOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden bg-white bg-opacity-95">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link href="/home" className="block px-3 py-2 rounded-md text-base font-medium text-black hover:text-gray-700 hover:bg-gray-100">
                Inicio
              </Link>
              <Link href="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-black hover:text-gray-700 hover:bg-gray-100">
                Dashboard
              </Link>
              <Link href="/labs" className="block px-3 py-2 rounded-md text-base font-medium text-black hover:text-gray-700 hover:bg-gray-100">
                Sobre Nosotros
              </Link>
              <Link href="/login" className="block px-3 py-2 rounded-md text-base font-medium text-black hover:text-gray-700 hover:bg-gray-100">
                Iniciar Sesión
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}