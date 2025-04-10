import { ReactNode } from 'react';
import { usePermissions } from '../hooks/usePermissions';
import type { Permission } from '../types/team';

interface PermissionControlProps {
  children: ReactNode;
  permissions: Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
  showError?: boolean;
}

export default function PermissionControl({
  children,
  permissions,
  requireAll = false,
  fallback = null,
  showError = false
}: PermissionControlProps) {
  const { hasAllPermissions, hasAnyPermission } = usePermissions();

  const hasAccess = requireAll
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions);

  if (!hasAccess) {
    if (showError) {
      return (
        <div className="text-sm text-red-500">
          You don't have permission to access this feature.
        </div>
      );
    }
    return fallback;
  }

  return <>{children}</>;
}

// Utility function to check if a feature should be enabled
export function useFeaturePermission(permission: Permission | Permission[], requireAll = false) {
  const { hasAllPermissions, hasAnyPermission, loading } = usePermissions();

  const permissions = Array.isArray(permission) ? permission : [permission];
  const hasAccess = requireAll
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions);

  return {
    hasAccess,
    loading
  };
} 