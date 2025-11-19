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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { UserPlus, FileSpreadsheet, Mail, Phone, IdCard, User, Upload, FileText, ChevronDown, Check, X } from 'lucide-react-native';
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
  const [showColumnMapper, setShowColumnMapper] = useState(false);
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  const [excelData, setExcelData] = useState<any[][]>([]);
  const [columnMapping, setColumnMapping] = useState<{
    name: number | null;
    email: number | null;
    phone: number | null;
    employeeNumber: number | null;
  }>({ name: null, email: null, phone: null, employeeNumber: null });
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const generateTicketCode = () => {
    return `${id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    if (!phone || phone.trim() === '') return true;
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length === 10;
  };

  const normalizePhone = (phone: string): string => {
    return phone.replace(/\D/g, '');
  };

  const handleAddManual = () => {
    setEmailError('');
    setPhoneError('');

    if (!fullName.trim()) {
      Alert.alert('Error', 'El nombre completo es requerido');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'El email es requerido');
      return;
    }

    if (!validateEmail(email.trim())) {
      setEmailError('Email inválido');
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    if (phone.trim() && !validatePhone(phone.trim())) {
      setPhoneError('El teléfono debe tener 10 dígitos');
      Alert.alert('Error', 'El teléfono debe tener exactamente 10 dígitos');
      return;
    }

    const normalizedPhone = phone.trim() ? normalizePhone(phone.trim()) : '';

    const attendee: Attendee = {
      id: Date.now().toString(),
      eventId: id,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: normalizedPhone,
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
          setEmailError('');
          setPhoneError('');
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

      const headers = jsonData[0].map((h: any) => String(h).trim());
      const dataRows = jsonData.slice(1);

      console.log('📊 Headers:', headers);
      console.log('📊 Data rows:', dataRows);

      setExcelHeaders(headers);
      setExcelData(dataRows);
      
      const detectedMapping = detectColumns(headers);
      setColumnMapping(detectedMapping);
      
      setShowColumnMapper(true);
      setIsProcessing(false);
    } catch (error) {
      console.error('❌ Error processing Excel file:', error);
      Alert.alert('Error', 'No se pudo procesar el archivo. Por favor verifica que sea un archivo Excel válido.');
      setIsProcessing(false);
    }
  };

  const detectColumns = (headers: string[]): typeof columnMapping => {
    const mapping: typeof columnMapping = {
      name: null,
      email: null,
      phone: null,
      employeeNumber: null,
    };

    headers.forEach((header, index) => {
      const lowerHeader = header.toLowerCase();
      
      if (lowerHeader.includes('nombre') || lowerHeader.includes('name')) {
        mapping.name = index;
      } else if (lowerHeader.includes('email') || lowerHeader.includes('correo') || lowerHeader.includes('e-mail')) {
        mapping.email = index;
      } else if (lowerHeader.includes('telefono') || lowerHeader.includes('teléfono') || lowerHeader.includes('phone') || lowerHeader.includes('tel')) {
        mapping.phone = index;
      } else if (lowerHeader.includes('empleado') || lowerHeader.includes('employee')) {
        mapping.employeeNumber = index;
      }
    });

    return mapping;
  };

  const processExcelData = () => {
    if (columnMapping.name === null || columnMapping.email === null) {
      Alert.alert('Error', 'Debes seleccionar al menos las columnas de Nombre y Email');
      return;
    }

    const attendees: Attendee[] = [];
    const errors: string[] = [];

    excelData.forEach((row, index) => {
      if (!row || row.every((cell: any) => !cell)) {
        return;
      }

      const name = columnMapping.name !== null && row[columnMapping.name] ? String(row[columnMapping.name]).trim() : '';
      const email = columnMapping.email !== null && row[columnMapping.email] ? String(row[columnMapping.email]).trim() : '';
      const phone = columnMapping.phone !== null && row[columnMapping.phone] ? String(row[columnMapping.phone]).trim() : '';
      const empNum = columnMapping.employeeNumber !== null && row[columnMapping.employeeNumber] ? String(row[columnMapping.employeeNumber]).trim() : '';

      if (!name) {
        errors.push(`Fila ${index + 2}: Nombre vacío`);
        return;
      }

      if (!email) {
        errors.push(`Fila ${index + 2}: Email vacío`);
        return;
      }

      if (!validateEmail(email)) {
        errors.push(`Fila ${index + 2}: Email inválido (${email})`);
        return;
      }

      if (phone && !validatePhone(phone)) {
        errors.push(`Fila ${index + 2}: Teléfono debe tener 10 dígitos (${phone})`);
        return;
      }

      const normalizedPhone = phone ? normalizePhone(phone) : '';

      attendees.push({
        id: `${Date.now()}-${index}`,
        eventId: id,
        fullName: name,
        email: email.toLowerCase(),
        phone: normalizedPhone,
        employeeNumber: empNum,
        checkedIn: false,
        ticketCode: generateTicketCode(),
      });
    });

    console.log('✅ Processed attendees:', attendees);
    console.log('⚠️ Errors:', errors);

    if (errors.length > 0) {
      Alert.alert('Errores de validación', errors.slice(0, 10).join('\n') + (errors.length > 10 ? `\n\n... y ${errors.length - 10} errores más` : ''), [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Continuar con válidos',
          onPress: () => {
            if (attendees.length > 0) {
              addMultipleAttendees(attendees);
              setShowColumnMapper(false);
              Alert.alert('Éxito', `${attendees.length} invitados agregados correctamente\n${errors.length} filas omitidas por errores`, [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } else {
              Alert.alert('Error', 'No se pudieron procesar los datos. Todos los registros tienen errores.');
            }
          },
        },
      ]);
      return;
    }

    if (attendees.length === 0) {
      Alert.alert('Error', 'No se pudieron procesar los datos');
      return;
    }

    addMultipleAttendees(attendees);
    setShowColumnMapper(false);
    Alert.alert('Éxito', `${attendees.length} invitados agregados correctamente`, [
      { text: 'OK', onPress: () => router.back() },
    ]);
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

      if (!name?.trim()) {
        errors.push(`Línea ${index + 1}: Nombre vacío`);
        return;
      }

      if (!emailVal?.trim()) {
        errors.push(`Línea ${index + 1}: Email vacío`);
        return;
      }

      if (!validateEmail(emailVal.trim())) {
        errors.push(`Línea ${index + 1}: Email inválido (${emailVal.trim()})`);
        return;
      }

      if (phoneVal?.trim() && !validatePhone(phoneVal.trim())) {
        errors.push(`Línea ${index + 1}: Teléfono debe tener 10 dígitos (${phoneVal.trim()})`);
        return;
      }

      const normalizedPhone = phoneVal?.trim() ? normalizePhone(phoneVal.trim()) : '';

      attendees.push({
        id: `${Date.now()}-${index}`,
        eventId: id,
        fullName: name.trim(),
        email: emailVal.trim().toLowerCase(),
        phone: normalizedPhone,
        employeeNumber: empNum.trim(),
        checkedIn: false,
        ticketCode: generateTicketCode(),
      });
    });

    if (errors.length > 0) {
      Alert.alert('Errores de validación', errors.slice(0, 10).join('\n') + (errors.length > 10 ? `\n\n... y ${errors.length - 10} errores más` : ''), [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Continuar con válidos',
          onPress: () => {
            if (attendees.length > 0) {
              addMultipleAttendees(attendees);
              Alert.alert('Éxito', `${attendees.length} invitados agregados correctamente\n${errors.length} líneas omitidas por errores`, [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } else {
              Alert.alert('Error', 'No se pudieron procesar los datos. Todas las líneas tienen errores.');
            }
          },
        },
      ]);
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
                <View style={[styles.iconInputContainer, emailError && styles.inputError]}>
                  <Mail color={emailError ? '#ef4444' : primaryColor} size={20} />
                  <TextInput
                    style={styles.iconInput}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (emailError) setEmailError('');
                    }}
                    placeholder="juan@ejemplo.com"
                    placeholderTextColor="#9ca3af"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Teléfono (10 dígitos)</Text>
                <View style={[styles.iconInputContainer, phoneError && styles.inputError]}>
                  <Phone color={phoneError ? '#ef4444' : primaryColor} size={20} />
                  <TextInput
                    style={styles.iconInput}
                    value={phone}
                    onChangeText={(text) => {
                      setPhone(text);
                      if (phoneError) setPhoneError('');
                    }}
                    placeholder="1234567890"
                    placeholderTextColor="#9ca3af"
                    keyboardType="phone-pad"
                    maxLength={15}
                  />
                </View>
                {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
                <Text style={styles.helperText}>Solo números, 10 dígitos requeridos</Text>
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

        <Modal
          visible={showColumnMapper}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setShowColumnMapper(false)}
        >
          <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top', 'bottom']}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Mapear Columnas</Text>
                <Text style={styles.modalSubtitle}>Selecciona qué columna corresponde a cada campo</Text>
              </View>
              <TouchableOpacity onPress={() => setShowColumnMapper(false)}>
                <X color={textColor} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <ColumnMapper
                label="Nombre Completo *"
                headers={excelHeaders}
                selectedIndex={columnMapping.name}
                onSelect={(index) => setColumnMapping({ ...columnMapping, name: index })}
                primaryColor={primaryColor}
                required
              />

              <ColumnMapper
                label="Email *"
                headers={excelHeaders}
                selectedIndex={columnMapping.email}
                onSelect={(index) => setColumnMapping({ ...columnMapping, email: index })}
                primaryColor={primaryColor}
                required
              />

              <ColumnMapper
                label="Teléfono (10 dígitos)"
                headers={excelHeaders}
                selectedIndex={columnMapping.phone}
                onSelect={(index) => setColumnMapping({ ...columnMapping, phone: index })}
                primaryColor={primaryColor}
              />

              <ColumnMapper
                label={event?.employeeNumberLabel || 'Número de Empleado'}
                headers={excelHeaders}
                selectedIndex={columnMapping.employeeNumber}
                onSelect={(index) => setColumnMapping({ ...columnMapping, employeeNumber: index })}
                primaryColor={primaryColor}
              />

              <View style={styles.previewCard}>
                <Text style={styles.previewTitle}>Vista previa (primera fila)</Text>
                {excelData[0] && (
                  <View style={styles.previewContent}>
                    <PreviewRow label="Nombre" value={columnMapping.name !== null ? excelData[0][columnMapping.name] : '-'} />
                    <PreviewRow label="Email" value={columnMapping.email !== null ? excelData[0][columnMapping.email] : '-'} />
                    <PreviewRow label="Teléfono" value={columnMapping.phone !== null ? excelData[0][columnMapping.phone] : '-'} />
                    <PreviewRow label="Empleado" value={columnMapping.employeeNumber !== null ? excelData[0][columnMapping.employeeNumber] : '-'} />
                  </View>
                )}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowColumnMapper(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: primaryColor }]}
                onPress={processExcelData}
              >
                <Text style={styles.addButtonText}>Procesar Datos</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ColumnMapper({
  label,
  headers,
  selectedIndex,
  onSelect,
  primaryColor,
  required = false,
}: {
  label: string;
  headers: string[];
  selectedIndex: number | null;
  onSelect: (index: number | null) => void;
  primaryColor: string;
  required?: boolean;
}) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <View style={styles.mapperContainer}>
      <Text style={styles.mapperLabel}>{label}</Text>
      <TouchableOpacity
        style={styles.mapperDropdown}
        onPress={() => setShowDropdown(!showDropdown)}
      >
        <Text style={styles.mapperDropdownText}>
          {selectedIndex !== null ? headers[selectedIndex] : 'No seleccionada'}
        </Text>
        <ChevronDown color="#6b7280" size={20} />
      </TouchableOpacity>
      {showDropdown && (
        <View style={styles.dropdownMenu}>
          {!required && (
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                onSelect(null);
                setShowDropdown(false);
              }}
            >
              <Text style={styles.dropdownItemText}>No usar esta columna</Text>
              {selectedIndex === null && <Check color={primaryColor} size={18} />}
            </TouchableOpacity>
          )}
          {headers.map((header, index) => (
            <TouchableOpacity
              key={index}
              style={styles.dropdownItem}
              onPress={() => {
                onSelect(index);
                setShowDropdown(false);
              }}
            >
              <Text style={styles.dropdownItemText}>{header}</Text>
              {selectedIndex === index && <Check color={primaryColor} size={18} />}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

function PreviewRow({ label, value }: { label: string; value: any }) {
  return (
    <View style={styles.previewRow}>
      <Text style={styles.previewLabel}>{label}:</Text>
      <Text style={styles.previewValue}>{value ? String(value) : '-'}</Text>
    </View>
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
  inputError: {
    borderColor: '#ef4444',
    borderWidth: 2,
  },
  errorText: {
    fontSize: 13,
    color: '#ef4444',
    marginTop: 4,
  },
  helperText: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#111827',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  mapperContainer: {
    marginBottom: 24,
  },
  mapperLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 8,
  },
  mapperDropdown: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mapperDropdownText: {
    fontSize: 16,
    color: '#111827',
  },
  dropdownMenu: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 200,
    overflow: 'scroll' as const,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#374151',
  },
  previewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 12,
  },
  previewContent: {
    gap: 8,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6b7280',
    width: 100,
  },
  previewValue: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
});
