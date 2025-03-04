import { PDFViewer } from '@react-pdf/renderer';
import { CertificateTemplate } from '../template/CertificateTemplate';
import type { Certificate } from '@/types/certificate';

interface CertificatePreviewProps {
  certificate: Certificate;
}

export function CertificatePreview({ certificate }: CertificatePreviewProps) {
  return (
    <PDFViewer style={{ width: '100%', height: '100%', minHeight: '500px' }}>
      <CertificateTemplate certificate={certificate} />
    </PDFViewer>
  );
}