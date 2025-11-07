import type { UserRole } from '@/types';

export interface Permission {
  canCreateEvents: boolean;
  canEditEvents: boolean;
  canDeleteEvents: boolean;
  canManageAttendees: boolean;
  canCheckInAttendees: boolean;
  canManagePrizes: boolean;
  canManageRaffle: boolean;
  canViewReports: boolean;
  canManageOrganization: boolean;
  canManageUsers: boolean;
  canManageSubscription: boolean;
  canSendMessages: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission> = {
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

export function getPermissions(role: UserRole): Permission {
  return ROLE_PERMISSIONS[role];
}

export function canUserEditEvent(userId: string, eventCreatorId: string, userRole: UserRole): boolean {
  if (userRole === 'super_admin' || userRole === 'seller_admin') {
    return true;
  }
  
  if (userRole === 'collaborator') {
    return true;
  }
  
  return userId === eventCreatorId;
}

export function canUserDeleteEvent(userId: string, eventCreatorId: string, userRole: UserRole): boolean {
  if (userRole === 'super_admin' || userRole === 'seller_admin') {
    return true;
  }
  
  return userId === eventCreatorId;
}
