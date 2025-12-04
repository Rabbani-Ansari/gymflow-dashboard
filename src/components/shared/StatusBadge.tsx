import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'active' | 'expired' | 'trial' | 'pending' | 'completed' | 'failed';
}

const statusConfig = {
  active: {
    label: 'Active',
    className: 'badge-active',
  },
  expired: {
    label: 'Expired',
    className: 'badge-expired',
  },
  trial: {
    label: 'Trial',
    className: 'badge-trial',
  },
  pending: {
    label: 'Pending',
    className: 'badge-trial',
  },
  completed: {
    label: 'Completed',
    className: 'badge-active',
  },
  failed: {
    label: 'Failed',
    className: 'badge-expired',
  },
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={cn('font-medium', config.className)}>
      {config.label}
    </Badge>
  );
};
