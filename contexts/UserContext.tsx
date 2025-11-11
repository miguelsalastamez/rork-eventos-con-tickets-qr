import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { User, UserRole, Organization, Permission, FeatureLimits, SubscriptionTier } from '@/types';

const USER_KEY = '@user';
const TOKEN_KEY = '@auth_token';
const ORGANIZATIONS_KEY = '@organizations';

const ROLE_PERMISSIONS: Record<UserRole, Permission> = {
  super_admin: {
    canCreateEvents: true,
    canEditEvents: true,
    canDeleteEvents: true,
    canManageAttendees: true,
    canCheckInAttendees: true,
    canManagePrizes: true,
    canManageRaffle: true,
    canViewReports: true,
    canManageOrganization: true,
    canManageUsers: true,
    canManageSubscription: true,
    canSendMessages: true,
  },
  seller_admin: {
    canCreateEvents: true,
    canEditEvents: true,
    canDeleteEvents: true,
    canManageAttendees: true,
    canCheckInAttendees: true,
    canManagePrizes: true,
    canManageRaffle: true,
    canViewReports: true,
    canManageOrganization: true,
    canManageUsers: true,
    canManageSubscription: true,
    canSendMessages: true,
  },
  collaborator: {
    canCreateEvents: false,
    canEditEvents: true,
    canDeleteEvents: false,
    canManageAttendees: true,
    canCheckInAttendees: true,
    canManagePrizes: true,
    canManageRaffle: true,
    canViewReports: true,
    canManageOrganization: false,
    canManageUsers: false,
    canManageSubscription: false,
    canSendMessages: true,
  },
  viewer: {
    canCreateEvents: false,
    canEditEvents: false,
    canDeleteEvents: false,
    canManageAttendees: false,
    canCheckInAttendees: false,
    canManagePrizes: false,
    canManageRaffle: false,
    canViewReports: true,
    canManageOrganization: false,
    canManageUsers: false,
    canManageSubscription: false,
    canSendMessages: false,
  },
};

const TIER_LIMITS: Record<SubscriptionTier, FeatureLimits> = {
  free: {
    maxEvents: 1,
    maxAttendeesPerEvent: 50,
    hasEmailSupport: false,
    hasWhatsAppSupport: false,
    hasAdvancedReports: false,
    hasCustomBranding: false,
    hasPrioritySupport: false,
  },
  pro: {
    maxEvents: 999999,
    maxAttendeesPerEvent: 999999,
    hasEmailSupport: true,
    hasWhatsAppSupport: true,
    hasAdvancedReports: true,
    hasCustomBranding: true,
    hasPrioritySupport: true,
  },
};

export const [UserProvider, useUser] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('free');

  const loadData = useCallback(async () => {
    try {
      const [userData, tokenData, orgsData, tierData] = await Promise.all([
        AsyncStorage.getItem(USER_KEY),
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(ORGANIZATIONS_KEY),
        AsyncStorage.getItem('@subscription_tier'),
      ]);

      if (userData) setUser(JSON.parse(userData));
      if (tokenData) setAuthToken(tokenData);
      if (orgsData) setOrganizations(JSON.parse(orgsData));
      if (tierData) setSubscriptionTier(tierData as SubscriptionTier);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const saveUser = useCallback(async (userData: User, token?: string) => {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      if (token) {
        await AsyncStorage.setItem(TOKEN_KEY, token);
        setAuthToken(token);
      }
      setUser(userData);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  }, []);

  const saveOrganizations = useCallback(async (orgs: Organization[]) => {
    try {
      await AsyncStorage.setItem(ORGANIZATIONS_KEY, JSON.stringify(orgs));
      setOrganizations(orgs);
    } catch (error) {
      console.error('Error saving organizations:', error);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([USER_KEY, TOKEN_KEY]);
      setUser(null);
      setAuthToken(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }, []);

  const createDemoUser = useCallback(async (role: UserRole = 'seller_admin', organizationId?: string) => {
    const demoUser: User = {
      id: `user-${Date.now()}`,
      email: 'demo@example.com',
      fullName: 'Demo User',
      phone: undefined,
      role,
      organizationId,
      createdAt: new Date().toISOString(),
    };
    await saveUser(demoUser);
    return demoUser;
  }, [saveUser]);

  const setUserRole = useCallback(async (role: UserRole) => {
    if (!user) {
      console.log('No user found, creating demo user with role:', role);
      const demoUser = await createDemoUser(role);
      return demoUser;
    }
    console.log('Updating user role to:', role);
    const updatedUser = { ...user, role };
    await saveUser(updatedUser);
    return updatedUser;
  }, [user, saveUser, createDemoUser]);

  const addOrganization = useCallback(async (org: Organization) => {
    const newOrgs = [...organizations, org];
    await saveOrganizations(newOrgs);
  }, [organizations, saveOrganizations]);

  const updateOrganization = useCallback(async (orgId: string, updates: Partial<Organization>) => {
    const newOrgs = organizations.map((o) =>
      o.id === orgId ? { ...o, ...updates, updatedAt: new Date().toISOString() } : o
    );
    await saveOrganizations(newOrgs);
  }, [organizations, saveOrganizations]);

  const deleteOrganization = useCallback(async (orgId: string) => {
    const newOrgs = organizations.filter((o) => o.id !== orgId);
    await saveOrganizations(newOrgs);
  }, [organizations, saveOrganizations]);

  const updateSubscriptionTier = useCallback(async (tier: SubscriptionTier) => {
    try {
      await AsyncStorage.setItem('@subscription_tier', tier);
      setSubscriptionTier(tier);
    } catch (error) {
      console.error('Error updating subscription tier:', error);
    }
  }, []);

  const permissions = useMemo<Permission>(() => {
    if (!user) {
      return ROLE_PERMISSIONS.viewer;
    }
    return ROLE_PERMISSIONS[user.role];
  }, [user]);

  const featureLimits = useMemo<FeatureLimits>(() => {
    return TIER_LIMITS[subscriptionTier];
  }, [subscriptionTier]);

  const currentOrganization = useMemo(() => {
    if (!user?.organizationId) return null;
    return organizations.find((o) => o.id === user.organizationId) || null;
  }, [user, organizations]);

  const canAccessFeature = useCallback((feature: keyof FeatureLimits): boolean => {
    return featureLimits[feature] as boolean;
  }, [featureLimits]);

  return useMemo(() => ({
    user,
    authToken,
    organizations,
    currentOrganization,
    isLoading,
    permissions,
    featureLimits,
    subscriptionTier,
    setUserRole,
    createDemoUser,
    saveUser,
    logout,
    addOrganization,
    updateOrganization,
    deleteOrganization,
    updateSubscriptionTier,
    canAccessFeature,
  }), [user, authToken, organizations, currentOrganization, isLoading, permissions, featureLimits, subscriptionTier, setUserRole, createDemoUser, saveUser, logout, addOrganization, updateOrganization, deleteOrganization, updateSubscriptionTier, canAccessFeature]);
});
