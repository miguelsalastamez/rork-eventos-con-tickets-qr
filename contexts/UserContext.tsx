import { useCallback, useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { User, UserRole, Organization, Permission, FeatureLimits, SubscriptionTier } from '@/types';
import { trpc } from '@/lib/trpc';

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
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: 1,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000,
  });
  const organizationsQuery = trpc.organizations.list.useQuery(undefined, {
    retry: 1,
    retryDelay: 1000,
    enabled: !!meQuery.data,
  });

  const user = meQuery.data || null;
  const organizations = organizationsQuery.data || [];
  const isLoading = meQuery.isLoading || organizationsQuery.isLoading;
  const subscriptionTier: SubscriptionTier = 'free';
  const authToken: string | null = null;

  const utils = trpc.useUtils();

  const updateProfileMutation = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
    },
  });

  const createOrganizationMutation = trpc.organizations.create.useMutation({
    onSuccess: () => {
      utils.organizations.list.invalidate();
    },
  });

  const updateOrganizationMutation = trpc.organizations.update.useMutation({
    onSuccess: () => {
      utils.organizations.list.invalidate();
    },
  });

  const deleteOrganizationMutation = trpc.organizations.delete.useMutation({
    onSuccess: () => {
      utils.organizations.list.invalidate();
    },
  });

  const saveUser = useCallback(async (userData: User, token?: string) => {
    await updateProfileMutation.mutateAsync({
      fullName: userData.fullName,
      phone: userData.phone,
    });
  }, [updateProfileMutation]);

  const logout = useCallback(async () => {
    utils.auth.me.reset();
    utils.organizations.list.reset();
  }, [utils]);

  const createDemoUser = useCallback(async (role: UserRole = 'seller_admin', organizationId?: string) => {
    console.log('Creating demo user with role:', role);
    const demoUser: User = {
      id: `user-${Date.now()}`,
      email: 'demo@example.com',
      fullName: 'Demo User',
      phone: undefined,
      role,
      organizationId,
      createdAt: new Date().toISOString(),
    };
    return demoUser;
  }, []);

  const setUserRole = useCallback(async (role: UserRole) => {
    if (!user) {
      console.log('No user found, creating demo user with role:', role);
      const demoUser = await createDemoUser(role);
      return demoUser;
    }
    console.log('Updating user role to:', role);
    await updateProfileMutation.mutateAsync({
      role,
    });
    return { ...user, role };
  }, [user, createDemoUser, updateProfileMutation]);

  const addOrganization = useCallback(async (org: Organization) => {
    await createOrganizationMutation.mutateAsync(org);
  }, [createOrganizationMutation]);

  const updateOrganization = useCallback(async (orgId: string, updates: Partial<Organization>) => {
    await updateOrganizationMutation.mutateAsync({ id: orgId, ...updates });
  }, [updateOrganizationMutation]);

  const deleteOrganization = useCallback(async (orgId: string) => {
    await deleteOrganizationMutation.mutateAsync({ id: orgId });
  }, [deleteOrganizationMutation]);

  const updateSubscriptionTier = useCallback(async (tier: SubscriptionTier) => {
    console.log('Subscription tier update not yet implemented in backend');
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
