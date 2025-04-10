import { ReactNode } from 'react';
import { usePermissions } from '../hooks/usePermissions';
import type { Permission } from '../types/team';
import { useRouter } from 'next/navigation';

interface PermissionGuardProps {
  children: ReactNode;
  permissions: Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
}

export default function PermissionGuard({
  children,
  permissions,
  requireAll = false,
  fallback = null
}: PermissionGuardProps) {
  const { hasAllPermissions, hasAnyPermission, loading } = usePermissions();
  const router = useRouter();

  if (loading) {
    return <div>Loading...</div>;
  }

  const hasAccess = requireAll
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions);

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    // If no fallback is provided and user doesn't have access,
    // redirect to dashboard
    router.push('/dashboard/client');
    return null;
  }

  return <>{children}</>;
}

// Higher-order component for route protection
export function withPermissions(
  Component: React.ComponentType<any>,
  permissions: Permission[],
  requireAll = false
) {
  return function ProtectedRoute(props: any) {
    return (
      <PermissionGuard permissions={permissions} requireAll={requireAll}>
        <Component {...props} />
      </PermissionGuard>
    );
  };
} 