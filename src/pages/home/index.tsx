import { Github } from '@/icons/github';
import React from 'react';

interface ISOComplianceCardProps {
  onFormSubmit?: () => void;
  titleFirstPart?: string;
  titleHighlightPart?: string;
  titleLastLines?: string[];
  buttonText?: string;
  descriptionText?: string;
}

const Home = ({
  onFormSubmit = () => console.log('Form button clicked'),
  titleFirstPart = 'Evalúa el',
  titleHighlightPart = 'cumplimiento',
  titleLastLines = ['de la ISO27001', 'en tu empresa'],
  buttonText = 'Realizar evaluación',
  descriptionText = 'El siguiente formulario te ayudará a determinar si tu empresa está cumpliendo con todas las normativas establecidas para la implementación efectiva de la ISO27001',
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Banner principal con imagen de fondo */}
      <div className="relative h-96 bg-gradient-to-r from-blue-700 to-indigo-800 overflow-hidden">
        {/* Patrón de seguridad en el fondo */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
            <rect width="100" height="100" fill="url(#grid)" />
            {/* Símbolos de seguridad */}
            <g fill="white">
              <circle cx="20" cy="20" r="2" />
              <circle cx="50" cy="50" r="2" />
              <circle cx="80" cy="80" r="2" />
              <path d="M30,30 L35,30 L35,35 L30,35 Z" />
              <path d="M60,60 L65,60 L65,65 L60,65 Z" />
              <path d="M40,70 L45,70 L45,75 L40,75 Z" />
            </g>
          </svg>
        </div>

        {/* Contenido del banner */}
        <div className="relative flex items-center justify-center max-w-6xl mx-auto px-6 h-full">
          <div className="md:block w-1/3">
            <svg viewBox="0 0 200 200" className="w-full text-white opacity-90">
              <g fill="currentColor">
                <path d="M100,20 L40,50 L40,150 L100,180 L160,150 L160,50 Z" fillOpacity="0.2" />
                <path d="M100,40 L60,60 L60,140 L100,160 L140,140 L140,60 Z" fillOpacity="0.4" />
                <path d="M100,60 L80,70 L80,130 L100,140 L120,130 L120,70 Z" fillOpacity="0.7" />
                <circle cx="100" cy="100" r="15" />
                <path d="M95,85 L105,85 L105,110 L95,110 Z" />
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* Tarjeta de evaluación */}
      <div className="relative mx-auto -mt-32 px-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-lg">
          <div>
            <h1 className="text-3xl font-bold mb-4 text-black">
              {titleFirstPart} <span className="text-indigo-600">{titleHighlightPart}</span> {titleLastLines.join(' ')}
            </h1>
          </div>

          <p className="text-gray-600 text-center">
            {descriptionText}
          </p>
          <div className="my-6 grid place-items-center">
            <button
              onClick={onFormSubmit}
              className="bg-indigo-600 text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-indigo-700 transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {buttonText}
            </button>
          </div>

        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Sección ISO27001 */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">¿Qué es la ISO/IEC 27001?</h2>
            <div className="w-20 h-1 bg-indigo-600 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <p className="text-gray-700 leading-relaxed mb-4">
                La ISO/IEC 27001 es un estándar internacional que establece los requisitos para un Sistema de Gestión de Seguridad de la Información (SGSI). Este estándar proporciona un enfoque sistemático para gestionar la información sensible de una organización, asegurando que permanezca segura.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Publicada por la Organización Internacional de Normalización (ISO) y la Comisión Electrotécnica Internacional (IEC), esta norma define un marco de trabajo metódico, documentado y basado en objetivos específicos de seguridad y evaluación de riesgos.
              </p>
              <p className="text-gray-700 leading-relaxed">
                El estándar es aplicable a organizaciones de cualquier tamaño y sector, y su implementación demuestra a clientes, proveedores y partes interesadas que la organización toma en serio la protección de la información.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Principales beneficios</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-indigo-600 mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Mejora la resistencia frente a ciberataques</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-indigo-600 mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Cumplimiento con requisitos regulatorios y legales</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-indigo-600 mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Aumento de la confianza de clientes y socios comerciales</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-indigo-600 mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Reducción de costos por incidentes de seguridad</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-indigo-600 mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Mejora continua del sistema de gestión de seguridad</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Ciclo PDCA */}
        <section className="mb-16">
          <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">Ciclo de Mejora Continua ISO 27001</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-blue-50 border-t-4 border-blue-600 rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold mr-3">P</div>
                <h4 className="text-xl font-semibold text-blue-800">Planificar</h4>
              </div>
              <p className="text-gray-700">Establecer objetivos, procesos y políticas para la gestión de riesgos y mejora de seguridad.</p>
            </div>
            <div className="bg-green-50 border-t-4 border-green-600 rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold mr-3">D</div>
                <h4 className="text-xl font-semibold text-green-800">Hacer</h4>
              </div>
              <p className="text-gray-700">Implementar y operar las políticas, controles, procesos y procedimientos del SGSI.</p>
            </div>
            <div className="bg-amber-50 border-t-4 border-amber-600 rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="bg-amber-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold mr-3">C</div>
                <h4 className="text-xl font-semibold text-amber-800">Verificar</h4>
              </div>
              <p className="text-gray-700">Evaluar y medir el desempeño de los procesos contra las políticas y objetivos de seguridad.</p>
            </div>
            <div className="bg-purple-50 border-t-4 border-purple-600 rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold mr-3">A</div>
                <h4 className="text-xl font-semibold text-purple-800">Actuar</h4>
              </div>
              <p className="text-gray-700">Tomar acciones correctivas y preventivas basadas en auditorías para la mejora continua.</p>
            </div>
          </div>
        </section>

        {/* Sección NIST Cybersecurity Framework */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">NIST Cybersecurity Framework</h2>
            <div className="w-20 h-1 bg-indigo-600 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <p className="text-gray-700 leading-relaxed mb-4">
                El Marco de Ciberseguridad del Instituto Nacional de Estándares y Tecnología (NIST CSF) es un conjunto de directrices voluntarias diseñadas para ayudar a las organizaciones a gestionar y reducir los riesgos de ciberseguridad.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Desarrollado por el NIST de EE.UU., este marco proporciona un lenguaje común para comprender, gestionar y expresar los riesgos de ciberseguridad tanto internamente como externamente. Es adaptable a organizaciones de todos los tamaños y niveles de riesgo.
              </p>
              <p className="text-gray-700 leading-relaxed">
                A diferencia de la ISO 27001 que es un estándar certificable, el NIST CSF es un marco de referencia flexible que permite a las organizaciones aplicar las prácticas de seguridad más relevantes para sus necesidades específicas.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Funciones principales</h3>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border-l-4 border-red-500 shadow-sm">
                  <h4 className="font-semibold text-red-700">Identificar</h4>
                  <p className="text-sm text-gray-700">Desarrollo de una comprensión organizacional para gestionar los riesgos de ciberseguridad.</p>
                </div>
                <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500 shadow-sm">
                  <h4 className="font-semibold text-blue-700">Proteger</h4>
                  <p className="text-sm text-gray-700">Implementación de salvaguardas para garantizar la prestación de servicios críticos.</p>
                </div>
                <div className="bg-white p-4 rounded-lg border-l-4 border-yellow-500 shadow-sm">
                  <h4 className="font-semibold text-yellow-700">Detectar</h4>
                  <p className="text-sm text-gray-700">Desarrollo e implementación de actividades para identificar la ocurrencia de eventos de ciberseguridad.</p>
                </div>
                <div className="bg-white p-4 rounded-lg border-l-4 border-orange-500 shadow-sm">
                  <h4 className="font-semibold text-orange-700">Responder</h4>
                  <p className="text-sm text-gray-700">Desarrollo e implementación de actividades para tomar medidas ante un incidente detectado.</p>
                </div>
                <div className="bg-white p-4 rounded-lg border-l-4 border-green-500 shadow-sm">
                  <h4 className="font-semibold text-green-700">Recuperar</h4>
                  <p className="text-sm text-gray-700">Desarrollo e implementación de planes para restaurar capacidades o servicios afectados.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Comparativa ISO27001 vs NIST CSF */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Comparativa y Complementariedad</h2>
            <div className="w-20 h-1 bg-indigo-600 mx-auto"></div>
          </div>

          <div className="overflow-hidden rounded-lg shadow-lg">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-3 px-4 bg-indigo-600 text-white text-left">Característica</th>
                  <th className="py-3 px-4 bg-indigo-600 text-white text-left">ISO 27001</th>
                  <th className="py-3 px-4 bg-indigo-600 text-white text-left">NIST CSF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-3 px-4 bg-gray-50 font-medium text-black">Origen</td>
                  <td className="py-3 px-4 text-gray-400">Internacional (ISO/IEC)</td>
                  <td className="py-3 px-4 text-gray-400">Estados Unidos (NIST)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 bg-gray-50 font-medium text-black">Enfoque</td>
                  <td className="py-3 px-4 text-gray-400">Sistema de Gestión (SGSI)</td>
                  <td className="py-3 px-4 text-gray-400">Marco de trabajo para gestionar riesgos</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 bg-gray-50 font-medium text-black">Certificación</td>
                  <td className="py-3 px-4 text-gray-400">Certificable</td>
                  <td className="py-3 px-4 text-gray-400">No certificable (autoevaluación)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 bg-gray-50 font-medium text-black">Estructura</td>
                  <td className="py-3 px-4 text-gray-400">114 controles en 14 dominios</td>
                  <td className="py-3 px-4 text-gray-400">5 funciones, 23 categorías, 108 subcategorías</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 bg-gray-50 font-medium text-black">Flexibilidad</td>
                  <td className="py-3 px-4 text-gray-400">Más prescriptivo</td>
                  <td className="py-3 px-4 text-gray-400">Más flexible y adaptable</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">¿Cómo se complementan?</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Ambos marcos pueden implementarse de manera complementaria. La ISO 27001 proporciona un sistema de gestión formal con requisitos específicos, mientras que el NIST CSF ofrece un enfoque flexible centrado en las funciones clave de ciberseguridad.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Muchas organizaciones utilizan el NIST CSF como guía para estructurar sus programas de ciberseguridad mientras buscan la certificación ISO 27001 para demostrar formalmente su compromiso con la seguridad de la información. Esto crea un enfoque integral que combina lo mejor de ambos marcos.
            </p>
          </div>
        </section>

        {/* Pasos para implementación */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Implementación Práctica</h2>
            <div className="w-20 h-1 bg-indigo-600 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 text-indigo-800 rounded-full text-xl font-bold mb-4">1</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Evaluación de Requisitos</h3>
              <p className="text-gray-700">Analiza el estado actual de la seguridad en tu organización e identifica brechas con respecto a los estándares.</p>
              <ul className="mt-4 space-y-2 text-gray-600 text-sm">
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-indigo-600 mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Inventario de activos de información</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-indigo-600 mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Análisis GAP</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-indigo-600 mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Mapeo de requisitos legales</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 text-indigo-800 rounded-full text-xl font-bold mb-4">2</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Desarrollo e Implementación</h3>
              <p className="text-gray-700">Crea y despliega políticas, procedimientos y controles alineados con los marcos seleccionados.</p>
              <ul className="mt-4 space-y-2 text-gray-600 text-sm">
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-indigo-600 mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Desarrollo de política de seguridad</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-indigo-600 mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Implementación de controles</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-indigo-600 mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Gestión de riesgos</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 text-indigo-800 rounded-full text-xl font-bold mb-4">3</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Monitoreo y Mejora</h3>
              <p className="text-gray-700">Evalúa continuamente la eficacia del sistema y realiza mejoras basadas en métricas.</p>
              <ul className="mt-4 space-y-2 text-gray-600 text-sm">
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-indigo-600 mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Auditorías internas</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-indigo-600 mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Revisión por la dirección</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-indigo-600 mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Mejora continua</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 mt-auto">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Sobre nosotros</h3>
              <p className="text-gray-400">
                Somos especialistas en seguridad de la información y cumplimiento normativo, 
                comprometidos con ayudar a las organizaciones a proteger sus activos digitales.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Enlaces rápidos</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Inicio</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Servicios</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Recursos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Contacto</h3>
              <ul className="space-y-2 text-gray-400 flex-wrap">
                <div className='flex items-center gap-2'>
                  <Github/>
                  <a href='https://github.com/xJuanes21' target='_blank' className='hover:underline'>xJuanes21</a>
                  </div>
                  <div className='flex items-center gap-2'>
                  <Github/>
                  <a href='https://github.com/millandev2111' target='_blank' className='hover:underline'>millandev2111</a>
                  </div>
                  <div className='border-b border-gray-700'/>
                <li className="flex items-start flex-wrap gap-1">
                  <div className='flex'>
                  <svg className="w-5 h-5 text-indigo-400 mt-1 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>millandev2111@gmail.com</span>
                  </div>
                  <div className='flex'>
                  <svg className="w-5 h-5 text-indigo-400 mt-1 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>juanesalazar2004@example.com</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-sm text-gray-400 text-center">
            &copy; {new Date().getFullYear()} Innovacode. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;