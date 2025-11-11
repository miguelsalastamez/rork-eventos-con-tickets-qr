import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { User, Users, Check, Copy, RefreshCcw, Eye, EyeOff, AlertCircle, CheckCircle2, Shield } from 'lucide-react-native';
import { useUser } from '@/contexts/UserContext';
import { useEvents } from '@/contexts/EventContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserRole } from '@/types';
import { trpcClient } from '@/lib/trpc';

interface TestUser {
  id: string;
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  organizationId?: string;
}

export default function TestUsersScreen() {
  const router = useRouter();
  const { user: currentUser, saveUser, organizations, addOrganization } = useUser();
  const { events } = useEvents();
  const [testUsers, setTestUsers] = useState<TestUser[]>([]);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadTestUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTestUsers = async () => {
    try {
      const stored = await AsyncStorage.getItem('@test_users');
      if (stored) {
        setTestUsers(JSON.parse(stored));
      } else {
        generateTestUsers();
      }
    } catch (error) {
      console.error('Error loading test users:', error);
    }
  };

  const generateTestUsers = async () => {
    setIsGenerating(true);
    try {
      let orgId = organizations[0]?.id;
      
      if (!orgId) {
        const newOrg = {
          id: `org-${Date.now()}`,
          name: 'Organización de Prueba',
          description: 'Organización creada para pruebas del sistema',
          ownerId: 'test-owner',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await addOrganization(newOrg);
        orgId = newOrg.id;
      }

      const users: TestUser[] = [
        {
          id: `user-super-${Date.now()}`,
          email: 'superadmin@test.com',
          password: 'Super123!',
          fullName: 'Carlos Martínez (Super Admin)',
          role: 'super_admin',
          organizationId: orgId,
        },
        {
          id: `user-seller-${Date.now()}`,
          email: 'admin@test.com',
          password: 'Admin123!',
          fullName: 'María González (Admin)',
          role: 'seller_admin',
          organizationId: orgId,
        },
        {
          id: `user-collab-${Date.now()}`,
          email: 'colaborador@test.com',
          password: 'Collab123!',
          fullName: 'Juan Pérez (Colaborador)',
          role: 'collaborator',
          organizationId: orgId,
        },
        {
          id: `user-viewer-${Date.now()}`,
          email: 'visitante@test.com',
          password: 'Viewer123!',
          fullName: 'Ana López (Visitante)',
          role: 'viewer',
          organizationId: orgId,
        },
      ];

      await AsyncStorage.setItem('@test_users', JSON.stringify(users));
      setTestUsers(users);

      Alert.alert(
        '✅ Usuarios Generados',
        `Se han creado ${users.length} usuarios de prueba con diferentes perfiles.`
      );
    } catch (error) {
      console.error('Error generating test users:', error);
      Alert.alert('Error', 'No se pudieron generar los usuarios de prueba');
    } finally {
      setIsGenerating(false);
    }
  };

  const loginAsUser = async (testUser: TestUser) => {
    try {
      let response;
      try {
        response = await trpcClient.auth.login.mutate({
          email: testUser.email,
          password: testUser.password,
        });
      } catch (loginError) {
        console.log('User does not exist in DB, creating...');
        try {
          await trpcClient.auth.register.mutate({
            email: testUser.email,
            password: testUser.password,
            fullName: testUser.fullName,
            role: testUser.role,
            organizationId: testUser.organizationId,
          });
          
          response = await trpcClient.auth.login.mutate({
            email: testUser.email,
            password: testUser.password,
          });
        } catch (registerError) {
          console.error('Error registering user:', registerError);
          throw registerError;
        }
      }

      if (!response) {
        throw new Error('No se pudo obtener respuesta del servidor');
      }

      await saveUser(response.user, response.token);

      Alert.alert(
        '✅ Sesión Iniciada',
        `Ahora estás autenticado como:\n${testUser.fullName}\n\nRol: ${getRoleLabel(testUser.role)}`,
        [
          {
            text: 'Ver Eventos',
            onPress: () => router.push('/'),
          },
          {
            text: 'OK',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.error('Error logging in as user:', error);
      Alert.alert('Error', `No se pudo iniciar sesión como este usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const copyCredentials = (testUser: TestUser) => {
    const text = `Email: ${testUser.email}\nContraseña: ${testUser.password}`;
    if (Clipboard && Clipboard.setString) {
      Clipboard.setString(text);
      Alert.alert('✅ Copiado', 'Las credenciales se han copiado al portapapeles');
    } else {
      Alert.alert(
        'Credenciales',
        text,
        [{ text: 'OK' }]
      );
    }
  };

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswords((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return 'Super Administrador';
      case 'seller_admin':
        return 'Administrador';
      case 'collaborator':
        return 'Colaborador';
      case 'viewer':
        return 'Visitante';
      default:
        return 'Usuario';
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return '#dc2626';
      case 'seller_admin':
        return '#6366f1';
      case 'collaborator':
        return '#10b981';
      case 'viewer':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    const color = getRoleColor(role);
    switch (role) {
      case 'super_admin':
        return <Shield color={color} size={20} />;
      case 'seller_admin':
        return <User color={color} size={20} />;
      case 'collaborator':
        return <Users color={color} size={20} />;
      case 'viewer':
        return <Eye color={color} size={20} />;
      default:
        return <User color={color} size={20} />;
    }
  };

  const getRolePermissions = (role: UserRole) => {
    const permissions = {
      super_admin: [
        'Crear, editar y eliminar eventos',
        'Gestionar todos los aspectos de eventos',
        'Administrar organizaciones',
        'Gestionar usuarios y permisos',
        'Gestionar suscripciones',
        'Acceso total al sistema',
      ],
      seller_admin: [
        'Crear, editar y eliminar eventos',
        'Gestionar asistentes y tickets',
        'Realizar sorteos y premios',
        'Enviar mensajes masivos',
        'Gestionar organización propia',
        'Ver reportes y estadísticas',
      ],
      collaborator: [
        'Editar eventos (no crear ni eliminar)',
        'Gestionar asistentes',
        'Registrar accesos (check-in)',
        'Realizar sorteos',
        'Enviar mensajes',
        'Ver reportes',
      ],
      viewer: [
        'Solo lectura de eventos',
        'Ver lista de asistentes',
        'Ver reportes',
        'No puede hacer cambios',
      ],
    };
    return permissions[role as keyof typeof permissions] || [];
  };

  const deleteTestUsers = () => {
    Alert.alert(
      '⚠️ Eliminar Usuarios',
      '¿Estás seguro de que deseas eliminar todos los usuarios de prueba? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('@test_users');
              setTestUsers([]);
              Alert.alert('✅ Eliminados', 'Los usuarios de prueba han sido eliminados');
            } catch (error) {
              console.error('Error deleting test users:', error);
              Alert.alert('Error', 'No se pudieron eliminar los usuarios');
            }
          },
        },
      ]
    );
  };

  if (currentUser?.role !== 'super_admin') {
    return (
      <View style={styles.container}>
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <View style={styles.errorContainer}>
            <AlertCircle color="#ef4444" size={48} />
            <Text style={styles.errorTitle}>Acceso Denegado</Text>
            <Text style={styles.errorText}>
              Solo los Super Administradores pueden acceder a esta pantalla.
            </Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>Volver</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Usuarios de Prueba</Text>
            <Text style={styles.headerSubtitle}>
              {testUsers.length} usuarios generados
            </Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <AlertCircle color="#3b82f6" size={24} />
          <View style={styles.infoCardContent}>
            <Text style={styles.infoCardTitle}>Prueba de Permisos</Text>
            <Text style={styles.infoCardText}>
              Usa estos usuarios para probar diferentes niveles de acceso en la aplicación.
              Cada usuario tiene un rol específico con permisos limitados.
            </Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{testUsers.length}</Text>
            <Text style={styles.statLabel}>Usuarios</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{organizations.length}</Text>
            <Text style={styles.statLabel}>Organizaciones</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{events.length}</Text>
            <Text style={styles.statLabel}>Eventos</Text>
          </View>
        </View>

        {testUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Users color="#9ca3af" size={64} />
            <Text style={styles.emptyTitle}>No hay usuarios de prueba</Text>
            <Text style={styles.emptyText}>
              Genera usuarios de prueba para probar diferentes perfiles de usuario
            </Text>
            <TouchableOpacity
              style={styles.generateButton}
              onPress={generateTestUsers}
              disabled={isGenerating}
            >
              <RefreshCcw color="#fff" size={20} />
              <Text style={styles.generateButtonText}>
                {isGenerating ? 'Generando...' : 'Generar Usuarios'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Credenciales de Acceso</Text>
                <TouchableOpacity
                  style={styles.regenerateButton}
                  onPress={generateTestUsers}
                  disabled={isGenerating}
                >
                  <RefreshCcw color="#6366f1" size={16} />
                  <Text style={styles.regenerateButtonText}>Regenerar</Text>
                </TouchableOpacity>
              </View>

              {testUsers.map((testUser) => {
                const isShowingPassword = showPasswords[testUser.id];
                const roleColor = getRoleColor(testUser.role);

                return (
                  <View key={testUser.id} style={styles.userCard}>
                    <View style={styles.userHeader}>
                      <View style={[styles.roleIconContainer, { backgroundColor: `${roleColor}15` }]}>
                        {getRoleIcon(testUser.role)}
                      </View>
                      <View style={styles.userHeaderContent}>
                        <Text style={styles.userName}>{testUser.fullName}</Text>
                        <View style={[styles.roleBadge, { backgroundColor: `${roleColor}15` }]}>
                          <Text style={[styles.roleBadgeText, { color: roleColor }]}>
                            {getRoleLabel(testUser.role)}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.credentialsContainer}>
                      <View style={styles.credentialRow}>
                        <Text style={styles.credentialLabel}>Email:</Text>
                        <Text style={styles.credentialValue}>{testUser.email}</Text>
                      </View>
                      <View style={styles.credentialRow}>
                        <Text style={styles.credentialLabel}>Contraseña:</Text>
                        <Text style={styles.credentialValue}>
                          {isShowingPassword ? testUser.password : '••••••••'}
                        </Text>
                        <TouchableOpacity
                          style={styles.iconButton}
                          onPress={() => togglePasswordVisibility(testUser.id)}
                        >
                          {isShowingPassword ? (
                            <EyeOff color="#6b7280" size={18} />
                          ) : (
                            <Eye color="#6b7280" size={18} />
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.permissionsContainer}>
                      <Text style={styles.permissionsTitle}>Permisos:</Text>
                      {getRolePermissions(testUser.role).map((permission: string, index: number) => (
                        <View key={index} style={styles.permissionItem}>
                          <Check color="#10b981" size={16} />
                          <Text style={styles.permissionText}>{permission}</Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.loginButton]}
                        onPress={() => loginAsUser(testUser)}
                      >
                        <CheckCircle2 color="#fff" size={18} />
                        <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.copyButton]}
                        onPress={() => copyCredentials(testUser)}
                      >
                        <Copy color="#6366f1" size={18} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={styles.dangerZone}>
              <Text style={styles.dangerZoneTitle}>Zona de Peligro</Text>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={deleteTestUsers}
              >
                <Text style={styles.deleteButtonText}>Eliminar Todos los Usuarios de Prueba</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            💡 Cambia entre diferentes usuarios para probar los permisos en tiempo real
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  safeArea: {
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  infoCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: '#93c5fd',
  },
  infoCardContent: {
    flex: 1,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1e40af',
    marginBottom: 4,
  },
  infoCardText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#111827',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    marginTop: 24,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  section: {
    padding: 16,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#111827',
  },
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#eef2ff',
    borderRadius: 8,
  },
  regenerateButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6366f1',
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  userHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  roleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userHeaderContent: {
    flex: 1,
    gap: 6,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#111827',
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  credentialsContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  credentialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  credentialLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6b7280',
    width: 90,
  },
  credentialValue: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    fontFamily: 'monospace',
  },
  iconButton: {
    padding: 4,
  },
  permissionsContainer: {
    gap: 8,
  },
  permissionsTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 4,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  permissionText: {
    fontSize: 13,
    color: '#374151',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  loginButton: {
    flex: 1,
    backgroundColor: '#6366f1',
  },
  loginButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#fff',
  },
  copyButton: {
    backgroundColor: '#eef2ff',
  },
  dangerZone: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#fecaca',
  },
  dangerZoneTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#dc2626',
    marginBottom: 12,
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#dc2626',
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#111827',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
  },
  backButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#6366f1',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
});
