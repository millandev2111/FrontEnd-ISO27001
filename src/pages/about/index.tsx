import React from 'react';
import { User, Code, Terminal, ArrowRight } from 'lucide-react';

interface TeamMemberProps {
  name: string;
  career: string;
  path: string;
}

interface AboutUsProps {
  title?: string;
  subtitle?: string;
  companyDescription?: string;
  teamMembers?: TeamMemberProps[];
}

const AboutUs: React.FC<AboutUsProps> = ({
  title = "Sobre Nosotros",
  subtitle = "Innovacode: Creatividad y Tecnología",
  companyDescription = "Somos un equipo apasionado de desarrolladores en Cali, comprometidos a transformar ideas innovadoras en soluciones tecnológicas de alto impacto.",
  teamMembers = [
    {
      name: "Andres Felipe Cardona",
      career: "Ingeniería Informática",
      path: "/assets/andres.webp"
    },
    {
      name: "Juan Esteban Salazar",
      career: "Ingeniería  Informática",
      path: "/assets/juanes.webp"
    }
  ]
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-indigo-600 w-full py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {/* Background pattern */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute h-40 w-40 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5
              }}
            />
          ))}
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex items-center text-white space-x-3 mb-4">
            <Code className="w-8 h-8" />
            <h2 className="text-2xl font-semibold">Innovacode</h2>
          </div>
          <h1 className="text-5xl font-bold text-white mb-6">
            {title}
          </h1>
          <h2 className="text-3xl font-medium text-indigo-200 mb-8">
            {subtitle}
          </h2>
          <p className="text-white text-xl max-w-2xl leading-relaxed">
            {companyDescription}
          </p>
          <div className="mt-12 flex items-center">
            <div className="h-1 w-16 bg-white rounded-full"></div>
            <Terminal className="w-6 h-6 text-white mx-3" />
            <div className="h-1 flex-grow bg-white rounded-full"></div>
          </div>
        </div>
      </div>

      {/* About Project Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">Nuestro Proyecto Académico</h3>
            <p className="text-lg text-gray-600 mb-6">
              Este proyecto fue desarrollado como parte del curso <span className="font-semibold text-indigo-700">Proyecto Informático I</span> en la Universidad Autónoma de Occidente en Cali.
            </p>
            <p className="text-lg text-gray-600 mb-8">
              Durante este proyecto desarrollamos una solución integral para la auditoría de la norma ISO 27001, utilizando un stack tecnológico moderno y robusto basado en Strapi como backend headless y Next.js para el frontend. Esta combinación nos permitió crear una aplicación escalable, segura y eficiente, que facilita la gestión y evaluación de controles de seguridad. El enfoque práctico nos permitió afianzar conocimientos en desarrollo web full stack y aplicar buenas prácticas en el manejo de datos sensibles, alineándonos con los requerimientos de la norma.</p>
            <div className="flex items-center justify-center gap-4">
              <div className="h-1 w-12 bg-indigo-600 rounded-full"></div>
              <div className="h-2 w-2 bg-indigo-600 rounded-full"></div>
              <div className="h-1 w-36 bg-indigo-600 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-6">Nuestro Equipo</h2>
          <p className="text-center text-gray-600 text-lg max-w-3xl mx-auto mb-16">
            Ambos somos desarrolladores <span className="font-bold text-indigo-600">Fullstack</span> para este proyecto, combinando nuestras habilidades para crear soluciones completas y eficientes.
          </p>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
              >
                <div className="h-56 bg-gradient-to-r from-indigo-500 to-purple-600 flex justify-center items-center">
                  <img
                    src={member.path}
                    alt={member.name}
                    className="h-40 w-40 object-cover rounded-full border-4 border-white shadow-lg"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{member.name}</h3>
                  <p className="text-indigo-600 font-medium">{member.career}</p>
                  <div className="mt-4 px-4 py-1 bg-indigo-100 text-indigo-800 rounded-full inline-block text-sm font-medium">
                    Universidad Autónoma de Occidente
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>



      {/* Footer */}

    </div>
  );
};

export default AboutUs;