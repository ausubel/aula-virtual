import { Certificate } from '@/types/certificate';
import { pdf, Document } from '@react-pdf/renderer';
import { CertificateTemplate } from '../template/CertificateTemplate';
import React from 'react';

export async function downloadCertificate(certificate: Certificate) {
  try {
    // Crear el documento PDF usando createElement
    const element = React.createElement(Document, {},
      React.createElement(CertificateTemplate, { certificate })
    );
    
    // Generar el blob del PDF
    const blob = await pdf(element).toBlob();
    
    // Crear una URL para el blob
    const url = URL.createObjectURL(blob);
    
    // Crear nombre del archivo seguro
    const fileName = `certificado-${certificate.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')}.pdf`;
    
    // Crear enlace de descarga
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    
    // Agregar al DOM y simular clic
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Limpiar la URL del blob después de un momento
    setTimeout(() => URL.revokeObjectURL(url), 100);
  } catch (error) {
    console.error('Error al generar el PDF:', error);
    throw new Error('No se pudo generar el certificado');
  }
}