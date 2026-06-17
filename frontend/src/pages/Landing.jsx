import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const FEATURES = [
  { icon: '📤', title: 'Upload PDFs', desc: 'Securely upload documents and let us handle the rest.' },
  { icon: '⚡', title: 'Async processing', desc: 'Text extraction, chunking and embeddings run in the background.' },
  { icon: '💬', title: 'Ask anything', desc: 'Chat with your documents and get context-aware answers.' },
  { icon: '🧾', title: 'Smart summaries', desc: 'Executive summaries, key insights and action items in one click.' },
];

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <span className="flex items-center gap-2 text-lg font-bold text-brand-700">
          🧠 Smart Docs
        </span>
        <div className="flex gap-2">
          <Link to={isAuthenticated ? '/dashboard' : '/login'} className="btn-ghost">
            {isAuthenticated ? 'Dashboard' : 'Login'}
          </Link>
          {!isAuthenticated && (
            <Link to="/register" className="btn-primary">
              Get started
            </Link>
          )}
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Turn your documents into <span className="text-brand-600">conversations</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-slate-600">
          Upload a PDF and instantly ask questions, generate summaries, and surface insights —
          powered by Retrieval-Augmented Generation.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to={isAuthenticated ? '/dashboard' : '/register'} className="btn-primary px-6 py-3">
            {isAuthenticated ? 'Go to dashboard' : 'Start for free'}
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-4 pb-24 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <div key={f.title} className="card">
            <div className="mb-2 text-2xl">{f.icon}</div>
            <h3 className="font-semibold text-slate-800">{f.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
