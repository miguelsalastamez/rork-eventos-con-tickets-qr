import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { Ticket, CapacityPool, TicketPurchase, BuyerAccount } from '@/types';

const TICKETS_KEY = '@tickets';
const CAPACITY_POOLS_KEY = '@capacity_pools';
const PURCHASES_KEY = '@ticket_purchases';
const BUYERS_KEY = '@buyer_accounts';

export const [TicketProvider, useTickets] = createContextHook(() => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [capacityPools, setCapacityPools] = useState<CapacityPool[]>([]);
  const [purchases, setPurchases] = useState<TicketPurchase[]>([]);
  const [buyers, setBuyers] = useState<BuyerAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [ticketsData, poolsData, purchasesData, buyersData] = await Promise.all([
        AsyncStorage.getItem(TICKETS_KEY),
        AsyncStorage.getItem(CAPACITY_POOLS_KEY),
        AsyncStorage.getItem(PURCHASES_KEY),
        AsyncStorage.getItem(BUYERS_KEY),
      ]);

      if (ticketsData) setTickets(JSON.parse(ticketsData));
      if (poolsData) setCapacityPools(JSON.parse(poolsData));
      if (purchasesData) setPurchases(JSON.parse(purchasesData));
      if (buyersData) setBuyers(JSON.parse(buyersData));
    } catch (error) {
      console.error('Error loading ticket data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const saveTickets = useCallback(async (newTickets: Ticket[]) => {
    try {
      await AsyncStorage.setItem(TICKETS_KEY, JSON.stringify(newTickets));
      setTickets(newTickets);
    } catch (error) {
      console.error('Error saving tickets:', error);
    }
  }, []);

  const saveCapacityPools = useCallback(async (newPools: CapacityPool[]) => {
    try {
      await AsyncStorage.setItem(CAPACITY_POOLS_KEY, JSON.stringify(newPools));
      setCapacityPools(newPools);
    } catch (error) {
      console.error('Error saving capacity pools:', error);
    }
  }, []);

  const savePurchases = useCallback(async (newPurchases: TicketPurchase[]) => {
    try {
      await AsyncStorage.setItem(PURCHASES_KEY, JSON.stringify(newPurchases));
      setPurchases(newPurchases);
    } catch (error) {
      console.error('Error saving purchases:', error);
    }
  }, []);

  const saveBuyers = useCallback(async (newBuyers: BuyerAccount[]) => {
    try {
      await AsyncStorage.setItem(BUYERS_KEY, JSON.stringify(newBuyers));
      setBuyers(newBuyers);
    } catch (error) {
      console.error('Error saving buyers:', error);
    }
  }, []);

  const addTicket = useCallback(async (ticket: Ticket) => {
    const newTickets = [...tickets, ticket];
    await saveTickets(newTickets);
  }, [tickets, saveTickets]);

  const updateTicket = useCallback(async (ticketId: string, updates: Partial<Ticket>) => {
    const newTickets = tickets.map((t) =>
      t.id === ticketId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
    );
    await saveTickets(newTickets);
  }, [tickets, saveTickets]);

  const deleteTicket = useCallback(async (ticketId: string) => {
    const newTickets = tickets.filter((t) => t.id !== ticketId);
    await saveTickets(newTickets);
  }, [tickets, saveTickets]);

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
        return t.soldCount < (t.dedicatedCapacity || 0);
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
    const newPools = [...capacityPools, pool];
    await saveCapacityPools(newPools);
  }, [capacityPools, saveCapacityPools]);

  const updateCapacityPool = useCallback(async (poolId: string, updates: Partial<CapacityPool>) => {
    const newPools = capacityPools.map((p) =>
      p.id === poolId ? { ...p, ...updates } : p
    );
    await saveCapacityPools(newPools);
  }, [capacityPools, saveCapacityPools]);

  const getEventCapacityPools = useCallback((eventId: string) => {
    return capacityPools.filter((p) => p.eventId === eventId);
  }, [capacityPools]);

  const addPurchase = useCallback(async (purchase: TicketPurchase) => {
    const newPurchases = [...purchases, purchase];
    await savePurchases(newPurchases);
    
    const ticket = tickets.find((t) => t.id === purchase.ticketId);
    if (ticket) {
      const updatedTicket = {
        ...ticket,
        soldCount: ticket.soldCount + purchase.quantity,
      };
      await updateTicket(ticket.id, updatedTicket);
      
      if (ticket.capacityType === 'shared' && ticket.sharedCapacityPoolId) {
        const pool = capacityPools.find((p) => p.id === ticket.sharedCapacityPoolId);
        if (pool) {
          await updateCapacityPool(pool.id, {
            usedCapacity: pool.usedCapacity + purchase.quantity,
          });
        }
      }
    }
  }, [purchases, tickets, capacityPools, savePurchases, updateTicket, updateCapacityPool]);

  const updatePurchase = useCallback(async (purchaseId: string, updates: Partial<TicketPurchase>) => {
    const newPurchases = purchases.map((p) =>
      p.id === purchaseId ? { ...p, ...updates } : p
    );
    await savePurchases(newPurchases);
  }, [purchases, savePurchases]);

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
    
    const newBuyers = [...buyers, newBuyer];
    await saveBuyers(newBuyers);
    
    return newBuyer;
  }, [buyers, saveBuyers]);

  const addPurchaseToBuyer = useCallback(async (buyerEmail: string, purchaseId: string) => {
    const newBuyers = buyers.map((b) => {
      if (b.email.toLowerCase() === buyerEmail.toLowerCase()) {
        return {
          ...b,
          purchases: [...b.purchases, purchaseId],
        };
      }
      return b;
    });
    await saveBuyers(newBuyers);
  }, [buyers, saveBuyers]);

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
