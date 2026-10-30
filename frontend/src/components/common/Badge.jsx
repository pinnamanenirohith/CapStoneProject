const styles = {
  deployed: 'bg-green-100 text-green-700',
  running:  'bg-green-100 text-green-700',
  pending:  'bg-yellow-100 text-yellow-700',
  failed:   'bg-red-100 text-red-700',
  stopped:  'bg-slate-100 text-slate-600',
  online:   'bg-green-100 text-green-700',
  offline:  'bg-red-100 text-red-700',
};

export default function Badge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'deployed' || status === 'running' || status === 'online' ? 'bg-green-500' : status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
