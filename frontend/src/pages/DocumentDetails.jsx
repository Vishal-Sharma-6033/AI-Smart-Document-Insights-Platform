import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import { useDocument } from '../hooks/useDocuments.js';
import { useSummary } from '../hooks/useChat.js';
import StatusBadge from '../components/StatusBadge.jsx';
import { Spinner } from '../components/Spinner.jsx';
import { CardSkeleton } from '../components/Skeleton.jsx';
import ErrorState from '../components/ErrorState.jsx';
import { errMsg } from '../api/axios.js';

export default function DocumentDetails() {
  const { id } = useParams();
  const { data: doc, isLoading, isError, refetch } = useDocument(id);
  const summaryMut = useSummary(id);
  const [summary, setSummary] = useState(null);

  const generateSummary = async () => {
    try {
      const result = await summaryMut.mutateAsync();
      setSummary(result);
    } catch (err) {
      toast.error(errMsg(err, 'Could not generate summary'));
    }
  };

  if (isLoading) return <CardSkeleton />;
  if (isError || !doc) return <ErrorState message="Document not found." onRetry={refetch} />;

  const ready = doc.status === 'ready';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link to="/dashboard" className="text-sm text-brand-600 hover:underline">
            ← Back
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{doc.title}</h1>
          <div className="mt-2 flex items-center gap-3 text-sm text-slate-500">
            <StatusBadge status={doc.status} />
            <span>{doc.pageCount || 0} pages</span>
            <span>{doc.chunkCount || 0} chunks</span>
          </div>
        </div>
        <Link
          to={`/documents/${id}/chat`}
          className={`btn-primary ${ready ? '' : 'pointer-events-none opacity-50'}`}
        >
          💬 Chat with document
        </Link>
      </div>

      {doc.status === 'failed' && (
        <ErrorState message={`Processing failed: ${doc.error || 'unknown error'}`} />
      )}

      {!ready && doc.status !== 'failed' && (
        <div className="card flex items-center gap-3 text-sm text-amber-700">
          <Spinner className="h-4 w-4" /> Document is still processing — this page updates automatically.
        </div>
      )}

      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">AI Summary</h2>
          <button
            onClick={generateSummary}
            className="btn-ghost"
            disabled={!ready || summaryMut.isPending}
          >
            {summaryMut.isPending ? <Spinner /> : summary ? 'Regenerate' : 'Generate summary'}
          </button>
        </div>

        {!summary && !summaryMut.isPending && (
          <p className="text-sm text-slate-500">
            {ready ? 'Generate an AI summary with key insights and action items.' : 'Available once processing completes.'}
          </p>
        )}

        {summary && (
          <div className="space-y-4 text-sm">
            <Section title="Executive Summary">
              <p className="text-slate-600">{summary.executiveSummary}</p>
            </Section>
            <Section title="Key Insights">
              <BulletList items={summary.keyInsights} />
            </Section>
            <Section title="Important Findings">
              <BulletList items={summary.importantFindings} />
            </Section>
            <Section title="Action Items">
              <BulletList items={summary.actionItems} />
            </Section>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="mb-1 font-medium text-slate-700">{title}</h3>
      {children}
    </div>
  );
}

function BulletList({ items = [] }) {
  if (!items.length) return <p className="text-slate-400">—</p>;
  return (
    <ul className="list-inside list-disc space-y-1 text-slate-600">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}
