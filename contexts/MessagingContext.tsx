import { useCallback, useMemo, useState } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { MessageTemplate, ScheduledMessage, MessageHistory, AutomatedNotification } from '@/types';
import { trpc } from '@/lib/trpc';

export const [MessagingProvider, useMessaging] = createContextHook(() => {
  const messagesQuery = trpc.messages.list.useQuery();
  const messageHistory = messagesQuery.data || [];
  const isLoading = messagesQuery.isLoading;

  const [templates] = useState<MessageTemplate[]>([]);
  const [scheduledMessages] = useState<ScheduledMessage[]>([]);
  const [automatedNotifications] = useState<AutomatedNotification[]>([]);

  const utils = trpc.useUtils();

  const sendMessageMutation = trpc.messages.send.useMutation({
    onSuccess: () => {
      utils.messages.list.invalidate();
    },
  });

  const addTemplate = useCallback((template: MessageTemplate) => {
    console.log('Templates not yet implemented in backend');
  }, []);

  const updateTemplate = useCallback((templateId: string, updates: Partial<MessageTemplate>) => {
    console.log('Templates not yet implemented in backend');
  }, []);

  const deleteTemplate = useCallback((templateId: string) => {
    console.log('Templates not yet implemented in backend');
  }, []);

  const scheduleMessage = useCallback((message: ScheduledMessage) => {
    console.log('Scheduled messages not yet implemented in backend');
  }, []);

  const updateScheduledMessage = useCallback((messageId: string, updates: Partial<ScheduledMessage>) => {
    console.log('Scheduled messages not yet implemented in backend');
  }, []);

  const deleteScheduledMessage = useCallback((messageId: string) => {
    console.log('Scheduled messages not yet implemented in backend');
  }, []);

  const getEventScheduledMessages = useCallback((eventId: string) => {
    return scheduledMessages.filter((m) => m.eventId === eventId);
  }, [scheduledMessages]);

  const addMessageHistory = useCallback((history: MessageHistory) => {
    console.log('Message history is read-only from backend');
  }, []);

  const addMultipleMessageHistory = useCallback((newHistory: MessageHistory[]) => {
    console.log('Message history is read-only from backend');
  }, []);

  const getEventMessageHistory = useCallback((eventId: string) => {
    return messageHistory.filter((h) => h.eventId === eventId);
  }, [messageHistory]);

  const getMessageHistory = useCallback((messageId: string) => {
    return messageHistory.filter((h) => h.messageId === messageId);
  }, [messageHistory]);

  const sendMessage = useCallback(async (messageId: string, recipients: Array<{ id: string; name: string; email: string; phone?: string }>) => {
    const message = scheduledMessages.find((m) => m.id === messageId);
    if (!message) return { sentCount: 0, failedCount: 0 };

    updateScheduledMessage(messageId, { status: 'sending' });

    try {
      const result = await sendMessageMutation.mutateAsync({
        eventId: message.eventId,
        subject: message.subject || '',
        content: message.content,
        channel: message.channel,
        recipients: recipients.map((r) => r.id),
      });

      updateScheduledMessage(messageId, {
        status: 'sent',
        sentAt: new Date().toISOString(),
      });

      return { sentCount: result.sentCount, failedCount: 0 };
    } catch (error) {
      console.error('Failed to send message:', error);
      updateScheduledMessage(messageId, { status: 'failed' });
      return { sentCount: 0, failedCount: recipients.length };
    }
  }, [scheduledMessages, updateScheduledMessage, sendMessageMutation]);

  const addAutomatedNotification = useCallback((notification: AutomatedNotification) => {
    console.log('Automated notifications not yet implemented in backend');
  }, []);

  const updateAutomatedNotification = useCallback((notificationId: string, updates: Partial<AutomatedNotification>) => {
    console.log('Automated notifications not yet implemented in backend');
  }, []);

  const getEventAutomatedNotifications = useCallback((eventId: string) => {
    return automatedNotifications.filter((n) => n.eventId === eventId);
  }, [automatedNotifications]);

  const initializeEventNotifications = useCallback((eventId: string, eventName: string, eventDate: string, eventTime: string, venueName: string, location: string) => {
    console.log('Automated notifications not yet implemented in backend');
  }, []);

  return useMemo(() => ({
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
  }), [templates, scheduledMessages, messageHistory, automatedNotifications, isLoading, addTemplate, updateTemplate, deleteTemplate, scheduleMessage, updateScheduledMessage, deleteScheduledMessage, getEventScheduledMessages, addMessageHistory, addMultipleMessageHistory, getEventMessageHistory, getMessageHistory, sendMessage, addAutomatedNotification, updateAutomatedNotification, getEventAutomatedNotifications, initializeEventNotifications]);
});
