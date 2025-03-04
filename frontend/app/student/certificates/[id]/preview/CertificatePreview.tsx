import type { Certificate } from '@/types/certificate';

interface CertificatePreviewProps {
  certificate: Certificate;
}

export function CertificatePreview({ certificate }: CertificatePreviewProps) {
  return (
    <div className="w-full h-full min-h-[400px] bg-white rounded-lg shadow-inner p-8 relative">
      {/* Bordes decorativos */}
      <div className="absolute inset-4 border-2 border-purple-500 rounded-lg"></div>
      <div className="absolute inset-5 border border-purple-300 rounded-lg"></div>

      {/* Contenido del certificado */}
      <div className="mt-10 mb-5 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Aula Virtual</h1>
      </div>

      <div className="text-center space-y-4">
        <p className="text-gray-600">Certifica a</p>
        <h2 className="text-2xl font-bold text-gray-900 uppercase">{certificate.student_name}</h2>

        <p className="text-gray-600">Por participar y aprobar el</p>
        <h3 className="text-xl font-bold text-gray-900 uppercase">
          Curso de {certificate.name}
        </h3>
      </div>

      {/* Sección de firma */}
      <div className="mt-auto mb-10 text-center">
        <div className="w-48 h-px bg-gray-400 mx-auto mb-2"></div>
        <p className="text-gray-500">{certificate.teacher_name}</p>
        <p className="text-sm font-semibold text-gray-700">{certificate.teacher_degree}</p>
      </div>

      {/* Pie de página */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-sm text-gray-500">Certificado de aprobación online:</p>
        <p className="text-sm text-gray-500">
          {new Date(certificate.date_emission).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
        </p>
      </div>
    </div>
  );
}