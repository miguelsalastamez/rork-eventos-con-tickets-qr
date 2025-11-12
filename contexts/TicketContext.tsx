import { useCallback, useMemo, useState } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { Ticket, CapacityPool, TicketPurchase, BuyerAccount } from '@/types';
import { trpc } from '@/lib/trpc';

export const [TicketProvider, useTickets] = createContextHook(() => {
  const ticketsQuery = trpc.tickets.list.useQuery();
  const poolsQuery = trpc.capacityPools.list.useQuery();
  const purchasesQuery = trpc.purchases.list.useQuery();

  const tickets = ticketsQuery.data || [];
  const capacityPools = poolsQuery.data || [];
  const purchases = purchasesQuery.data || [];
  const [buyers] = useState<BuyerAccount[]>([]);
  const isLoading = ticketsQuery.isLoading || poolsQuery.isLoading || purchasesQuery.isLoading;

  const utils = trpc.useUtils();

  const createTicketMutation = trpc.tickets.create.useMutation({
    onSuccess: () => {
      utils.tickets.list.invalidate();
    },
  });

  const updateTicketMutation = trpc.tickets.update.useMutation({
    onSuccess: () => {
      utils.tickets.list.invalidate();
    },
  });

  const deleteTicketMutation = trpc.tickets.delete.useMutation({
    onSuccess: () => {
      utils.tickets.list.invalidate();
    },
  });

  const createPoolMutation = trpc.capacityPools.create.useMutation({
    onSuccess: () => {
      utils.capacityPools.list.invalidate();
    },
  });

  const updatePoolMutation = trpc.capacityPools.update.useMutation({
    onSuccess: () => {
      utils.capacityPools.list.invalidate();
    },
  });

  const createPurchaseMutation = trpc.purchases.create.useMutation({
    onSuccess: () => {
      utils.purchases.list.invalidate();
      utils.tickets.list.invalidate();
      utils.capacityPools.list.invalidate();
    },
  });

  const updatePurchaseMutation = trpc.purchases.update.useMutation({
    onSuccess: () => {
      utils.purchases.list.invalidate();
    },
  });

  const addTicket = useCallback(async (ticket: Ticket) => {
    await createTicketMutation.mutateAsync(ticket);
  }, [createTicketMutation]);

  const updateTicket = useCallback(async (ticketId: string, updates: Partial<Ticket>) => {
    await updateTicketMutation.mutateAsync({ id: ticketId, ...updates });
  }, [updateTicketMutation]);

  const deleteTicket = useCallback(async (ticketId: string) => {
    await deleteTicketMutation.mutateAsync({ id: ticketId });
  }, [deleteTicketMutation]);

  const getEventTickets = useCallback((eventId: string) => {
    return tickets.filter((t) => t.eventId === eventId);
  }, [tickets]);

  const getAvailableEventTickets = useCallback((eventId: string) => {
    const now = new Date();
    return tickets.filter((t) => {
      if (t.eventId !== eventId || !t.isActive) return false;
      
      const saleStart = new Date(t.saleStartDate);
      const saleEnd = new Date(t.saleEndDate);
      
      if (now < saleStart || now > saleEnd) return false;
      
      if (t.capacityType === 'unlimited') return true;
      
      if (t.capacityType === 'dedicated') {
        return (t.soldCount || 0) < (t.dedicatedCapacity || 0);
      }
      
      if (t.capacityType === 'shared' && t.sharedCapacityPoolId) {
        const pool = capacityPools.find((p) => p.id === t.sharedCapacityPoolId);
        if (!pool) return false;
        return pool.usedCapacity < pool.totalCapacity;
      }
      
      return false;
    });
  }, [tickets, capacityPools]);

  const addCapacityPool = useCallback(async (pool: CapacityPool) => {
    await createPoolMutation.mutateAsync(pool);
  }, [createPoolMutation]);

  const updateCapacityPool = useCallback(async (poolId: string, updates: Partial<CapacityPool>) => {
    await updatePoolMutation.mutateAsync({ id: poolId, ...updates });
  }, [updatePoolMutation]);

  const getEventCapacityPools = useCallback((eventId: string) => {
    return capacityPools.filter((p) => p.eventId === eventId);
  }, [capacityPools]);

  const addPurchase = useCallback(async (purchase: TicketPurchase) => {
    await createPurchaseMutation.mutateAsync(purchase);
  }, [createPurchaseMutation]);

  const updatePurchase = useCallback(async (purchaseId: string, updates: Partial<TicketPurchase>) => {
    await updatePurchaseMutation.mutateAsync({ id: purchaseId, ...updates });
  }, [updatePurchaseMutation]);

  const getEventPurchases = useCallback((eventId: string) => {
    return purchases.filter((p) => p.eventId === eventId);
  }, [purchases]);

  const getUserPurchases = useCallback((userId: string) => {
    return purchases.filter((p) => p.userId === userId);
  }, [purchases]);

  const createOrGetBuyer = useCallback(async (email: string, fullName: string, phone?: string): Promise<BuyerAccount> => {
    const existingBuyer = buyers.find((b) => b.email.toLowerCase() === email.toLowerCase());
    
    if (existingBuyer) {
      return existingBuyer;
    }
    
    const temporaryPassword = Math.random().toString(36).slice(-8);
    
    const newBuyer: BuyerAccount = {
      id: `buyer-${Date.now()}`,
      email,
      fullName,
      phone,
      temporaryPassword,
      createdAt: new Date().toISOString(),
      purchases: [],
    };
    
    console.log('Buyer accounts not yet implemented in backend');
    
    return newBuyer;
  }, [buyers]);

  const addPurchaseToBuyer = useCallback(async (buyerEmail: string, purchaseId: string) => {
    console.log('Buyer accounts not yet implemented in backend');
  }, []);

  const getBuyerByEmail = useCallback((email: string) => {
    return buyers.find((b) => b.email.toLowerCase() === email.toLowerCase());
  }, [buyers]);

  return useMemo(() => ({
    tickets,
    capacityPools,
    purchases,
    buyers,
    isLoading,
    addTicket,
    updateTicket,
    deleteTicket,
    getEventTickets,
    getAvailableEventTickets,
    addCapacityPool,
    updateCapacityPool,
    getEventCapacityPools,
    addPurchase,
    updatePurchase,
    getEventPurchases,
    getUserPurchases,
    createOrGetBuyer,
    addPurchaseToBuyer,
    getBuyerByEmail,
  }), [
    tickets,
    capacityPools,
    purchases,
    buyers,
    isLoading,
    addTicket,
    updateTicket,
    deleteTicket,
    getEventTickets,
    getAvailableEventTickets,
    addCapacityPool,
    updateCapacityPool,
    getEventCapacityPools,
    addPurchase,
    updatePurchase,
    getEventPurchases,
    getUserPurchases,
    createOrGetBuyer,
    addPurchaseToBuyer,
    getBuyerByEmail,
  ]);
});
