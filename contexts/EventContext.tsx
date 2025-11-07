import { useState, useEffect, useCallback, useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { Event, Attendee, Prize, RaffleWinner } from '@/types';
import { trpcClient } from '@/lib/trpc';

export const [EventProvider, useEvents] = createContextHook(() => {
  const [events, setEvents] = useState<Event[]>([]);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [raffleWinners, setRaffleWinners] = useState<RaffleWinner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const eventsData = await trpcClient.events.list.query();
      setEvents(eventsData as any);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addEvent = useCallback(async (event: Event) => {
    console.log('🎉 Adding event:', event);
    try {
      const newEvent = await trpcClient.events.create.mutate(event as any);
      setEvents((prev) => [...prev, newEvent as any]);
      console.log('✅ Event saved successfully');
    } catch (error) {
      console.error('❌ Error adding event:', error);
      throw error;
    }
  }, []);

  const getOrganizationEvents = useCallback((organizationId: string) => {
    return events.filter((e) => e.organizationId === organizationId);
  }, [events]);

  const getUserEvents = useCallback((userId: string) => {
    return events.filter((e) => e.createdBy === userId);
  }, [events]);

  const updateEvent = useCallback(async (eventId: string, updates: Partial<Event>) => {
    console.log('🔄 Updating event:', eventId, updates);
    try {
      const updatedEvent = await trpcClient.events.update.mutate({ id: eventId, ...updates } as any);
      setEvents((prev) => prev.map((e) => (e.id === eventId ? updatedEvent as any : e)));
      console.log('✅ Event updated successfully');
    } catch (error) {
      console.error('❌ Error updating event:', error);
      throw error;
    }
  }, []);

  const deleteEvent = useCallback(async (eventId: string) => {
    try {
      await trpcClient.events.delete.mutate({ id: eventId });
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      setAttendees((prev) => prev.filter((a) => a.eventId !== eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }, []);

  const loadEventAttendees = useCallback(async (eventId: string) => {
    try {
      const eventAttendees = await trpcClient.events.attendees.list.query({ eventId });
      setAttendees((prev) => {
        const filtered = prev.filter((a) => a.eventId !== eventId);
        return [...filtered, ...(eventAttendees as any)];
      });
    } catch (error) {
      console.error('Error loading attendees:', error);
    }
  }, []);

  const addAttendee = useCallback(async (attendee: Attendee) => {
    try {
      const newAttendee = await trpcClient.events.attendees.add.mutate(attendee as any);
      setAttendees((prev) => [...prev, newAttendee as any]);
    } catch (error) {
      console.error('Error adding attendee:', error);
      throw error;
    }
  }, []);

  const addMultipleAttendees = useCallback(async (newAttendees: Attendee[]) => {
    if (newAttendees.length === 0) return;
    try {
      const eventId = newAttendees[0].eventId;
      await trpcClient.events.attendees.addMany.mutate({ 
        eventId, 
        attendees: newAttendees as any 
      });
      await loadEventAttendees(eventId);
    } catch (error) {
      console.error('Error adding multiple attendees:', error);
      throw error;
    }
  }, [loadEventAttendees]);

  const checkInAttendee = useCallback(async (attendeeId: string) => {
    try {
      const updatedAttendee = await trpcClient.events.attendees.checkIn.mutate({ attendeeId });
      setAttendees((prev) => prev.map((a) => (a.id === attendeeId ? updatedAttendee as any : a)));
    } catch (error) {
      console.error('Error checking in attendee:', error);
      throw error;
    }
  }, []);

  const toggleCheckInAttendee = useCallback(async (attendeeId: string) => {
    await checkInAttendee(attendeeId);
  }, [checkInAttendee]);

  const checkInAllAttendees = useCallback(async (eventId: string) => {
    try {
      await trpcClient.events.attendees.checkInAll.mutate({ eventId });
      await loadEventAttendees(eventId);
    } catch (error) {
      console.error('Error checking in all attendees:', error);
      throw error;
    }
  }, [loadEventAttendees]);

  const removeDuplicates = useCallback(async (eventId: string) => {
    try {
      const result = await trpcClient.events.attendees.removeDuplicates.mutate({ eventId });
      await loadEventAttendees(eventId);
      return result.count;
    } catch (error) {
      console.error('Error removing duplicates:', error);
      throw error;
    }
  }, [loadEventAttendees]);

  const getEventAttendees = useCallback((eventId: string) => {
    return attendees.filter((a) => a.eventId === eventId);
  }, [attendees]);

  const getAttendeeByTicketCode = useCallback((ticketCode: string) => {
    return attendees.find((a) => a.ticketCode === ticketCode);
  }, [attendees]);

  const getEventById = useCallback((eventId: string) => {
    return events.find((e) => e.id === eventId);
  }, [events]);

  const loadEventPrizes = useCallback(async (eventId: string) => {
    try {
      const eventPrizes = await trpcClient.events.prizes.list.query({ eventId });
      setPrizes((prev) => {
        const filtered = prev.filter((p) => p.eventId !== eventId);
        return [...filtered, ...(eventPrizes as any)];
      });
    } catch (error) {
      console.error('Error loading prizes:', error);
    }
  }, []);

  const addPrize = useCallback(async (prize: Prize) => {
    try {
      const newPrize = await trpcClient.events.prizes.add.mutate(prize as any);
      setPrizes((prev) => [...prev, newPrize as any]);
    } catch (error) {
      console.error('Error adding prize:', error);
      throw error;
    }
  }, []);

  const addMultiplePrizes = useCallback(async (newPrizes: Prize[]) => {
    for (const prize of newPrizes) {
      await addPrize(prize);
    }
  }, [addPrize]);

  const deletePrize = useCallback(async (prizeId: string) => {
    try {
      await trpcClient.events.prizes.delete.mutate({ prizeId });
      setPrizes((prev) => prev.filter((p) => p.id !== prizeId));
    } catch (error) {
      console.error('Error deleting prize:', error);
      throw error;
    }
  }, []);

  const getEventPrizes = useCallback((eventId: string) => {
    return prizes.filter((p) => p.eventId === eventId);
  }, [prizes]);

  const loadEventRaffleWinners = useCallback(async (eventId: string) => {
    try {
      const winners = await trpcClient.events.raffle.listWinners.query({ eventId });
      setRaffleWinners((prev) => {
        const filtered = prev.filter((w) => w.eventId !== eventId);
        return [...filtered, ...(winners as any)];
      });
    } catch (error) {
      console.error('Error loading raffle winners:', error);
    }
  }, []);

  const addRaffleWinner = useCallback(async (winner: RaffleWinner) => {
    try {
      const newWinner = await trpcClient.events.raffle.addWinner.mutate(winner as any);
      setRaffleWinners((prev) => [...prev, newWinner as any]);
    } catch (error) {
      console.error('Error adding raffle winner:', error);
      throw error;
    }
  }, []);

  const addMultipleRaffleWinners = useCallback(async (newWinners: RaffleWinner[]) => {
    for (const winner of newWinners) {
      await addRaffleWinner(winner);
    }
  }, [addRaffleWinner]);

  const getEventRaffleWinners = useCallback((eventId: string) => {
    return raffleWinners.filter((w) => w.eventId === eventId);
  }, [raffleWinners]);

  const deleteRaffleWinner = useCallback(async (winnerId: string) => {
    try {
      await trpcClient.events.raffle.deleteWinner.mutate({ winnerId });
      setRaffleWinners((prev) => prev.filter((w) => w.id !== winnerId));
    } catch (error) {
      console.error('Error deleting raffle winner:', error);
      throw error;
    }
  }, []);

  const deleteAllRaffleWinners = useCallback(async (eventId: string) => {
    try {
      await trpcClient.events.raffle.deleteAllWinners.mutate({ eventId });
      setRaffleWinners((prev) => prev.filter((w) => w.eventId !== eventId));
    } catch (error) {
      console.error('Error deleting all raffle winners:', error);
      throw error;
    }
  }, []);

  const loadSampleData = useCallback(async () => {
    console.log('📦 Sample data loading not implemented with backend');
  }, []);

  return useMemo(() => ({
    events,
    attendees,
    prizes,
    raffleWinners,
    isLoading,
    addEvent,
    updateEvent,
    deleteEvent,
    addAttendee,
    addMultipleAttendees,
    checkInAttendee,
    toggleCheckInAttendee,
    checkInAllAttendees,
    getEventAttendees,
    getAttendeeByTicketCode,
    getEventById,
    getOrganizationEvents,
    getUserEvents,
    removeDuplicates,
    loadSampleData,
    addPrize,
    addMultiplePrizes,
    deletePrize,
    getEventPrizes,
    addRaffleWinner,
    addMultipleRaffleWinners,
    getEventRaffleWinners,
    deleteRaffleWinner,
    deleteAllRaffleWinners,
    loadEventAttendees,
    loadEventPrizes,
    loadEventRaffleWinners,
  }), [
    events,
    attendees,
    prizes,
    raffleWinners,
    isLoading,
    addEvent,
    updateEvent,
    deleteEvent,
    addAttendee,
    addMultipleAttendees,
    checkInAttendee,
    toggleCheckInAttendee,
    checkInAllAttendees,
    getEventAttendees,
    getAttendeeByTicketCode,
    getEventById,
    getOrganizationEvents,
    getUserEvents,
    removeDuplicates,
    loadSampleData,
    addPrize,
    addMultiplePrizes,
    deletePrize,
    getEventPrizes,
    addRaffleWinner,
    addMultipleRaffleWinners,
    getEventRaffleWinners,
    deleteRaffleWinner,
    deleteAllRaffleWinners,
    loadEventAttendees,
    loadEventPrizes,
    loadEventRaffleWinners,
  ]);
});
