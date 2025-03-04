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
    
    const blob = await pdf(element).toBlob();
    
    // Crear una URL para el blob
    const url = window.URL.createObjectURL(blob);
    
    // Crear nombre del archivo seguro para la URL
    const fileName = `certificado-${certificate.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // Reemplazar caracteres especiales con guiones
      .replace(/(^-|-$)/g, '')}.pdf`; // Eliminar guiones al inicio y final
    
    // Crear un elemento <a> para descargar
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    
    // Agregar al DOM, hacer clic y remover
    document.body.appendChild(link);
    link.click();
    
    // Pequeño retraso antes de limpiar para asegurar que la descarga comience
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error('Error al generar el PDF:', error);
    throw new Error('No se pudo generar el certificado');
  }
}