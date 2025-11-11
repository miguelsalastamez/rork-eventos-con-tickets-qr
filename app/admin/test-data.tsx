import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, router } from "expo-router";
import { RefreshCw, Trash2, Database } from "lucide-react-native";
import { trpc } from "@/lib/trpc";

export default function TestDataScreen() {
  const insets = useSafeAreaInsets();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const deleteAllMutation = trpc.events.deleteAllTestData.useMutation();
  const seedDataMutation = trpc.events.seedTestData.useMutation();
  const utils = trpc.useUtils();

  const handleDeleteAll = async () => {
    Alert.alert(
      "Confirmar eliminación",
      "¿Estás seguro de que quieres eliminar TODOS los datos de prueba? Esta acción no se puede deshacer.",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar Todo",
          style: "destructive",
          onPress: async () => {
            try {
              setIsDeleting(true);
              await deleteAllMutation.mutateAsync();
              Alert.alert(
                "Éxito",
                "Todos los datos de prueba han sido eliminados"
              );
              await utils.events.list.invalidate();
            } catch (error) {
              console.error("Error deleting test data:", error);
              Alert.alert(
                "Error",
                "Hubo un problema al eliminar los datos de prueba"
              );
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleSeedData = async () => {
    Alert.alert(
      "Confirmar creación",
      "¿Quieres crear nuevos datos de prueba con información completa en todos los campos?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Crear",
          onPress: async () => {
            try {
              setIsSeeding(true);
              const result = await seedDataMutation.mutateAsync();
              Alert.alert(
                "Éxito",
                `Se crearon ${result.events.length} eventos con datos completos`,
                [
                  {
                    text: "Ver Eventos",
                    onPress: () => router.replace("/"),
                  },
                  {
                    text: "OK",
                  },
                ]
              );
              await utils.events.list.invalidate();
            } catch (error) {
              console.error("Error seeding test data:", error);
              Alert.alert(
                "Error",
                "Hubo un problema al crear los datos de prueba"
              );
            } finally {
              setIsSeeding(false);
            }
          },
        },
      ]
    );
  };

  const handleResetAll = async () => {
    Alert.alert(
      "Confirmar reinicio completo",
      "Esto eliminará TODOS los datos actuales y creará nuevos datos de prueba. ¿Continuar?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Reiniciar",
          style: "destructive",
          onPress: async () => {
            try {
              setIsDeleting(true);
              await deleteAllMutation.mutateAsync();
              setIsDeleting(false);
              setIsSeeding(true);
              const result = await seedDataMutation.mutateAsync();
              Alert.alert(
                "Éxito",
                `Base de datos reiniciada. Se crearon ${result.events.length} eventos con datos completos`,
                [
                  {
                    text: "Ver Eventos",
                    onPress: () => router.replace("/"),
                  },
                  {
                    text: "OK",
                  },
                ]
              );
              await utils.events.list.invalidate();
            } catch (error) {
              console.error("Error resetting data:", error);
              Alert.alert(
                "Error",
                "Hubo un problema al reiniciar los datos"
              );
            } finally {
              setIsDeleting(false);
              setIsSeeding(false);
            }
          },
        },
      ]
    );
  };

  const isLoading = isDeleting || isSeeding;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Gestión de Datos de Prueba",
          headerStyle: { backgroundColor: "#1f2937" },
          headerTintColor: "#fff",
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
      >
        <View style={styles.header}>
          <Database size={48} color="#3b82f6" />
          <Text style={styles.title}>Datos de Prueba</Text>
          <Text style={styles.subtitle}>
            Gestiona los datos de prueba de la aplicación
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <RefreshCw size={24} color="#10b981" />
            <Text style={styles.cardTitle}>Crear Datos Nuevos</Text>
          </View>
          <Text style={styles.cardDescription}>
            Crea nuevos eventos con datos completos en todos los campos
            incluyendo:
          </Text>
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>• 3 Eventos diferentes</Text>
            <Text style={styles.featureItem}>• Tickets con precios</Text>
            <Text style={styles.featureItem}>
              • Asistentes con información completa
            </Text>
            <Text style={styles.featureItem}>• Premios para rifas</Text>
            <Text style={styles.featureItem}>
              • Imágenes y descripciones
            </Text>
            <Text style={styles.featureItem}>
              • Configuración de colores y sonidos
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.button, styles.seedButton, isLoading && styles.buttonDisabled]}
            onPress={handleSeedData}
            disabled={isLoading}
          >
            {isSeeding ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Database size={20} color="#fff" />
                <Text style={styles.buttonText}>Crear Datos de Prueba</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Trash2 size={24} color="#ef4444" />
            <Text style={styles.cardTitle}>Eliminar Todo</Text>
          </View>
          <Text style={styles.cardDescription}>
            Elimina todos los datos de prueba actuales de la base de datos.
            Esta acción no se puede deshacer.
          </Text>
          <TouchableOpacity
            style={[styles.button, styles.deleteButton, isLoading && styles.buttonDisabled]}
            onPress={handleDeleteAll}
            disabled={isLoading}
          >
            {isDeleting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Trash2 size={20} color="#fff" />
                <Text style={styles.buttonText}>Eliminar Todos los Datos</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={[styles.card, styles.dangerCard]}>
          <View style={styles.cardHeader}>
            <RefreshCw size={24} color="#f59e0b" />
            <Text style={styles.cardTitle}>Reiniciar Completamente</Text>
          </View>
          <Text style={styles.cardDescription}>
            Elimina todos los datos actuales y crea nuevos datos de prueba en
            un solo paso.
          </Text>
          <TouchableOpacity
            style={[styles.button, styles.resetButton, isLoading && styles.buttonDisabled]}
            onPress={handleResetAll}
            disabled={isLoading}
          >
            {isDeleting || isSeeding ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <RefreshCw size={20} color="#fff" />
                <Text style={styles.buttonText}>Reiniciar Base de Datos</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>
              {isDeleting
                ? "Eliminando datos..."
                : "Creando nuevos datos de prueba..."}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#fff",
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#9ca3af",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#1f2937",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#374151",
  },
  dangerCard: {
    borderColor: "#f59e0b",
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#fff",
  },
  cardDescription: {
    fontSize: 15,
    color: "#d1d5db",
    lineHeight: 22,
    marginBottom: 16,
  },
  featureList: {
    marginBottom: 20,
  },
  featureItem: {
    fontSize: 14,
    color: "#9ca3af",
    marginBottom: 6,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  seedButton: {
    backgroundColor: "#10b981",
  },
  deleteButton: {
    backgroundColor: "#ef4444",
  },
  resetButton: {
    backgroundColor: "#f59e0b",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  loadingContainer: {
    alignItems: "center",
    marginTop: 20,
    padding: 20,
  },
  loadingText: {
    color: "#9ca3af",
    fontSize: 16,
    marginTop: 12,
  },
});
