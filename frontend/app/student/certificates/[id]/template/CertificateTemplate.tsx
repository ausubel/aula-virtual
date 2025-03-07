import React from 'react';
import { Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { Certificate } from '@/types/certificate';

// Ajustes de colores inspirados en el certificado Platzi
// pero cambiando la marca a "Aula Virtual" y usando tus datos.
const styles = StyleSheet.create({
  // Tamaño: la mitad de un A4 vertical (595 ancho x 421)
  page: {
    width: 595,
    height: 421,
    backgroundColor: '#FFFFFF',
  },
  // Borde exterior grande (azul oscuro)
  outerBorder: {
    flex: 1,
    margin: 10, // Reducido de 10
    borderWidth: 4, // Reducido de 4
    borderStyle: 'solid',
    borderColor: '#0C1421', // Azul muy oscuro
    position: 'relative',
  },
  // Borde interno más claro
  innerBorder: {
    position: 'absolute',
    top: 10, // Reducido de 10
    left: 10, // Reducido de 10
    right: 10, // Reducido de 10
    bottom: 10, // Reducido de 10
    borderWidth: 1, 
    borderStyle: 'solid',
    borderColor: '#455A64', // Azul gris
  },
  // Contenedor principal (todo el contenido dentro de los bordes)
  contentContainer: {
    flex: 1,
    margin: 40, // Reducido de 40
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    textAlign: 'center',
  },
  // Título superior (en lugar de Platzi)
  brandTitle: {
    fontSize: 20, // Reducido de 20
    fontFamily: 'Helvetica-Bold',
    color: '#0C1421',
    marginBottom: 10, // Reducido de 10
    textAlign: 'center',
  },
  // Contenedor para la sección principal de texto (centrado)
  textContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  // Texto "Certifica a"
  certifies: {
    fontSize: 10, // Reducido de 10
    fontFamily: 'Helvetica',
    color: '#333333',
    marginBottom: 4, // Reducido de 4
    textAlign: 'center',
    alignSelf: 'center',
    width: '100%',
  },
  // Nombre del estudiante
  studentName: {
    fontSize: 18, // Reducido de 18
    fontFamily: 'Helvetica-Bold',
    color: '#000000',
    textTransform: 'uppercase',
    marginBottom: 8, // Reducido de 8
    textAlign: 'center',
    alignSelf: 'center',
    width: '100%',
  },
  // Texto "Por participar y aprobar el"
  participation: {
    fontSize: 10, // Reducido de 10
    fontFamily: 'Helvetica',
    color: '#333333',
    marginBottom: 4, // Reducido de 4
    textAlign: 'center',
    alignSelf: 'center',
    width: '100%',
  },
  // Nombre del curso
  courseName: {
    fontSize: 14, // Reducido de 14
    fontFamily: 'Helvetica-Bold',
    color: '#0C1421',
    textTransform: 'uppercase',
    marginBottom: 16, // Reducido de 16
    textAlign: 'center',
    alignSelf: 'center',
    width: '100%',
  },
  // Placeholder de ícono o imagen central
  iconPlaceholder: {
    fontSize: 14, // Reducido de 14
    fontFamily: 'Helvetica-Bold',
    color: '#4B9CD3',
    marginBottom: 16, // Reducido de 16
  },
  // Sección de firma
  signatureSection: {
    marginTop: 10, // Reducido de 10
    marginBottom: 10, // Reducido de 10
    alignItems: 'center',
  },
  signatureLine: {
    width: 100, // Reducido de 100
    height: 1,
    backgroundColor: '#000000',
    marginBottom: 6, // Reducido de 6
  },
  teacherName: {
    fontSize: 10, // Reducido de 10
    textAlign: 'center',
    color: '#4b5563',
    marginBottom: 2, // Reducido de 2
  },
  teacherDegree: {
    fontSize: 8, // Reducido de 8
    textAlign: 'center',
    color: '#374151',
  },
  // Sección final: fecha
  approvalText: {
    fontSize: 10, // Reducido de 10
    fontFamily: 'Helvetica-Bold',
    color: '#333333',
    marginBottom: 4, // Reducido de 4
  },
  dateText: {
    fontSize: 10, // Reducido de 10
    fontFamily: 'Helvetica',
    color: '#333333',
  },
});

interface CertificateTemplateProps {
  certificate: Certificate;
}

/**
 * Certificado con diseño "Platzi-like":
 * - Borde grande oscuro y borde interior más claro.
 * - "Aula Virtual" en la parte superior.
 * - Sección central con "Certifica a", nombre del estudiante, etc.
 * - Un ícono/imagen placeholder en el medio.
 * - Firma y fecha en la parte inferior.
 */
export function CertificateTemplate({ certificate }: CertificateTemplateProps) {
  return (
    <Page size={[595, 421]} style={styles.page}>
      {/* Borde exterior */}
      <View style={styles.outerBorder}>
        {/* Borde interior */}
        <View style={styles.innerBorder} />

        <View style={styles.contentContainer}>
          {/* Título superior en lugar de "Platzi" */}
          <Text style={styles.brandTitle}>Aula Virtual</Text>

          {/* Texto principal del certificado */}
          <View style={styles.textContainer}>
            <Text style={styles.certifies}>Certifica a</Text>
            <Text style={styles.studentName}>{certificate.student_name}</Text>
            <Text style={styles.participation}>Por participar y aprobar el</Text>
            <Text style={styles.courseName}>Curso de {certificate.name}</Text>
          </View>

          {/* Ícono / imagen central (placeholder) */}
          <Text style={styles.iconPlaceholder}>[Icono/Imagen]</Text>

          {/* Sección de firma */}
          <View style={styles.signatureSection}>
            <View style={styles.signatureLine} />
            <Text style={styles.teacherName}>{certificate.teacher_name}</Text>
            <Text style={styles.teacherDegree}>{certificate.teacher_degree}</Text>
          </View>

          {/* Fecha de aprobación */}
          <View>
            <Text style={styles.approvalText}>Aprobado el</Text>
            <Text style={styles.dateText}>
              {new Date(certificate.date_emission).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </View>
        </View>
      </View>
    </Page>
  );
}
