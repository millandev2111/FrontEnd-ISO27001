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
  titleFirstPart = 'Evalua el',
  titleHighlightPart = 'cumplimiento',
  titleLastLines = ['de la ISO27001', 'en tu empresa'],
  buttonText = 'Realice el formulacio',
  descriptionText = 'El fin del siguiente formulario es que se de cuenta si su empresa esta cumpliendo con todas las normativas establecidas para el cumplimiento de esta misma',
}) => {
  return (
    <div className="relative min-h-[90vh]">
      {/* Fondo superior azul con líneas diagonales */}
      <div className="bg-blue-500 w-full min-h-[60vh] relative overflow-hidden">

      </div>

      {/* Fondo inferior gris */}
      <div className="bg-gray-300 w-full min-h-[40vh]">
      </div>

      {/* Tarjeta blanca superpuesta */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl p-8 w-full max-w-lg ">
        <div className="">
          <h1 className="text-3xl font-bold mb-1 text-black">
            {titleFirstPart}
          </h1>
          <h1 className="text-3xl font-bold text-indigo-600 mb-1">
            {titleHighlightPart}
          </h1>
          {titleLastLines.map((line, index) => (
            <h1 key={index} className="text-3xl font-bold mb-1 text-black">
              {line}
            </h1>
          ))}
        </div>

        <div className="my-6  grid place-items-center ">
          <button
            onClick={onFormSubmit}
            className="bg-indigo-600 text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-indigo-700 transition-colors "
          >
            {buttonText}
          </button>
        </div>

        <p className="text-gray-600 max-w-md text-center ">
          {descriptionText}
        </p>

      </div>


      {/* Informacion ISO27001*/}
      <div className="bg-gray-300 w-full ">
        <h1 className='text-3xl text-center'>¿Qué es la ISO/IEC 27001?</h1>
      </div>


    </div>
  );
};

export default Home;