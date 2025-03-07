import type { Certificate } from '@/types/certificate';

interface CertificatePreviewProps {
  certificate: Certificate;
}

export function CertificatePreview({ certificate }: CertificatePreviewProps) {
  return (
    <div className="w-full h-full min-h-[300px] bg-white rounded-lg shadow-inner p-4 relative bw-0.5 bc-gray-300"> {/* shadow-lg → shadow-inner */}
      {/* Bordes decorativos - cambiados a azul para coincidir con la versión PDF */}
      <div className="absolute inset-2 border-[3px] border-blue-900"></div> {/* border-purple-500 → border-blue-900 (#0C1421) */}
      <div className="absolute inset-3 border-[1px] border-blue-700 m-1"></div>{/* border-purple-300 → border-blue-700 (#455A64) */}

      {/* Contenedor principal con flexbox para centrar verticalmente */}
      <div className="flex flex-col justify-between items-center h-full py-3">
        {/* Título superior */}
        <div className="w-full text-center mb-2">
          <h1 className="text-xl font-bold text-blue-900">Aula Virtual</h1> {/* text-gray-900 → text-blue-900 */}
        </div>

        {/* Contenido principal centrado */}
        <div className="w-full flex flex-col items-center text-center px-2 space-y-2">
          <p className="text-xs text-gray-600 w-full">Certifica a</p>
          <h2 className="text-lg font-bold text-gray-900 uppercase w-full">
            {certificate.student_name}
          </h2>

          <p className="text-xs text-gray-600 w-full">Por participar y aprobar el</p>
          <h3 className="text-base font-bold text-blue-900 uppercase w-full"> {/* text-gray-900 → text-blue-900 */}
            Curso de {certificate.name}
          </h3>
        </div>

        {/* Elemento decorativo (equivalente al placeholder de icono) */}
        <div className="text-blue-500 font-bold my-3 text-sm">[Icono/Imagen]</div>

        {/* Sección de firma */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-px bg-gray-400 mb-1"></div>
          <p className="text-xs text-gray-500 text-center">{certificate.teacher_name}</p>
          <p className="text-[0.65rem] font-semibold text-gray-700 text-center">{certificate.teacher_degree}</p>
        </div>

        {/* Pie de página */}
        <div className="w-full text-center mt-2">
          <p className="text-xs font-semibold text-gray-700">Aprobado el</p>
          <p className="text-xs text-gray-500">
            {new Date(certificate.date_emission).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </p>
        </div>
      </div>
    </div>
  );
}