import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type AlertType = 'error' | 'warning' | 'success' | 'info';

interface AlertProps {
  type: AlertType;
  message: string | React.ReactNode;
  className?: string;
}

const alertStyles = {
  error: 'bg-red-50 border-red-100 text-red-700',
  warning: 'bg-yellow-50 border-yellow-100 text-yellow-700',
  success: 'bg-green-50 border-green-100 text-green-700',
  info: 'bg-blue-50 border-blue-100 text-blue-700',
};

const alertIcons = {
  error: XCircle,
  warning: AlertTriangle,
  success: CheckCircle,
  info: Info,
};

const iconColors = {
  error: 'text-red-400',
  warning: 'text-yellow-400',
  success: 'text-green-400',
  info: 'text-blue-400',
};

export function Alert({ type, message, className = '' }: AlertProps) {
  const Icon = alertIcons[type];
  
  return (
    <div className={cn(`rounded-md p-4 border ${alertStyles[type]}`, className)}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${iconColors[type]}`} />
        </div>
        <div className="ml-3">
          <p className="text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
} 