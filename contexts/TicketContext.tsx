import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { Ticket, CapacityPool, TicketPurchase, BuyerAccount } from '@/types';

const TICKETS_STORAGE_KEY = '@eventpass_tickets';
const CAPACITY_POOLS_STORAGE_KEY = '@eventpass_capacity_pools';
const PURCHASES_STORAGE_KEY = '@eventpass_purchases';
const BUYERS_STORAGE_KEY = '@eventpass_buyers';

export const [TicketProvider, useTickets] = createContextHook(() => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [capacityPools, setCapacityPools] = useState<CapacityPool[]>([]);
  const [purchases, setPurchases] = useState<TicketPurchase[]>([]);
  const [buyers, setBuyers] = useState<BuyerAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [storedTickets, storedPools, storedPurchases, storedBuyers] = await Promise.all([
        AsyncStorage.getItem(TICKETS_STORAGE_KEY),
        AsyncStorage.getItem(CAPACITY_POOLS_STORAGE_KEY),
        AsyncStorage.getItem(PURCHASES_STORAGE_KEY),
        AsyncStorage.getItem(BUYERS_STORAGE_KEY),
      ]);

      if (storedTickets) setTickets(JSON.parse(storedTickets));
      if (storedPools) setCapacityPools(JSON.parse(storedPools));
      if (storedPurchases) setPurchases(JSON.parse(storedPurchases));
      if (storedBuyers) setBuyers(JSON.parse(storedBuyers));
    } catch (error) {
      console.error('Error loading ticket data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addTicket = useCallback(async (ticket: Ticket) => {
    const updated = [...tickets, ticket];
    setTickets(updated);
    await AsyncStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(updated));
  }, [tickets]);

  const updateTicket = useCallback(async (ticketId: string, updates: Partial<Ticket>) => {
    const updated = tickets.map((t) => (t.id === ticketId ? { ...t, ...updates } : t));
    setTickets(updated);
    await AsyncStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(updated));
  }, [tickets]);

  const deleteTicket = useCallback(async (ticketId: string) => {
    const updated = tickets.filter((t) => t.id !== ticketId);
    setTickets(updated);
    await AsyncStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(updated));
  }, [tickets]);

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
    const updated = [...capacityPools, pool];
    setCapacityPools(updated);
    await AsyncStorage.setItem(CAPACITY_POOLS_STORAGE_KEY, JSON.stringify(updated));
  }, [capacityPools]);

  const updateCapacityPool = useCallback(async (poolId: string, updates: Partial<CapacityPool>) => {
    const updated = capacityPools.map((p) => (p.id === poolId ? { ...p, ...updates } : p));
    setCapacityPools(updated);
    await AsyncStorage.setItem(CAPACITY_POOLS_STORAGE_KEY, JSON.stringify(updated));
  }, [capacityPools]);

  const getEventCapacityPools = useCallback((eventId: string) => {
    return capacityPools.filter((p) => p.eventId === eventId);
  }, [capacityPools]);

  const addPurchase = useCallback(async (purchase: TicketPurchase) => {
    const updated = [...purchases, purchase];
    setPurchases(updated);
    await AsyncStorage.setItem(PURCHASES_STORAGE_KEY, JSON.stringify(updated));

    if (purchase.ticketId) {
      const ticket = tickets.find((t) => t.id === purchase.ticketId);
      if (ticket) {
        await updateTicket(ticket.id, {
          soldCount: (ticket.soldCount || 0) + purchase.quantity,
        });

        if (ticket.capacityType === 'shared' && ticket.sharedCapacityPoolId) {
          const pool = capacityPools.find((p) => p.id === ticket.sharedCapacityPoolId);
          if (pool) {
            await updateCapacityPool(pool.id, {
              usedCapacity: pool.usedCapacity + purchase.quantity,
            });
          }
        }
      }
    }
  }, [purchases, tickets, capacityPools, updateTicket, updateCapacityPool]);

  const updatePurchase = useCallback(async (purchaseId: string, updates: Partial<TicketPurchase>) => {
    const updated = purchases.map((p) => (p.id === purchaseId ? { ...p, ...updates } : p));
    setPurchases(updated);
    await AsyncStorage.setItem(PURCHASES_STORAGE_KEY, JSON.stringify(updated));
  }, [purchases]);

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
    
    const updated = [...buyers, newBuyer];
    setBuyers(updated);
    await AsyncStorage.setItem(BUYERS_STORAGE_KEY, JSON.stringify(updated));
    
    return newBuyer;
  }, [buyers]);

  const addPurchaseToBuyer = useCallback(async (buyerEmail: string, purchaseId: string) => {
    const updated = buyers.map((b) =>
      b.email.toLowerCase() === buyerEmail.toLowerCase()
        ? { ...b, purchases: [...b.purchases, purchaseId] }
        : b
    );
    setBuyers(updated);
    await AsyncStorage.setItem(BUYERS_STORAGE_KEY, JSON.stringify(updated));
  }, [buyers]);

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
