import { useAuth } from '../context/AuthContext.jsx';
import { useDocuments } from '../hooks/useDocuments.js';

export default function Profile() {
  const { user } = useAuth();
  const { data } = useDocuments();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Profile</h1>

      <div className="card space-y-4">
        <Row label="Name" value={user?.name} />
        <Row label="Email" value={user?.email} />
        <Row label="Role" value={user?.role} />
        <Row
          label="Member since"
          value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
        />
      </div>

      <div className="card">
        <h2 className="mb-3 font-semibold text-slate-800">Usage</h2>
        <div className="grid grid-cols-2 gap-4">
          <Stat label="Documents" value={data?.total ?? 0} />
          <Stat
            label="Ready"
            value={(data?.items || []).filter((d) => d.status === 'ready').length}
          />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between border-b border-slate-100 pb-2 text-sm last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value || '—'}</span>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4 text-center">
      <div className="text-2xl font-bold text-brand-600">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}
