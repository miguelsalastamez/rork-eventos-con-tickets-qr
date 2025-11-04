import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { UserPlus, FileSpreadsheet, Mail, Phone, IdCard, User, Upload, FileText } from 'lucide-react-native';
import { useEvents } from '@/contexts/EventContext';
import { Attendee } from '@/types';
import * as DocumentPicker from 'expo-document-picker';
import * as XLSX from 'xlsx';

export default function AddAttendeesScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addAttendee, addMultipleAttendees, getEventById } = useEvents();
  const event = getEventById(id);

  const primaryColor = event?.primaryColor || '#6366f1';
  const secondaryColor = event?.secondaryColor || '#8b5cf6';
  const backgroundColor = event?.backgroundColor || '#f9fafb';
  const textColor = event?.textColor || '#111827';

  const [mode, setMode] = useState<'manual' | 'batch' | 'excel'>('manual');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [batchData, setBatchData] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const generateTicketCode = () => {
    return `${id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
  };

  const handleAddManual = () => {
    if (!fullName.trim() || !email.trim()) {
      Alert.alert('Error', 'Nombre completo y email son requeridos');
      return;
    }

    const attendee: Attendee = {
      id: Date.now().toString(),
      eventId: id,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      employeeNumber: employeeNumber.trim(),
      checkedIn: false,
      ticketCode: generateTicketCode(),
    };

    addAttendee(attendee);
    Alert.alert('Éxito', 'Invitado agregado correctamente', [
      {
        text: 'OK',
        onPress: () => {
          setFullName('');
          setEmail('');
          setPhone('');
          setEmployeeNumber('');
        },
      },
    ]);
  };

  const handleUploadExcel = async () => {
    try {
      setIsProcessing(true);
      console.log('📄 Opening document picker...');
      
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
        ],
        copyToCacheDirectory: true,
      });

      console.log('📄 Document picker result:', result);

      if (result.canceled) {
        console.log('❌ User cancelled document picker');
        setIsProcessing(false);
        return;
      }

      const file = result.assets[0];
      console.log('📄 Selected file:', file);
      setUploadedFileName(file.name);

      console.log('📖 Reading file...');
      let fileData: string | ArrayBuffer;
      
      if (Platform.OS === 'web') {
        const response = await fetch(file.uri);
        const blob = await response.blob();
        fileData = await new Promise<ArrayBuffer>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
          reader.onerror = reject;
          reader.readAsArrayBuffer(blob);
        });
      } else {
        const response = await fetch(file.uri);
        const arrayBuffer = await response.arrayBuffer();
        fileData = arrayBuffer;
      }

      console.log('📊 Parsing Excel file...');
      const workbook = XLSX.read(fileData, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

      console.log('📊 Parsed data:', jsonData);

      if (jsonData.length < 2) {
        Alert.alert('Error', 'El archivo está vacío o no tiene datos');
        setIsProcessing(false);
        return;
      }

      const headers = jsonData[0].map((h: any) => String(h).toLowerCase().trim());
      const dataRows = jsonData.slice(1);

      console.log('📊 Headers:', headers);
      console.log('📊 Data rows:', dataRows);

      const attendees: Attendee[] = [];
      const errors: string[] = [];

      dataRows.forEach((row, index) => {
        if (!row || row.every((cell: any) => !cell)) {
          return;
        }

        const rowData: any = {};
        headers.forEach((header: string, idx: number) => {
          rowData[header] = row[idx];
        });

        const nameField = rowData['nombre completo'] || rowData['nombre'] || rowData['name'] || rowData['full name'] || row[0];
        const emailField = rowData['email'] || rowData['correo'] || rowData['e-mail'] || row[1];
        const phoneField = rowData['telefono'] || rowData['teléfono'] || rowData['phone'] || rowData['tel'] || row[2] || '';
        const empNumField = rowData['numero de empleado'] || rowData['número de empleado'] || rowData['employee number'] || rowData['empleado'] || row[3] || '';

        const name = nameField ? String(nameField).trim() : '';
        const email = emailField ? String(emailField).trim() : '';
        const phone = phoneField ? String(phoneField).trim() : '';
        const empNum = empNumField ? String(empNumField).trim() : '';

        if (!name || !email) {
          errors.push(`Fila ${index + 2}: Nombre o email vacío`);
          return;
        }

        attendees.push({
          id: `${Date.now()}-${index}`,
          eventId: id,
          fullName: name,
          email: email,
          phone: phone,
          employeeNumber: empNum,
          checkedIn: false,
          ticketCode: generateTicketCode(),
        });
      });

      console.log('✅ Processed attendees:', attendees);
      console.log('⚠️ Errors:', errors);

      if (errors.length > 0) {
        Alert.alert('Advertencias', errors.join('\n'), [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Continuar',
            onPress: () => {
              if (attendees.length > 0) {
                addMultipleAttendees(attendees);
                Alert.alert('Éxito', `${attendees.length} invitados agregados correctamente`, [
                  { text: 'OK', onPress: () => router.back() },
                ]);
              } else {
                Alert.alert('Error', 'No se pudieron procesar los datos');
              }
            },
          },
        ]);
        setIsProcessing(false);
        return;
      }

      if (attendees.length === 0) {
        Alert.alert('Error', 'No se pudieron procesar los datos');
        setIsProcessing(false);
        return;
      }

      addMultipleAttendees(attendees);
      Alert.alert('Éxito', `${attendees.length} invitados agregados correctamente`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('❌ Error processing Excel file:', error);
      Alert.alert('Error', 'No se pudo procesar el archivo. Por favor verifica que sea un archivo Excel válido.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddBatch = () => {
    if (!batchData.trim()) {
      Alert.alert('Error', 'Por favor pega los datos para procesar');
      return;
    }

    const lines = batchData.trim().split('\n');
    const attendees: Attendee[] = [];
    const errors: string[] = [];

    lines.forEach((line, index) => {
      const columns = line.split('\t');
      
      if (columns.length < 2) {
        errors.push(`Línea ${index + 1}: Faltan datos`);
        return;
      }

      const [name, emailVal, phoneVal = '', empNum = ''] = columns;

      if (!name?.trim() || !emailVal?.trim()) {
        errors.push(`Línea ${index + 1}: Nombre o email vacío`);
        return;
      }

      attendees.push({
        id: `${Date.now()}-${index}`,
        eventId: id,
        fullName: name.trim(),
        email: emailVal.trim(),
        phone: phoneVal.trim(),
        employeeNumber: empNum.trim(),
        checkedIn: false,
        ticketCode: generateTicketCode(),
      });
    });

    if (errors.length > 0) {
      Alert.alert('Errores encontrados', errors.join('\n'));
      return;
    }

    if (attendees.length === 0) {
      Alert.alert('Error', 'No se pudieron procesar los datos');
      return;
    }

    addMultipleAttendees(attendees);
    Alert.alert('Éxito', `${attendees.length} invitados agregados correctamente`, [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, mode === 'manual' && [styles.tabActive, { borderBottomColor: primaryColor }]]}
            onPress={() => setMode('manual')}
          >
            <UserPlus color={mode === 'manual' ? primaryColor : '#6b7280'} size={18} />
            <Text style={[styles.tabText, mode === 'manual' && [styles.tabTextActive, { color: primaryColor }]]}>
              Manual
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, mode === 'batch' && [styles.tabActive, { borderBottomColor: primaryColor }]]}
            onPress={() => setMode('batch')}
          >
            <FileText color={mode === 'batch' ? primaryColor : '#6b7280'} size={18} />
            <Text style={[styles.tabText, mode === 'batch' && [styles.tabTextActive, { color: primaryColor }]]}>
              Pegar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, mode === 'excel' && [styles.tabActive, { borderBottomColor: primaryColor }]]}
            onPress={() => setMode('excel')}
          >
            <FileSpreadsheet color={mode === 'excel' ? primaryColor : '#6b7280'} size={18} />
            <Text style={[styles.tabText, mode === 'excel' && [styles.tabTextActive, { color: primaryColor }]]}>
              Excel
            </Text>
          </TouchableOpacity>
        </View>

        {mode === 'manual' ? (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre Completo *</Text>
                <View style={styles.iconInputContainer}>
                  <User color={primaryColor} size={20} />
                  <TextInput
                    style={styles.iconInput}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Juan Pérez García"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email *</Text>
                <View style={styles.iconInputContainer}>
                  <Mail color={primaryColor} size={20} />
                  <TextInput
                    style={styles.iconInput}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="juan@ejemplo.com"
                    placeholderTextColor="#9ca3af"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Teléfono</Text>
                <View style={styles.iconInputContainer}>
                  <Phone color={primaryColor} size={20} />
                  <TextInput
                    style={styles.iconInput}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="+52 123 456 7890"
                    placeholderTextColor="#9ca3af"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{event?.employeeNumberLabel || 'Número de Empleado'}</Text>
                <View style={styles.iconInputContainer}>
                  <IdCard color={primaryColor} size={20} />
                  <TextInput
                    style={styles.iconInput}
                    value={employeeNumber}
                    onChangeText={setEmployeeNumber}
                    placeholder={event?.employeeNumberLabel || 'EMP-001'}
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        ) : mode === 'batch' ? (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.form}>
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Formato de datos</Text>
                <Text style={styles.infoText}>
                  Pega los datos desde Excel o Google Sheets separados por tabulaciones:
                </Text>
                <Text style={styles.infoExample}>
                  Nombre Completo [TAB] Email [TAB] Teléfono [TAB] {event?.employeeNumberLabel || 'Num. Empleado'}
                </Text>
                <Text style={styles.infoNote}>
                  * Cada línea representa un invitado
                  {'\n'}* Nombre y Email son obligatorios
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Datos de Invitados</Text>
                <TextInput
                  style={[styles.input, styles.batchTextArea]}
                  value={batchData}
                  onChangeText={setBatchData}
                  placeholder="Pega aquí los datos copiados de tu hoja de cálculo..."
                  placeholderTextColor="#9ca3af"
                  multiline
                  numberOfLines={12}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </ScrollView>
        ) : (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.form}>
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Subir archivo Excel</Text>
                <Text style={styles.infoText}>
                  Sube un archivo .xlsx o .xls con los siguientes campos:
                </Text>
                <Text style={styles.infoExample}>
                  • Nombre Completo (requerido){'\n'}
                  • Email (requerido){'\n'}
                  • Teléfono (opcional){'\n'}
                  • {event?.employeeNumberLabel || 'Número de Empleado'} (opcional)
                </Text>
                <Text style={styles.infoNote}>
                  * La primera fila debe contener los encabezados{'\n'}
                  * Los datos deben estar en las siguientes filas
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.uploadButton, { backgroundColor: primaryColor }]}
                onPress={handleUploadExcel}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Upload color="#fff" size={24} />
                    <Text style={styles.uploadButtonText}>
                      {uploadedFileName || 'Seleccionar archivo Excel'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {uploadedFileName && !isProcessing && (
                <View style={styles.fileInfo}>
                  <FileSpreadsheet color="#10b981" size={20} />
                  <Text style={styles.fileInfoText}>{uploadedFileName}</Text>
                </View>
              )}
            </View>
          </ScrollView>
        )}

        {mode !== 'excel' && (
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: primaryColor }]}
              onPress={mode === 'manual' ? handleAddManual : handleAddBatch}
            >
              <Text style={styles.addButtonText}>
                {mode === 'manual' ? 'Agregar' : 'Procesar Datos'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  keyboardView: {
    flex: 1,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {},
  tabText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#6b7280',
  },
  tabTextActive: {
    fontWeight: '600' as const,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 20,
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  iconInputContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    padding: 0,
  },
  batchTextArea: {
    minHeight: 280,
    paddingTop: 14,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  infoCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1e40af',
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  infoExample: {
    fontSize: 13,
    color: '#3b82f6',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    backgroundColor: '#dbeafe',
    padding: 12,
    borderRadius: 8,
  },
  infoNote: {
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#374151',
  },
  addButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  uploadButton: {
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 12,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#d1fae5',
    borderRadius: 12,
    marginTop: 12,
  },
  fileInfoText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#065f46',
  },
});
