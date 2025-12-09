type Status = 'pending' | 'active' | 'completed' | 'rejected' | 'approved' | 'in_progress';

const statusConfig: Record<Status, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  active: { label: 'Active', color: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800' },
  in_progress: { label: 'In Progress', color: 'bg-purple-100 text-purple-800' },
};

export function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status] || statusConfig.pending;
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}
