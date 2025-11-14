import { useCallback, useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { Event, Attendee, Prize, RaffleWinner } from '@/types';
import { trpc } from '@/lib/trpc';
import { useUser } from './UserContext';

export const [EventProvider, useEvents] = createContextHook(() => {
  const { isAuthenticated, isLoading: isAuthLoading } = useUser();
  
  const eventsQuery = trpc.events.list.useQuery(undefined, {
    retry: 1,
    retryDelay: 1000,
    enabled: isAuthenticated && !isAuthLoading,
  });
  const attendeesQuery = trpc.attendees.list.useQuery(undefined, {
    retry: 1,
    retryDelay: 1000,
    enabled: isAuthenticated && !isAuthLoading,
  });
  const prizesQuery = trpc.prizes.list.useQuery(undefined, {
    retry: 1,
    retryDelay: 1000,
    enabled: isAuthenticated && !isAuthLoading,
  });
  const winnersQuery = trpc.winners.list.useQuery(undefined, {
    retry: 1,
    retryDelay: 1000,
    enabled: isAuthenticated && !isAuthLoading,
  });

  const events = eventsQuery.data || [];
  const attendees = attendeesQuery.data || [];
  const prizes = prizesQuery.data || [];
  const raffleWinners = winnersQuery.data || [];
  const isLoading = eventsQuery.isLoading || attendeesQuery.isLoading || prizesQuery.isLoading || winnersQuery.isLoading;
  const isError = eventsQuery.isError || attendeesQuery.isError || prizesQuery.isError || winnersQuery.isError;
  const error = eventsQuery.error || attendeesQuery.error || prizesQuery.error || winnersQuery.error;

  const utils = trpc.useUtils();

  const createEventMutation = trpc.events.create.useMutation({
    onSuccess: () => {
      utils.events.list.invalidate();
    },
  });

  const updateEventMutation = trpc.events.update.useMutation({
    onSuccess: () => {
      utils.events.list.invalidate();
    },
  });

  const deleteEventMutation = trpc.events.delete.useMutation({
    onSuccess: () => {
      utils.events.list.invalidate();
      utils.attendees.list.invalidate();
    },
  });

  const createAttendeeMutation = trpc.attendees.create.useMutation({
    onSuccess: () => {
      utils.attendees.list.invalidate();
    },
  });

  const createMultipleAttendeesMutation = trpc.attendees.createMultiple.useMutation({
    onSuccess: () => {
      utils.attendees.list.invalidate();
    },
  });

  const checkInAttendeeMutation = trpc.attendees.checkIn.useMutation({
    onSuccess: () => {
      utils.attendees.list.invalidate();
    },
  });

  const toggleCheckInMutation = trpc.attendees.toggleCheckIn.useMutation({
    onSuccess: () => {
      utils.attendees.list.invalidate();
    },
  });

  const checkInAllMutation = trpc.attendees.checkInAll.useMutation({
    onSuccess: () => {
      utils.attendees.list.invalidate();
    },
  });

  const removeDuplicatesMutation = trpc.attendees.removeDuplicates.useMutation({
    onSuccess: () => {
      utils.attendees.list.invalidate();
    },
  });

  const createPrizeMutation = trpc.prizes.create.useMutation({
    onSuccess: () => {
      utils.prizes.list.invalidate();
    },
  });

  const createMultiplePrizesMutation = trpc.prizes.createMultiple.useMutation({
    onSuccess: () => {
      utils.prizes.list.invalidate();
    },
  });

  const deletePrizeMutation = trpc.prizes.delete.useMutation({
    onSuccess: () => {
      utils.prizes.list.invalidate();
    },
  });

  const createWinnerMutation = trpc.winners.create.useMutation({
    onSuccess: () => {
      utils.winners.list.invalidate();
    },
  });

  const createMultipleWinnersMutation = trpc.winners.createMultiple.useMutation({
    onSuccess: () => {
      utils.winners.list.invalidate();
    },
  });

  const deleteWinnerMutation = trpc.winners.delete.useMutation({
    onSuccess: () => {
      utils.winners.list.invalidate();
    },
  });

  const deleteAllWinnersMutation = trpc.winners.deleteAll.useMutation({
    onSuccess: () => {
      utils.winners.list.invalidate();
    },
  });

  const seedTestDataMutation = trpc.events.seedTestData.useMutation({
    onSuccess: () => {
      utils.events.list.invalidate();
      utils.attendees.list.invalidate();
    },
  });

  const addEvent = useCallback(async (event: Event) => {
    console.log('🎉 Adding event:', event);
    await createEventMutation.mutateAsync(event);
    console.log('✅ Event saved successfully');
  }, [createEventMutation]);

  const getOrganizationEvents = useCallback((organizationId: string) => {
    return events.filter((e) => e.organizationId === organizationId);
  }, [events]);

  const getUserEvents = useCallback((userId: string) => {
    return events.filter((e) => e.createdBy === userId);
  }, [events]);

  const updateEvent = useCallback(async (eventId: string, updates: Partial<Event>) => {
    console.log('🔄 Updating event:', eventId, updates);
    await updateEventMutation.mutateAsync({ id: eventId, ...updates });
    console.log('✅ Event updated successfully');
  }, [updateEventMutation]);

  const deleteEvent = useCallback(async (eventId: string) => {
    await deleteEventMutation.mutateAsync({ id: eventId });
  }, [deleteEventMutation]);

  const addAttendee = useCallback(async (attendee: Attendee) => {
    await createAttendeeMutation.mutateAsync(attendee);
  }, [createAttendeeMutation]);

  const addMultipleAttendees = useCallback(async (newAttendees: Attendee[]) => {
    await createMultipleAttendeesMutation.mutateAsync({ attendees: newAttendees });
  }, [createMultipleAttendeesMutation]);

  const checkInAttendee = useCallback(async (attendeeId: string) => {
    await checkInAttendeeMutation.mutateAsync({ id: attendeeId });
  }, [checkInAttendeeMutation]);

  const toggleCheckInAttendee = useCallback(async (attendeeId: string) => {
    await toggleCheckInMutation.mutateAsync({ id: attendeeId });
  }, [toggleCheckInMutation]);

  const checkInAllAttendees = useCallback(async (eventId: string) => {
    await checkInAllMutation.mutateAsync({ eventId });
  }, [checkInAllMutation]);

  const removeDuplicates = useCallback(async (eventId: string) => {
    const result = await removeDuplicatesMutation.mutateAsync({ eventId });
    return result.duplicatesRemoved;
  }, [removeDuplicatesMutation]);

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
    await createPrizeMutation.mutateAsync(prize);
  }, [createPrizeMutation]);

  const addMultiplePrizes = useCallback(async (newPrizes: Prize[]) => {
    await createMultiplePrizesMutation.mutateAsync({ prizes: newPrizes });
  }, [createMultiplePrizesMutation]);

  const deletePrize = useCallback(async (prizeId: string) => {
    await deletePrizeMutation.mutateAsync({ id: prizeId });
  }, [deletePrizeMutation]);

  const getEventPrizes = useCallback((eventId: string) => {
    return prizes.filter((p) => p.eventId === eventId);
  }, [prizes]);

  const addRaffleWinner = useCallback(async (winner: RaffleWinner) => {
    await createWinnerMutation.mutateAsync(winner);
  }, [createWinnerMutation]);

  const addMultipleRaffleWinners = useCallback(async (newWinners: RaffleWinner[]) => {
    await createMultipleWinnersMutation.mutateAsync({ winners: newWinners });
  }, [createMultipleWinnersMutation]);

  const getEventRaffleWinners = useCallback((eventId: string) => {
    return raffleWinners.filter((w) => w.eventId === eventId);
  }, [raffleWinners]);

  const deleteRaffleWinner = useCallback(async (winnerId: string) => {
    await deleteWinnerMutation.mutateAsync({ id: winnerId });
  }, [deleteWinnerMutation]);

  const deleteAllRaffleWinners = useCallback(async (eventId: string) => {
    await deleteAllWinnersMutation.mutateAsync({ eventId });
  }, [deleteAllWinnersMutation]);

  const loadSampleData = useCallback(async () => {
    console.log('📦 Loading sample data...');
    try {
      await seedTestDataMutation.mutateAsync();
      console.log('✅ Sample data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading sample data:', error);
      throw error;
    }
  }, [seedTestDataMutation]);

  return useMemo(() => ({
    events,
    attendees,
    prizes,
    raffleWinners,
    isLoading,
    isError,
    error,
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
  }), [events, attendees, prizes, raffleWinners, isLoading, isError, error, addEvent, updateEvent, deleteEvent, addAttendee, addMultipleAttendees, checkInAttendee, toggleCheckInAttendee, checkInAllAttendees, getEventAttendees, getAttendeeByTicketCode, getEventById, getOrganizationEvents, getUserEvents, removeDuplicates, loadSampleData, addPrize, addMultiplePrizes, deletePrize, getEventPrizes, addRaffleWinner, addMultipleRaffleWinners, getEventRaffleWinners, deleteRaffleWinner, deleteAllRaffleWinners]);
});
