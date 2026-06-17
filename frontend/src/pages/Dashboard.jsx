import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import { useDocuments, useDeleteDocument } from '../hooks/useDocuments.js';
import { SkeletonList } from '../components/Skeleton.jsx';
import ErrorState from '../components/ErrorState.jsx';
import EmptyState from '../components/EmptyState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { errMsg } from '../api/axios.js';

export default function Dashboard() {
  const { data, isLoading, isError, refetch } = useDocuments();
  const del = useDeleteDocument();

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Delete this document? This also removes its chats and embeddings.')) return;
    try {
      await del.mutateAsync(id);
      toast.success('Document deleted');
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Your documents</h1>
          <p className="text-sm text-slate-500">Upload, process and chat with your PDFs.</p>
        </div>
        <Link to="/upload" className="btn-primary">
          + Upload
        </Link>
      </div>

      {isLoading && <SkeletonList count={6} />}
      {isError && <ErrorState message="Could not load documents." onRetry={refetch} />}

      {!isLoading && !isError && (data?.items?.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((doc) => (
            <Link to={`/documents/${doc._id}`} key={doc._id} className="card transition hover:shadow-md">
              <div className="flex items-start justify-between gap-2">
                <h3 className="line-clamp-2 font-semibold text-slate-800">{doc.title}</h3>
                <StatusBadge status={doc.status} />
              </div>
              <p className="mt-2 text-xs text-slate-400">
                {new Date(doc.createdAt).toLocaleDateString()} · {doc.chunkCount || 0} chunks
              </p>
              <div className="mt-4 flex gap-2">
                <span className="btn-ghost flex-1 justify-center text-xs">Open</span>
                <button
                  onClick={(e) => handleDelete(doc._id, e)}
                  className="btn-ghost text-xs text-rose-600"
                >
                  Delete
                </button>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No documents yet"
          description="Upload your first PDF to start asking questions and generating summaries."
          action={<Link to="/upload" className="btn-primary">Upload a PDF</Link>}
        />
      ))}
    </div>
  );
}
