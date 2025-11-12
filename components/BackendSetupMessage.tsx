import { View, Text, StyleSheet, ScrollView, Linking, TouchableOpacity } from 'react-native';
import { AlertCircle, Database, ExternalLink } from 'lucide-react-native';

interface BackendSetupMessageProps {
  error: Error;
}

export function BackendSetupMessage({ error }: BackendSetupMessageProps) {
  const isDatabaseError = 
    error.message.includes('404') || 
    error.message.includes('Server did not start') ||
    error.message.includes('Backend no disponible') ||
    error.message.includes('No se pudo conectar');

  if (!isDatabaseError) {
    return null;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.iconContainer}>
        <Database size={48} color="#f59e0b" />
      </View>

      <Text style={styles.title}>⚠️ Backend No Disponible</Text>
      
      <View style={styles.errorBox}>
        <AlertCircle size={20} color="#ef4444" />
        <Text style={styles.errorText}>{error.message}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔧 ¿Qué necesitas hacer?</Text>
        <Text style={styles.paragraph}>
          Tu aplicación necesita una base de datos PostgreSQL para funcionar. 
          Es gratis y toma solo 5 minutos configurarla.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚀 Solución Rápida</Text>
        
        <View style={styles.stepContainer}>
          <Text style={styles.stepNumber}>1.</Text>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Crea una base de datos gratis</Text>
            <Text style={styles.stepText}>Ve a Supabase.com y crea un proyecto gratis</Text>
            <TouchableOpacity style={styles.linkButton} onPress={() => Linking.openURL('https://supabase.com')}>
              <Text style={styles.linkText}>Abrir Supabase</Text>
              <ExternalLink size={16} color="#3b82f6" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.stepContainer}>
          <Text style={styles.stepNumber}>2.</Text>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Copia tu Connection String</Text>
            <Text style={styles.stepText}>
              En Supabase: Settings → Database → Connection string
            </Text>
          </View>
        </View>

        <View style={styles.stepContainer}>
          <Text style={styles.stepNumber}>3.</Text>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Pégalo en tu archivo .env</Text>
            <Text style={styles.stepText}>
              Edita el archivo .env en tu proyecto y pega el connection string en DATABASE_URL
            </Text>
          </View>
        </View>

        <View style={styles.stepContainer}>
          <Text style={styles.stepNumber}>4.</Text>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Ejecuta los comandos</Text>
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>bunx prisma generate</Text>
              <Text style={styles.codeText}>bunx prisma migrate deploy</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📖 Documentación Completa</Text>
        <Text style={styles.paragraph}>
          Para más detalles, lee el archivo DATABASE-SETUP-RORK.md en tu proyecto
        </Text>
      </View>

      <View style={styles.alternativesSection}>
        <Text style={styles.alternativesTitle}>Otras opciones gratuitas:</Text>
        <TouchableOpacity style={styles.altButton} onPress={() => Linking.openURL('https://neon.tech')}>
          <Text style={styles.altButtonText}>• Neon.tech</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.altButton} onPress={() => Linking.openURL('https://railway.app')}>
          <Text style={styles.altButtonText}>• Railway.app</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
    marginBottom: 24,
    width: '100%',
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#991b1b',
    lineHeight: 20,
  },
  section: {
    width: '100%',
    marginBottom: 24,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1e293b',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  stepNumber: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#3b82f6',
    width: 24,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1e293b',
    marginBottom: 4,
  },
  stepText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 8,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  linkText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600' as const,
  },
  codeBox: {
    backgroundColor: '#1e293b',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#e2e8f0',
    marginBottom: 4,
  },
  alternativesSection: {
    width: '100%',
    padding: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    marginBottom: 24,
  },
  alternativesTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#475569',
    marginBottom: 8,
  },
  altButton: {
    paddingVertical: 6,
  },
  altButtonText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500' as const,
  },
});
