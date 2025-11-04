import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { MessageTemplate, ScheduledMessage, MessageHistory, AutomatedNotification, NotificationType } from '@/types';

const TEMPLATES_KEY = '@message_templates';
const SCHEDULED_MESSAGES_KEY = '@scheduled_messages';
const MESSAGE_HISTORY_KEY = '@message_history';
const AUTOMATED_NOTIFICATIONS_KEY = '@automated_notifications';

export const [MessagingProvider, useMessaging] = createContextHook(() => {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>([]);
  const [messageHistory, setMessageHistory] = useState<MessageHistory[]>([]);
  const [automatedNotifications, setAutomatedNotifications] = useState<AutomatedNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [templatesData, scheduledData, historyData, notificationsData] = await Promise.all([
        AsyncStorage.getItem(TEMPLATES_KEY),
        AsyncStorage.getItem(SCHEDULED_MESSAGES_KEY),
        AsyncStorage.getItem(MESSAGE_HISTORY_KEY),
        AsyncStorage.getItem(AUTOMATED_NOTIFICATIONS_KEY),
      ]);

      if (templatesData) setTemplates(JSON.parse(templatesData));
      if (scheduledData) setScheduledMessages(JSON.parse(scheduledData));
      if (historyData) setMessageHistory(JSON.parse(historyData));
      if (notificationsData) setAutomatedNotifications(JSON.parse(notificationsData));
    } catch (error) {
      console.error('Error loading messaging data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveTemplates = useCallback(async (newTemplates: MessageTemplate[]) => {
    try {
      await AsyncStorage.setItem(TEMPLATES_KEY, JSON.stringify(newTemplates));
      setTemplates(newTemplates);
    } catch (error) {
      console.error('Error saving templates:', error);
    }
  }, []);

  const saveScheduledMessages = useCallback(async (newMessages: ScheduledMessage[]) => {
    try {
      await AsyncStorage.setItem(SCHEDULED_MESSAGES_KEY, JSON.stringify(newMessages));
      setScheduledMessages(newMessages);
    } catch (error) {
      console.error('Error saving scheduled messages:', error);
    }
  }, []);

  const saveMessageHistory = useCallback(async (newHistory: MessageHistory[]) => {
    try {
      await AsyncStorage.setItem(MESSAGE_HISTORY_KEY, JSON.stringify(newHistory));
      setMessageHistory(newHistory);
    } catch (error) {
      console.error('Error saving message history:', error);
    }
  }, []);

  const saveAutomatedNotifications = useCallback(async (newNotifications: AutomatedNotification[]) => {
    try {
      await AsyncStorage.setItem(AUTOMATED_NOTIFICATIONS_KEY, JSON.stringify(newNotifications));
      setAutomatedNotifications(newNotifications);
    } catch (error) {
      console.error('Error saving automated notifications:', error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addTemplate = useCallback((template: MessageTemplate) => {
    const newTemplates = [...templates, template];
    saveTemplates(newTemplates);
  }, [templates, saveTemplates]);

  const updateTemplate = useCallback((templateId: string, updates: Partial<MessageTemplate>) => {
    const newTemplates = templates.map((t) =>
      t.id === templateId ? { ...t, ...updates } : t
    );
    saveTemplates(newTemplates);
  }, [templates, saveTemplates]);

  const deleteTemplate = useCallback((templateId: string) => {
    const newTemplates = templates.filter((t) => t.id !== templateId);
    saveTemplates(newTemplates);
  }, [templates, saveTemplates]);

  const scheduleMessage = useCallback((message: ScheduledMessage) => {
    const newMessages = [...scheduledMessages, message];
    saveScheduledMessages(newMessages);
  }, [scheduledMessages, saveScheduledMessages]);

  const updateScheduledMessage = useCallback((messageId: string, updates: Partial<ScheduledMessage>) => {
    const newMessages = scheduledMessages.map((m) =>
      m.id === messageId ? { ...m, ...updates } : m
    );
    saveScheduledMessages(newMessages);
  }, [scheduledMessages, saveScheduledMessages]);

  const deleteScheduledMessage = useCallback((messageId: string) => {
    const newMessages = scheduledMessages.filter((m) => m.id !== messageId);
    saveScheduledMessages(newMessages);
  }, [scheduledMessages, saveScheduledMessages]);

  const getEventScheduledMessages = useCallback((eventId: string) => {
    return scheduledMessages.filter((m) => m.eventId === eventId);
  }, [scheduledMessages]);

  const addMessageHistory = useCallback((history: MessageHistory) => {
    const newHistory = [...messageHistory, history];
    saveMessageHistory(newHistory);
  }, [messageHistory, saveMessageHistory]);

  const addMultipleMessageHistory = useCallback((newHistory: MessageHistory[]) => {
    const combined = [...messageHistory, ...newHistory];
    saveMessageHistory(combined);
  }, [messageHistory, saveMessageHistory]);

  const getEventMessageHistory = useCallback((eventId: string) => {
    return messageHistory.filter((h) => h.eventId === eventId);
  }, [messageHistory]);

  const getMessageHistory = useCallback((messageId: string) => {
    return messageHistory.filter((h) => h.messageId === messageId);
  }, [messageHistory]);

  const sendMessage = useCallback(async (messageId: string, recipients: Array<{ id: string; name: string; email: string; phone?: string }>) => {
    const message = scheduledMessages.find((m) => m.id === messageId);
    if (!message) return;

    updateScheduledMessage(messageId, { status: 'sending' });

    const historyEntries: MessageHistory[] = [];
    let sentCount = 0;
    let failedCount = 0;

    for (const recipient of recipients) {
      const shouldSendEmail = message.channel === 'email' || message.channel === 'both';
      const shouldSendWhatsApp = message.channel === 'whatsapp' || message.channel === 'both';

      const historyEntry: MessageHistory = {
        id: `${messageId}-${recipient.id}-${Date.now()}-${Math.random()}`,
        eventId: message.eventId,
        messageId,
        recipientId: recipient.id,
        recipientName: recipient.name,
        recipientEmail: recipient.email,
        recipientPhone: recipient.phone,
        channel: message.channel,
        status: 'sent',
        sentAt: new Date().toISOString(),
      };

      try {
        if (shouldSendEmail) {
          console.log(`📧 Sending email to ${recipient.email}:`, message.subject || 'No subject');
          console.log(`Content: ${message.content.substring(0, 100)}...`);
        }
        
        if (shouldSendWhatsApp && recipient.phone) {
          console.log(`📱 Sending WhatsApp to ${recipient.phone}`);
          console.log(`Content: ${message.content.substring(0, 100)}...`);
        }

        sentCount++;
      } catch (error) {
        console.error(`❌ Failed to send message to ${recipient.name}:`, error);
        historyEntry.status = 'failed';
        historyEntry.error = error instanceof Error ? error.message : 'Unknown error';
        failedCount++;
      }

      historyEntries.push(historyEntry);
    }

    addMultipleMessageHistory(historyEntries);

    updateScheduledMessage(messageId, {
      status: failedCount === recipients.length ? 'failed' : 'sent',
      sentCount,
      failedCount,
      sentAt: new Date().toISOString(),
    });

    return { sentCount, failedCount };
  }, [scheduledMessages, updateScheduledMessage, addMultipleMessageHistory]);

  const addAutomatedNotification = useCallback((notification: AutomatedNotification) => {
    const newNotifications = [...automatedNotifications, notification];
    saveAutomatedNotifications(newNotifications);
  }, [automatedNotifications, saveAutomatedNotifications]);

  const updateAutomatedNotification = useCallback((notificationId: string, updates: Partial<AutomatedNotification>) => {
    const newNotifications = automatedNotifications.map((n) =>
      n.id === notificationId ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
    );
    saveAutomatedNotifications(newNotifications);
  }, [automatedNotifications, saveAutomatedNotifications]);

  const getEventAutomatedNotifications = useCallback((eventId: string) => {
    return automatedNotifications.filter((n) => n.eventId === eventId);
  }, [automatedNotifications]);

  const initializeEventNotifications = useCallback((eventId: string, eventName: string, eventDate: string, eventTime: string, venueName: string, location: string) => {
    const existing = automatedNotifications.filter((n) => n.eventId === eventId);
    if (existing.length > 0) return;

    let eventDateTime: Date;
    let formattedEventDate = eventDate;
    
    try {
      const parsedDate = new Date(eventDate);
      const [hours, minutes] = eventTime.split(':').map(s => parseInt(s, 10));
      
      parsedDate.setHours(hours, minutes, 0, 0);
      eventDateTime = parsedDate;
      
      if (isNaN(eventDateTime.getTime())) {
        console.error('Invalid date/time for event:', eventDate, eventTime);
        eventDateTime = new Date();
        formattedEventDate = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      } else {
        formattedEventDate = eventDateTime.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      }
    } catch (error) {
      console.error('Error creating event date:', error);
      eventDateTime = new Date();
      formattedEventDate = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
    
    const notifications: AutomatedNotification[] = [
      {
        id: `${eventId}-invitation`,
        eventId,
        type: 'invitation',
        enabled: true,
        subject: `¡Estás invitado a ${eventName}!`,
        content: `Hola {nombre},\n\n¡Nos complace invitarte a ${eventName}!\n\nDetalles del evento:\n📅 Fecha: ${formattedEventDate}\n🕐 Hora: ${eventTime}\n📍 Lugar: ${venueName}\n${location}\n\nTu código de acceso QR está adjunto a este mensaje. Preséntalo el día del evento.\n\n¡Te esperamos!\n\nSaludos cordiales`,
        channel: 'both',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `${eventId}-reminder-15d`,
        eventId,
        type: 'reminder-15d',
        enabled: true,
        subject: `${eventName} - ¡Solo faltan 15 días!`,
        content: `Hola {nombre},\n\n¡El gran día se acerca! ${eventName} será en 15 días.\n\n📅 ${formattedEventDate} a las ${eventTime}\n📍 ${venueName}\n\nPrepárate para una experiencia inolvidable. ¡No te lo pierdas!\n\nRecuerda que tu código QR de acceso está listo. Lo encontrarás en tu invitación original.\n\nNos vemos pronto!`,
        channel: 'both',
        scheduledFor: new Date(eventDateTime.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `${eventId}-reminder-7d`,
        eventId,
        type: 'reminder-7d',
        enabled: true,
        subject: `${eventName} - ¡Una semana para el gran día!`,
        content: `Hola {nombre},\n\n¡Ya queda solo una semana para ${eventName}!\n\n📅 ${formattedEventDate} a las ${eventTime}\n📍 ${venueName}, ${location}\n\nEstamos emocionados por compartir este momento contigo. Asegúrate de tener tu código QR listo para el acceso.\n\n¿Ya planeaste tu día? ¡Te esperamos con muchas sorpresas!`,
        channel: 'both',
        scheduledFor: new Date(eventDateTime.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `${eventId}-reminder-1d`,
        eventId,
        type: 'reminder-1d',
        enabled: true,
        subject: `${eventName} - ¡Nos vemos mañana!`,
        content: `Hola {nombre},\n\n¡Mañana es el gran día! ${eventName} te espera.\n\n📅 Mañana, ${formattedEventDate}\n🕐 ${eventTime}\n📍 ${venueName}\n${location}\n\nRecordatorios importantes:\n✅ Ten tu código QR listo en tu dispositivo\n✅ Llega unos minutos antes para registro\n✅ Trae tu mejor energía y actitud\n\n¡Será una experiencia increíble! Nos vemos pronto.`,
        channel: 'both',
        scheduledFor: new Date(eventDateTime.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `${eventId}-reminder-5h`,
        eventId,
        type: 'reminder-5h',
        enabled: true,
        subject: `${eventName} - ¡En unas horas comenzamos!`,
        content: `Hola {nombre},\n\n¡HOY ES EL DÍA! ${eventName} comienza en solo 5 horas.\n\n🕐 ${eventTime}\n📍 ${venueName}\n${location}\n\nÚltimos recordatorios:\n🎫 Ten tu código QR listo\n🚗 Considera el tráfico y llega con tiempo\n😊 Ven con la mejor actitud\n\nEstamos listos para recibirte. ¡Será inolvidable!\n\n¡Nos vemos en unas horas!`,
        channel: 'both',
        scheduledFor: new Date(eventDateTime.getTime() - 5 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const newNotifications = [...automatedNotifications, ...notifications];
    saveAutomatedNotifications(newNotifications);
  }, [automatedNotifications, saveAutomatedNotifications]);

  return {
    templates,
    scheduledMessages,
    messageHistory,
    automatedNotifications,
    isLoading,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    scheduleMessage,
    updateScheduledMessage,
    deleteScheduledMessage,
    getEventScheduledMessages,
    addMessageHistory,
    addMultipleMessageHistory,
    getEventMessageHistory,
    getMessageHistory,
    sendMessage,
    addAutomatedNotification,
    updateAutomatedNotification,
    getEventAutomatedNotifications,
    initializeEventNotifications,
  };
});
