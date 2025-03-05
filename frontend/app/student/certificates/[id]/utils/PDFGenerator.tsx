import React, { Suspense } from 'react';
import { Certificate } from '@/types/certificate';

const PDFDocument = React.lazy(() => import('../template/CertificateTemplate').then(mod => ({
  default: mod.CertificateTemplate
})));

interface PDFGeneratorProps {
  certificate: Certificate;
  onGenerated: (blob: Blob) => void;
}

export function PDFGenerator({ certificate, onGenerated }: PDFGeneratorProps) {
  return (
    <div style={{ display: 'none' }}>
      <Suspense fallback={<div>Generando PDF...</div>}>
        <PDFDocument certificate={certificate} />
      </Suspense>
    </div>
  );
}