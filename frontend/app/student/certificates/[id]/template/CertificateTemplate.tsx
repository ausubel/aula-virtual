import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { Certificate } from '@/types/certificate';

// Configuración de estilos usando fuentes del sistema
const styles = StyleSheet.create({
  page: {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    position: 'relative',
  },
  border: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: '#8b5cf6',
    borderRadius: 10,
  },
  decorativeBorder: {
    position: 'absolute',
    top: 25,
    left: 25,
    right: 25,
    bottom: 25,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#c4b5fd',
    borderRadius: 8,
  },
  header: {
    marginTop: 40,
    marginBottom: 20,
    textAlign: 'center',
  },
  institutionName: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  certifies: {
    fontSize: 16,
    fontFamily: 'Helvetica',
    color: '#4b5563',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  studentName: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 20,
  },
  participation: {
    fontSize: 14,
    fontFamily: 'Helvetica',
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 10,
  },
  courseName: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  signatureSection: {
    marginTop: 'auto',
    marginBottom: 40,
    alignItems: 'center',
  },
  signatureLine: {
    width: 200,
    height: 1,
    backgroundColor: '#000000',
    marginBottom: 5,
  },
  teacherName: {
    fontSize: 14,
    fontFamily: 'Helvetica',
    color: '#6b7280',
    marginBottom: 3,
  },
  teacherDegree: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  date: {
    fontSize: 12,
    fontFamily: 'Helvetica',
    color: '#6b7280',
  },
  onlineText: {
    fontSize: 12,
    fontFamily: 'Helvetica',
    color: '#6b7280',
    marginBottom: 5,
  },
});

interface CertificateTemplateProps {
  certificate: Certificate;
}

export function CertificateTemplate({ certificate }: CertificateTemplateProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Bordes decorativos */}
        <View style={styles.border} />
        <View style={styles.decorativeBorder} />

        {/* Contenido del certificado */}
        <View style={styles.header}>
          <Text style={styles.institutionName}>Aula Virtual</Text>
        </View>

        <Text style={styles.certifies}>Certifica a</Text>
        <Text style={styles.studentName}>{certificate.student_name}</Text>

        <Text style={styles.participation}>Por participar y aprobar el</Text>
        <Text style={styles.courseName}>Curso de {certificate.name}</Text>

        {/* Sección de firma */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureLine} />
          <Text style={styles.teacherName}>{certificate.teacher_name}</Text>
          <Text style={styles.teacherDegree}>{certificate.teacher_degree}</Text>
        </View>

        {/* Pie de página */}
        <View style={styles.footer}>
          <Text style={styles.onlineText}>Certificado de aprobación online:</Text>
          <Text style={styles.date}>
            {new Date(certificate.date_emission).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </Text>
        </View>
      </Page>
    </Document>
  );
}