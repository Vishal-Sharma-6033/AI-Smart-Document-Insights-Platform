const STYLES = {
  uploaded: 'bg-slate-100 text-slate-600',
  processing: 'bg-amber-100 text-amber-700',
  ready: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-rose-100 text-rose-700',
};

export default function StatusBadge({ status }) {
  const cls = STYLES[status] || STYLES.uploaded;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {status === 'processing' && (
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
      )}
      {status}
    </span>
  );
}
