import React from 'react';
import { Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { Certificate } from '@/types/certificate';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    padding: 40,
  },
  border: {
    flex: 1,
    margin: 15,
    padding: 20,
    border: '3 solid #8b5cf6',
    borderRadius: 10,
    position: 'relative',
  },
  decorativeBorder: {
    position: 'absolute',
    top: 5,
    left: 5,
    right: 5,
    bottom: 5,
    border: '1 solid #c4b5fd',
    borderRadius: 6,
  },
  content: {
    flex: 1,
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    marginTop: 20,
    marginBottom: 30,
    textAlign: 'center',
  },
  institutionName: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
  },
  certifies: {
    fontSize: 18,
    fontFamily: 'Helvetica',
    color: '#4b5563',
    marginBottom: 15,
    textAlign: 'center',
  },
  studentName: {
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 25,
  },
  participation: {
    fontSize: 16,
    fontFamily: 'Helvetica',
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 15,
  },
  courseName: {
    fontSize: 26,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 40,
  },
  signatureSection: {
    marginTop: 'auto',
    marginBottom: 30,
    alignItems: 'center',
  },
  signatureLine: {
    width: 200,
    height: 1,
    backgroundColor: '#000000',
    marginBottom: 8,
  },
  teacherName: {
    fontSize: 16,
    fontFamily: 'Helvetica',
    color: '#4b5563',
    marginBottom: 4,
  },
  teacherDegree: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
  },
  footer: {
    marginTop: 'auto',
    textAlign: 'center',
  },
  onlineText: {
    fontSize: 12,
    fontFamily: 'Helvetica',
    color: '#6b7280',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    fontFamily: 'Helvetica',
    color: '#6b7280',
  },
});

interface CertificateTemplateProps {
  certificate: Certificate;
}

export function CertificateTemplate({ certificate }: CertificateTemplateProps) {
  return (
    <Page size={[595, 421]} style={styles.page}>
      <View style={styles.border}>
        <View style={styles.decorativeBorder} />
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.institutionName}>Aula Virtual</Text>
          </View>

          <View>
            <Text style={styles.certifies}>Certifica a</Text>
            <Text style={styles.studentName}>{certificate.student_name}</Text>

            <Text style={styles.participation}>Por participar y aprobar el</Text>
            <Text style={styles.courseName}>Curso de {certificate.name}</Text>
          </View>

          <View style={styles.signatureSection}>
            <View style={styles.signatureLine} />
            <Text style={styles.teacherName}>{certificate.teacher_name}</Text>
            <Text style={styles.teacherDegree}>{certificate.teacher_degree}</Text>
          </View>

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
        </View>
      </View>
    </Page>
  );
}