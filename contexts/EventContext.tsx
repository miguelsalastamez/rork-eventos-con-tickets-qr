import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { Event, Attendee, Prize, RaffleWinner } from '@/types';
import { sampleEvents } from '@/mocks/sampleEvents';

const EVENTS_STORAGE_KEY = '@eventpass_events';
const ATTENDEES_STORAGE_KEY = '@eventpass_attendees';
const PRIZES_STORAGE_KEY = '@eventpass_prizes';
const RAFFLE_WINNERS_STORAGE_KEY = '@eventpass_raffle_winners';

export const [EventProvider, useEvents] = createContextHook(() => {
  const [events, setEvents] = useState<Event[]>([]);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [raffleWinners, setRaffleWinners] = useState<RaffleWinner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [storedEvents, storedAttendees, storedPrizes, storedWinners] = await Promise.all([
        AsyncStorage.getItem(EVENTS_STORAGE_KEY),
        AsyncStorage.getItem(ATTENDEES_STORAGE_KEY),
        AsyncStorage.getItem(PRIZES_STORAGE_KEY),
        AsyncStorage.getItem(RAFFLE_WINNERS_STORAGE_KEY),
      ]);

      if (storedEvents) setEvents(JSON.parse(storedEvents));
      if (storedAttendees) setAttendees(JSON.parse(storedAttendees));
      if (storedPrizes) setPrizes(JSON.parse(storedPrizes));
      if (storedWinners) setRaffleWinners(JSON.parse(storedWinners));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addEvent = useCallback(async (event: Event) => {
    console.log('🎉 Adding event:', event);
    const updatedEvents = [...events, event];
    setEvents(updatedEvents);
    await AsyncStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(updatedEvents));
    console.log('✅ Event saved successfully');
  }, [events]);

  const getOrganizationEvents = useCallback((organizationId: string) => {
    return events.filter((e) => e.organizationId === organizationId);
  }, [events]);

  const getUserEvents = useCallback((userId: string) => {
    return events.filter((e) => e.createdBy === userId);
  }, [events]);

  const updateEvent = useCallback(async (eventId: string, updates: Partial<Event>) => {
    console.log('🔄 Updating event:', eventId, updates);
    const updatedEvents = events.map((e) =>
      e.id === eventId ? { ...e, ...updates } : e
    );
    setEvents(updatedEvents);
    await AsyncStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(updatedEvents));
    console.log('✅ Event updated successfully');
  }, [events]);

  const deleteEvent = useCallback(async (eventId: string) => {
    const updatedEvents = events.filter((e) => e.id !== eventId);
    const updatedAttendees = attendees.filter((a) => a.eventId !== eventId);
    
    setEvents(updatedEvents);
    setAttendees(updatedAttendees);
    
    await Promise.all([
      AsyncStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(updatedEvents)),
      AsyncStorage.setItem(ATTENDEES_STORAGE_KEY, JSON.stringify(updatedAttendees)),
    ]);
  }, [events, attendees]);

  const addAttendee = useCallback(async (attendee: Attendee) => {
    const updatedAttendees = [...attendees, attendee];
    setAttendees(updatedAttendees);
    await AsyncStorage.setItem(ATTENDEES_STORAGE_KEY, JSON.stringify(updatedAttendees));
  }, [attendees]);

  const addMultipleAttendees = useCallback(async (newAttendees: Attendee[]) => {
    const updatedAttendees = [...attendees, ...newAttendees];
    setAttendees(updatedAttendees);
    await AsyncStorage.setItem(ATTENDEES_STORAGE_KEY, JSON.stringify(updatedAttendees));
  }, [attendees]);

  const checkInAttendee = useCallback(async (attendeeId: string) => {
    const updatedAttendees = attendees.map((a) =>
      a.id === attendeeId ? { ...a, checkedIn: true, checkedInAt: new Date().toISOString() } : a
    );
    setAttendees(updatedAttendees);
    await AsyncStorage.setItem(ATTENDEES_STORAGE_KEY, JSON.stringify(updatedAttendees));
  }, [attendees]);

  const toggleCheckInAttendee = useCallback(async (attendeeId: string) => {
    const updatedAttendees = attendees.map((a) => {
      if (a.id === attendeeId) {
        if (a.checkedIn) {
          return { ...a, checkedIn: false, checkedInAt: undefined };
        } else {
          return { ...a, checkedIn: true, checkedInAt: new Date().toISOString() };
        }
      }
      return a;
    });
    setAttendees(updatedAttendees);
    await AsyncStorage.setItem(ATTENDEES_STORAGE_KEY, JSON.stringify(updatedAttendees));
  }, [attendees]);

  const checkInAllAttendees = useCallback(async (eventId: string) => {
    const updatedAttendees = attendees.map((a) =>
      a.eventId === eventId && !a.checkedIn
        ? { ...a, checkedIn: true, checkedInAt: new Date().toISOString() }
        : a
    );
    setAttendees(updatedAttendees);
    await AsyncStorage.setItem(ATTENDEES_STORAGE_KEY, JSON.stringify(updatedAttendees));
  }, [attendees]);

  const removeDuplicates = useCallback(async (eventId: string) => {
    const eventAttendees = attendees.filter((a) => a.eventId === eventId);
    
    const uniqueAttendees = eventAttendees.reduce((acc, current) => {
      const existingIndex = acc.findIndex((a) => a.email.toLowerCase() === current.email.toLowerCase());
      
      if (existingIndex === -1) {
        acc.push(current);
      } else {
        const existing = acc[existingIndex];
        if (current.checkedIn && !existing.checkedIn) {
          acc[existingIndex] = current;
        } else if (new Date(current.checkedInAt || 0) > new Date(existing.checkedInAt || 0)) {
          acc[existingIndex] = current;
        }
      }
      
      return acc;
    }, [] as Attendee[]);

    const otherAttendees = attendees.filter((a) => a.eventId !== eventId);
    const updatedAttendees = [...otherAttendees, ...uniqueAttendees];
    
    setAttendees(updatedAttendees);
    await AsyncStorage.setItem(ATTENDEES_STORAGE_KEY, JSON.stringify(updatedAttendees));
    
    return eventAttendees.length - uniqueAttendees.length;
  }, [attendees]);

  const getEventAttendees = useCallback((eventId: string) => {
    return attendees.filter((a) => a.eventId === eventId);
  }, [attendees]);

  const getAttendeeByTicketCode = useCallback((ticketCode: string) => {
    return attendees.find((a) => a.ticketCode === ticketCode);
  }, [attendees]);

  const getEventById = useCallback((eventId: string) => {
    return events.find((e) => e.id === eventId);
  }, [events]);

  const addPrize = useCallback(async (prize: Prize) => {
    const updatedPrizes = [...prizes, prize];
    setPrizes(updatedPrizes);
    await AsyncStorage.setItem(PRIZES_STORAGE_KEY, JSON.stringify(updatedPrizes));
  }, [prizes]);

  const addMultiplePrizes = useCallback(async (newPrizes: Prize[]) => {
    const updatedPrizes = [...prizes, ...newPrizes];
    setPrizes(updatedPrizes);
    await AsyncStorage.setItem(PRIZES_STORAGE_KEY, JSON.stringify(updatedPrizes));
  }, [prizes]);

  const deletePrize = useCallback(async (prizeId: string) => {
    const updatedPrizes = prizes.filter((p) => p.id !== prizeId);
    setPrizes(updatedPrizes);
    await AsyncStorage.setItem(PRIZES_STORAGE_KEY, JSON.stringify(updatedPrizes));
  }, [prizes]);

  const getEventPrizes = useCallback((eventId: string) => {
    return prizes.filter((p) => p.eventId === eventId);
  }, [prizes]);

  const addRaffleWinner = useCallback(async (winner: RaffleWinner) => {
    const updatedWinners = [...raffleWinners, winner];
    setRaffleWinners(updatedWinners);
    await AsyncStorage.setItem(RAFFLE_WINNERS_STORAGE_KEY, JSON.stringify(updatedWinners));
  }, [raffleWinners]);

  const addMultipleRaffleWinners = useCallback(async (newWinners: RaffleWinner[]) => {
    const updatedWinners = [...raffleWinners, ...newWinners];
    setRaffleWinners(updatedWinners);
    await AsyncStorage.setItem(RAFFLE_WINNERS_STORAGE_KEY, JSON.stringify(updatedWinners));
  }, [raffleWinners]);

  const getEventRaffleWinners = useCallback((eventId: string) => {
    return raffleWinners.filter((w) => w.eventId === eventId);
  }, [raffleWinners]);

  const deleteRaffleWinner = useCallback(async (winnerId: string) => {
    const updatedWinners = raffleWinners.filter((w) => w.id !== winnerId);
    setRaffleWinners(updatedWinners);
    await AsyncStorage.setItem(RAFFLE_WINNERS_STORAGE_KEY, JSON.stringify(updatedWinners));
  }, [raffleWinners]);

  const deleteAllRaffleWinners = useCallback(async (eventId: string) => {
    const updatedWinners = raffleWinners.filter((w) => w.eventId !== eventId);
    setRaffleWinners(updatedWinners);
    await AsyncStorage.setItem(RAFFLE_WINNERS_STORAGE_KEY, JSON.stringify(updatedWinners));
  }, [raffleWinners]);

  const loadSampleData = useCallback(async () => {
    console.log('📦 Loading sample data...');
    try {
      const allAttendees: Attendee[] = [];
      
      sampleEvents.forEach((event) => {
        if (event.attendees) {
          allAttendees.push(...event.attendees);
        }
      });

      const eventsWithoutAttendees = sampleEvents.map(({ attendees, ...event }) => event);

      setEvents(eventsWithoutAttendees);
      setAttendees(allAttendees);

      await Promise.all([
        AsyncStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(eventsWithoutAttendees)),
        AsyncStorage.setItem(ATTENDEES_STORAGE_KEY, JSON.stringify(allAttendees)),
      ]);

      console.log('✅ Sample data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading sample data:', error);
      throw error;
    }
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
  }), [events, attendees, prizes, raffleWinners, isLoading, addEvent, updateEvent, deleteEvent, addAttendee, addMultipleAttendees, checkInAttendee, toggleCheckInAttendee, checkInAllAttendees, getEventAttendees, getAttendeeByTicketCode, getEventById, getOrganizationEvents, getUserEvents, removeDuplicates, loadSampleData, addPrize, addMultiplePrizes, deletePrize, getEventPrizes, addRaffleWinner, addMultipleRaffleWinners, getEventRaffleWinners, deleteRaffleWinner, deleteAllRaffleWinners]);
});
