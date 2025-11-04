import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { Event, Attendee, Prize, RaffleWinner } from '@/types';
import { sampleEvents, sampleAttendees } from '@/mocks/sampleEvents';

const EVENTS_KEY = '@events';
const ATTENDEES_KEY = '@attendees';
const PRIZES_KEY = '@prizes';
const RAFFLE_WINNERS_KEY = '@raffle_winners';

export const [EventProvider, useEvents] = createContextHook(() => {
  const [events, setEvents] = useState<Event[]>([]);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [raffleWinners, setRaffleWinners] = useState<RaffleWinner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [eventsData, attendeesData, prizesData, winnersData] = await Promise.all([
        AsyncStorage.getItem(EVENTS_KEY),
        AsyncStorage.getItem(ATTENDEES_KEY),
        AsyncStorage.getItem(PRIZES_KEY),
        AsyncStorage.getItem(RAFFLE_WINNERS_KEY),
      ]);

      if (eventsData) setEvents(JSON.parse(eventsData));
      if (attendeesData) setAttendees(JSON.parse(attendeesData));
      if (prizesData) setPrizes(JSON.parse(prizesData));
      if (winnersData) setRaffleWinners(JSON.parse(winnersData));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveEvents = useCallback(async (newEvents: Event[]) => {
    try {
      console.log('💾 Saving events to AsyncStorage:', newEvents);
      await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(newEvents));
      setEvents(newEvents);
      console.log('✅ Events saved and state updated');
    } catch (error) {
      console.error('❌ Error saving events:', error);
      throw error;
    }
  }, []);

  const saveAttendees = useCallback(async (newAttendees: Attendee[]) => {
    try {
      await AsyncStorage.setItem(ATTENDEES_KEY, JSON.stringify(newAttendees));
      setAttendees(newAttendees);
    } catch (error) {
      console.error('Error saving attendees:', error);
    }
  }, []);

  const savePrizes = useCallback(async (newPrizes: Prize[]) => {
    try {
      await AsyncStorage.setItem(PRIZES_KEY, JSON.stringify(newPrizes));
      setPrizes(newPrizes);
    } catch (error) {
      console.error('Error saving prizes:', error);
    }
  }, []);

  const saveRaffleWinners = useCallback(async (newWinners: RaffleWinner[]) => {
    try {
      await AsyncStorage.setItem(RAFFLE_WINNERS_KEY, JSON.stringify(newWinners));
      setRaffleWinners(newWinners);
    } catch (error) {
      console.error('Error saving raffle winners:', error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addEvent = useCallback(async (event: Event) => {
    console.log('🎉 Adding event:', event);
    const newEvents = [...events, event];
    console.log('📋 New events list:', newEvents);
    await saveEvents(newEvents);
    console.log('✅ Event saved successfully');
  }, [events, saveEvents]);

  const getOrganizationEvents = useCallback((organizationId: string) => {
    return events.filter((e) => e.organizationId === organizationId);
  }, [events]);

  const getUserEvents = useCallback((userId: string) => {
    return events.filter((e) => e.createdBy === userId);
  }, [events]);

  const updateEvent = useCallback(async (eventId: string, updates: Partial<Event>) => {
    console.log('🔄 Updating event:', eventId, updates);
    const newEvents = events.map((e) =>
      e.id === eventId ? { ...e, ...updates } : e
    );
    console.log('📋 Events after update:', newEvents);
    await saveEvents(newEvents);
    console.log('✅ Event updated successfully');
  }, [events, saveEvents]);

  const deleteEvent = useCallback(async (eventId: string) => {
    const newEvents = events.filter((e) => e.id !== eventId);
    const newAttendees = attendees.filter((a) => a.eventId !== eventId);
    await saveEvents(newEvents);
    await saveAttendees(newAttendees);
  }, [events, attendees, saveEvents, saveAttendees]);

  const addAttendee = useCallback((attendee: Attendee) => {
    const newAttendees = [...attendees, attendee];
    saveAttendees(newAttendees);
  }, [attendees, saveAttendees]);

  const addMultipleAttendees = useCallback((newAttendees: Attendee[]) => {
    const combined = [...attendees, ...newAttendees];
    saveAttendees(combined);
  }, [attendees, saveAttendees]);

  const checkInAttendee = useCallback((attendeeId: string) => {
    const newAttendees = attendees.map((a) =>
      a.id === attendeeId
        ? { ...a, checkedIn: true, checkedInAt: new Date().toISOString() }
        : a
    );
    saveAttendees(newAttendees);
  }, [attendees, saveAttendees]);

  const toggleCheckInAttendee = useCallback((attendeeId: string) => {
    const newAttendees = attendees.map((a) => {
      if (a.id === attendeeId) {
        if (a.checkedIn) {
          return { ...a, checkedIn: false, checkedInAt: undefined };
        } else {
          return { ...a, checkedIn: true, checkedInAt: new Date().toISOString() };
        }
      }
      return a;
    });
    saveAttendees(newAttendees);
  }, [attendees, saveAttendees]);

  const checkInAllAttendees = useCallback(async (eventId: string) => {
    const newAttendees = attendees.map((a) => {
      if (a.eventId === eventId && !a.checkedIn) {
        return { ...a, checkedIn: true, checkedInAt: new Date().toISOString() };
      }
      return a;
    });
    await saveAttendees(newAttendees);
  }, [attendees, saveAttendees]);

  const removeDuplicates = useCallback(async (eventId: string) => {
    const eventAttendees = attendees.filter((a) => a.eventId === eventId);
    const otherAttendees = attendees.filter((a) => a.eventId !== eventId);

    const seen = new Map<string, Attendee>();
    const duplicates: string[] = [];

    eventAttendees.forEach((attendee) => {
      const key = `${attendee.email.toLowerCase()}-${attendee.employeeNumber.toLowerCase()}`;
      
      if (!seen.has(key)) {
        seen.set(key, attendee);
      } else {
        duplicates.push(attendee.id);
      }
    });

    const uniqueAttendees = Array.from(seen.values());
    const newAttendees = [...otherAttendees, ...uniqueAttendees];
    
    await saveAttendees(newAttendees);
    return duplicates.length;
  }, [attendees, saveAttendees]);

  const getEventAttendees = useCallback((eventId: string) => {
    return attendees.filter((a) => a.eventId === eventId);
  }, [attendees]);

  const getAttendeeByTicketCode = useCallback((ticketCode: string) => {
    return attendees.find((a) => a.ticketCode === ticketCode);
  }, [attendees]);

  const getEventById = useCallback((eventId: string) => {
    return events.find((e) => e.id === eventId);
  }, [events]);

  const addPrize = useCallback((prize: Prize) => {
    const newPrizes = [...prizes, prize];
    savePrizes(newPrizes);
  }, [prizes, savePrizes]);

  const addMultiplePrizes = useCallback((newPrizes: Prize[]) => {
    const combined = [...prizes, ...newPrizes];
    savePrizes(combined);
  }, [prizes, savePrizes]);

  const deletePrize = useCallback((prizeId: string) => {
    const newPrizes = prizes.filter((p) => p.id !== prizeId);
    savePrizes(newPrizes);
  }, [prizes, savePrizes]);

  const getEventPrizes = useCallback((eventId: string) => {
    return prizes.filter((p) => p.eventId === eventId);
  }, [prizes]);

  const addRaffleWinner = useCallback((winner: RaffleWinner) => {
    const newWinners = [...raffleWinners, winner];
    saveRaffleWinners(newWinners);
  }, [raffleWinners, saveRaffleWinners]);

  const addMultipleRaffleWinners = useCallback((newWinners: RaffleWinner[]) => {
    const combined = [...raffleWinners, ...newWinners];
    saveRaffleWinners(combined);
  }, [raffleWinners, saveRaffleWinners]);

  const getEventRaffleWinners = useCallback((eventId: string) => {
    return raffleWinners.filter((w) => w.eventId === eventId);
  }, [raffleWinners]);

  const deleteRaffleWinner = useCallback((winnerId: string) => {
    const newWinners = raffleWinners.filter((w) => w.id !== winnerId);
    saveRaffleWinners(newWinners);
  }, [raffleWinners, saveRaffleWinners]);

  const deleteAllRaffleWinners = useCallback((eventId: string) => {
    const newWinners = raffleWinners.filter((w) => w.eventId !== eventId);
    saveRaffleWinners(newWinners);
  }, [raffleWinners, saveRaffleWinners]);

  const loadSampleData = useCallback(async () => {
    console.log('📦 Loading sample data...');
    try {
      await saveEvents(sampleEvents);
      await saveAttendees(sampleAttendees);
      console.log('✅ Sample data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading sample data:', error);
      throw error;
    }
  }, [saveEvents, saveAttendees]);

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
