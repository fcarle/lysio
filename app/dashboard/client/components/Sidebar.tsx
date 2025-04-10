'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Search, 
  FolderOpen, 
  Settings,
  MessageSquare
} from 'lucide-react';
import { usePermissions } from '../hooks/usePermissions';
import type { Permission } from '../types/team';

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  requiredPermissions: Permission[];
}

const navigation: NavigationItem[] = [
  { 
    name: 'Dashboard', 
    href: '/dashboard/client', 
    icon: LayoutDashboard,
    requiredPermissions: ['view_dashboard']
  },
  { 
    name: 'Team', 
    href: '/dashboard/client/team', 
    icon: Users,
    requiredPermissions: ['view_team']
  },
  { 
    name: 'Lysio Network', 
    href: '/dashboard/client/find', 
    icon: Search,
    requiredPermissions: ['view_services']
  },
  { 
    name: 'Projects', 
    href: '/dashboard/client/projects', 
    icon: FolderOpen,
    requiredPermissions: ['view_projects']
  },
  { 
    name: 'Settings', 
    href: '/dashboard/client/settings', 
    icon: Settings,
    requiredPermissions: ['view_settings']
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const { hasAnyPermission, loading } = usePermissions();

  if (loading) {
    return (
      <aside className="flex h-[calc(100vh-64px)] w-64 flex-col bg-white border-r border-gray-200">
        <div className="flex h-16 items-center px-6 border-b border-gray-200">
          <h1 className="text-xl font-semibold">Client Dashboard</h1>
        </div>
        <nav className="flex-1 space-y-1 px-4 py-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-10 bg-gray-100 rounded-md animate-pulse mb-2"
            />
          ))}
        </nav>
      </aside>
    );
  }

  const allowedNavigation = navigation.filter(item => 
    hasAnyPermission(item.requiredPermissions)
  );

  return (
    <aside className="flex h-[calc(100vh-64px)] w-64 flex-col bg-white border-r border-gray-200">
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <h1 className="text-xl font-semibold">Client Dashboard</h1>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-4">
        {allowedNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 flex-shrink-0 ${
                  isActive ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
                }`}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
} 