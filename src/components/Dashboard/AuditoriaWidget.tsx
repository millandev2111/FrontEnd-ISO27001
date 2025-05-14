import React from 'react'

const AuditoriaWidget = () => {
  const progress = 80; // Este valor debería venir de tus datos dinámicos
  const totalControls = 30;
  const completedControls = 21;

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-sm">
      {/* Título */}
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Auditoría</h3>

      {/* Diagrama de progreso (circulante) */}
      <div className="flex flex-col items-center mb-4">
        <div className="relative w-24 h-24">
          <svg className="absolute top-0 left-0 w-full h-full transform rotate-90" viewBox="0 0 36 36">
            <path
              className="text-gray-200"
              fill="none"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="100, 100"
              d="M18 2 a16 16 0 0 1 0 32 a16 16 0 0 1 0 -32"
            ></path>
            <path
              className="text-purple-500"
              fill="none"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${progress}, 100`}
              d="M18 2 a16 16 0 0 1 0 32 a16 16 0 0 1 0 -32"
            ></path>
          </svg>
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            <span className="text-xl font-semibold">{progress}%</span>
          </div>
        </div>
      </div>

      {/* Progress check */}
      <div className="text-center">
        <p className="text-sm text-gray-600">Controladores Evaluados:</p>
        <p className="font-semibold text-gray-800">{completedControls} de {totalControls}</p>
      </div>

      {/* Botón para evaluar */}
      <div className="mt-4">
        <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
          Evaluar cumplimiento
        </button>
      </div>
    </div>
  )
}

export default AuditoriaWidget
